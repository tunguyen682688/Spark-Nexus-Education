import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';

@Processor('certification-tasks')
export class CertificationProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificationProcessor.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`Processing background job ${job.id} of type "${job.name}"`);

    switch (job.name) {
      case 'process-exam-analytics':
        await this.handleExamAnalytics(job as Job<{
          sessionId: string;
          examId: string;
          userId: string;
          score: number;
          passed: boolean;
          submittedAt: string;
        }>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        break;
    }
  }

  private async handleExamAnalytics(job: Job<{
    sessionId: string;
    examId: string;
    userId: string;
    score: number;
    passed: boolean;
    submittedAt: string;
  }>): Promise<void> {
    const { sessionId, examId, userId, score, passed, submittedAt } = job.data;
    this.logger.log(
      `[Worker] Processing exam analytics for user ${userId}, session ${sessionId}. Score: ${score}, passed: ${passed}, submitted at: ${submittedAt}`
    );

    // Fetch related models
    const exam = await this.repository.findExamById(examId);
    if (exam) {
      this.logger.log(
        `[Worker] Exam Title: "${exam.getTitle()}", total questions: ${exam.getTotalQuestions()}`
      );
    }

    // Heavy background analytics can be calculated here (e.g. updating user statistics snapshots, XP progress).
    this.logger.log(`[Worker] Background exam completion analytics completed for session ${sessionId}`);
  }
}
