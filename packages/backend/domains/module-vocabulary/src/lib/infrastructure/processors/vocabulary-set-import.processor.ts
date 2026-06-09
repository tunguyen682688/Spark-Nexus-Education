import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { VocabularySetCreationOrchestrator } from '../../domain/sagas/vocabulary-set-creation-orchestrator';
import { VocabularySetAggregate } from '../../domain/aggregates/vocabulary-set.aggregate';
import * as vocabularySetRepositoryInterface from '../../domain/repositories/vocabulary-set.repository.interface';
import { VOCABULARY_SET_REPOSITORY } from '../../domain/repositories/vocabulary-set.repository.interface';

/**
 * Background Job Data
 */
interface VocabularySetImportJobData {
  vocabularySetId: string;
  words: Array<{
    word: string;
    definition?: string;
    example?: string;
    notes?: string;
  }>;
  language: string;
  userId: string;
}

/**
 * VocabularySetImportProcessor
 *
 * Background job processor for importing words into vocabulary set
 * Uses BullMQ with Redis for queue management
 *
 * Handles:
 * - Large batch imports (>50 words)
 * - Progress tracking
 * - Error handling and retries
 */
@Processor('vocabulary-set-import')
export class VocabularySetImportProcessor extends WorkerHost {
  private readonly logger = new Logger(VocabularySetImportProcessor.name);

  constructor(
    private readonly orchestrator: VocabularySetCreationOrchestrator,
    @Inject(VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository
  ) {
    super();
  }

  async process(job: Job<VocabularySetImportJobData>): Promise<void> {
    const { vocabularySetId, words, language } = job.data;

    this.logger.log(
      `Processing import job ${job.id} for vocabulary set ${vocabularySetId} with ${words.length} words`
    );

    try {
      // Step 1: Load vocabulary set
      const vocabularySet = await this.vocabularySetRepository.findById(
        vocabularySetId
      );
      if (!vocabularySet) {
        throw new Error(`Vocabulary set ${vocabularySetId} not found`);
      }

      // Step 2: Update import status to processing
      vocabularySet.setImportStatus('processing');
      vocabularySet.setImportProgress({
        total: words.length,
        processed: 0,
        failed: 0,
      });
      await this.vocabularySetRepository.update(vocabularySet);

      // Step 3: Process words in chunks for better progress tracking
      const chunkSize = 50;
      const chunks = this.chunkArray(words, chunkSize);
      let totalProcessed = 0;
      const failedItems: Array<{ word: string; reason: string }> = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
          // Create aggregate for this chunk (reload set to get latest state)
          const currentSet = await this.vocabularySetRepository.findById(
            vocabularySetId
          );
          if (!currentSet) {
            throw new Error(`Vocabulary set ${vocabularySetId} not found`);
          }

          const aggregate = VocabularySetAggregate.fromPersistence(
            currentSet,
            [] // Items will be added by saga
          );

          // Process chunk using orchestrator
          await this.orchestrator.execute(aggregate, chunk, language);

          totalProcessed += chunk.length;

          // Update progress
          vocabularySet.updateImportProgress(
            totalProcessed,
            failedItems.length,
            failedItems.length > 0 ? failedItems : undefined
          );
          await this.vocabularySetRepository.update(vocabularySet);

          // Update job progress
          await job.updateProgress({
            processed: totalProcessed,
            total: words.length,
            percentage: Math.round((totalProcessed / words.length) * 100),
          });

          this.logger.log(
            `Processed chunk ${i + 1}/${
              chunks.length
            } for vocabulary set ${vocabularySetId}`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to process chunk ${
              i + 1
            } for vocabulary set ${vocabularySetId}`,
            error
          );

          // Mark chunk words as failed
          for (const word of chunk) {
            failedItems.push({
              word: word.word,
              reason: errorMessage,
            });
          }
        }
      }

      // Step 5: Mark import as completed
      vocabularySet.markImportCompleted();
      await this.vocabularySetRepository.update(vocabularySet);

      this.logger.log(
        `Import job ${job.id} completed: ${totalProcessed}/${words.length} words processed, ${failedItems.length} failed`
      );
    } catch (error) {
      this.logger.error(
        `Import job ${job.id} failed for vocabulary set ${vocabularySetId}`,
        error
      );

      // Mark import as failed
      const vocabularySet = await this.vocabularySetRepository.findById(
        vocabularySetId
      );
      if (vocabularySet) {
        vocabularySet.markImportFailed(
          error instanceof Error ? error.message : 'Unknown error'
        );
        await this.vocabularySetRepository.update(vocabularySet);
      }

      throw error; // Re-throw to trigger retry
    }
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
