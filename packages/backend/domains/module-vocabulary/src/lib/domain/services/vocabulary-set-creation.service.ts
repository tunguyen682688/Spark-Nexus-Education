import { Inject, Injectable, Logger } from '@nestjs/common';
import * as entryRepositoryInterface from '../repositories/entry.repository.interface';

/**
 * Word Processing Result
 */
export interface WordProcessingResult {
  word: string;
  entryId: string;
  isNew: boolean;
  needsApproval: boolean;
  definition?: string | null;
  example?: string | null;
  partOfSpeech?: string | null;
}

/**
 * VocabularySetCreationService
 *
 * Domain Service chịu trách nhiệm xử lý business logic phức tạp cho việc tạo vocabulary set:
 *
 * Business Rules:
 * 1. Nếu từ vựng đã tồn tại trong database (isPublished = true):
 *    → Gắn trực tiếp vào vocabulary set item
 *
 * 2. Nếu từ vựng chưa tồn tại hoặc chưa được publish:
 *    → Tạo entry mới với isDraft = true, isPublished = false
 *    → Cần được duyệt (approval) trước khi public cho cộng đồng
 *    → Vẫn có thể gắn vào vocabulary set item (private use)
 *
 * 3. Batch processing để tối ưu performance
 */
@Injectable()
export class VocabularySetCreationService {
  private readonly logger = new Logger(VocabularySetCreationService.name);

  constructor(
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository
  ) {
    this.entryRepository = entryRepository;
  }

  /**
   * Process words and determine which are existing vs new
   * Returns map of word -> processing result
   */
  async processWords(
    words: Array<{
      word: string;
      definition?: string;
      example?: string;
      notes?: string;
      partOfSpeech?: string;
    }>,
    language: string
  ): Promise<Map<string, WordProcessingResult>> {
    const result = new Map<string, WordProcessingResult>();

    if (words.length === 0) {
      return result;
    }

    // Step 1: Batch find existing entries
    const wordList = words.map((w) => w.word.trim().toLowerCase());
    const existingEntries = await this.entryRepository.findByWords(
      wordList,
      language
    );

    // Create map for quick lookup
    const existingMap = new Map(
      existingEntries.map((e) => [e.word.toLowerCase(), e])
    );

    // Step 2: Process each word
    // Optimized: No need to call findById again - we already have the data from findByWords
    for (const wordInput of words) {
      const word = wordInput.word.trim();
      const wordLower = word.toLowerCase();
      const existing = existingMap.get(wordLower);

      if (existing) {
        // Word exists - use data from findByWords (already includes definition/example)
        // But prefer partOfSpeech from input if provided
        result.set(wordLower, {
          word: word,
          entryId: existing.id,
          isNew: false,
          needsApproval: false, // Already exists
          definition: existing.definition,
          example: existing.example,
          partOfSpeech: wordInput.partOfSpeech || existing.partOfSpeech || null,
        });
      } else {
        // Word doesn't exist - will create new entry
        result.set(wordLower, {
          word: word,
          entryId: '', // Will be generated when creating
          isNew: true,
          needsApproval: true, // New entries need approval
          definition: wordInput.definition,
          example: wordInput.example,
          partOfSpeech: wordInput.partOfSpeech || null,
        });
      }
    }

    return result;
  }

  /**
   * Create new entries for words that don't exist
   * Returns map of word -> entryId
   */
  async createNewEntries(
    wordsToCreate: Array<{
      word: string;
      definition?: string;
      example?: string;
    }>,
    language: string
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();

    for (const wordData of wordsToCreate) {
      try {
        // Create entry with draft status (needs approval)
        const created = await this.entryRepository.createBasicEntry({
          word: wordData.word,
          language: language,
          definition: wordData.definition,
          example: wordData.example,
        });

        result.set(wordData.word.toLowerCase(), created.id);

        this.logger.log(
          `Created new entry: ${wordData.word} (${created.id}) - Status: DRAFT (needs approval)`
        );
      } catch (error) {
        this.logger.error(
          `Failed to create entry for word: ${wordData.word}`,
          error
        );
        // Continue with other words
      }
    }

    return result;
  }
}
