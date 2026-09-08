import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { CertificationCacheService } from '../cache/certification-cache.service';

const SCORE_KEY_PREFIX = 'certification:score:';
const SCORE_TTL = 3600;

interface ScoreResult {
  sessionId: string;
  examId: string;
  userId: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  bandScore: number | null;
  passed: boolean;
  sectionScores: Array<{
    sectionId: string;
    sectionTitle: string;
    correctCount: number;
    totalQuestions: number;
    points: number;
    maxPoints: number;
  }>;
  status: 'scoring' | 'completed' | 'failed';
}

@Processor('certification-scoring')
export class CertificationScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificationScoringProcessor.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly cacheService: CertificationCacheService,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`[Scoring] Processing job ${job.id} "${job.name}"`);

    switch (job.name) {
      case 'calculate-exam-score':
        await this.handleCalculateScore(job as Job<{
          sessionId: string;
          examId: string;
          userId: string;
        }>);
        break;
      default:
        this.logger.warn(`[Scoring] Unknown job name: ${job.name}`);
        break;
    }
  }

  private async handleCalculateScore(job: Job<{
    sessionId: string;
    examId: string;
    userId: string;
  }>): Promise<void> {
    const { sessionId, examId, userId } = job.data;
    const scoreKey = `${SCORE_KEY_PREFIX}${sessionId}`;

    try {
      this.logger.log(`[Scoring] Calculating score for session ${sessionId}, exam ${examId}`);

      await this.cacheService.set(scoreKey, {
        sessionId, examId, userId,
        totalPoints: 0, maxPoints: 0, percentage: 0,
        bandScore: null, passed: false, sectionScores: [],
        status: 'scoring',
      } as ScoreResult, SCORE_TTL);

      const exam = await this.repository.findExamById(examId);
      if (!exam) {
        throw new Error(`Exam ${examId} not found for scoring`);
      }

      const sections = await this.repository.findSectionsByExamId(examId);
      const examSession = await this.repository.findSessionById(sessionId);
      if (!examSession) {
        throw new Error(`Exam session ${sessionId} not found`);
      }

      const sessionAnswers = await this.repository.findAnswersBySessionId(sessionId);

      // Build answer map: questionId → chosen choiceIds
      const answerMap = new Map<string, string[]>();
      for (const answer of sessionAnswers) {
        answerMap.set(answer.getQuestionId(), answer.getChoiceIds());
      }

      let totalPoints = 0;
      let maxPoints = 0;
      const sectionScores: ScoreResult['sectionScores'] = [];

      for (const section of sections) {
        const sectionQuestions = await this.repository.findExamQuestionsByExamIdAndSectionId(examId, section.id);
        let sectionCorrect = 0;
        let sectionPoints = 0;
        let sectionMaxPoints = 0;

        for (const eq of sectionQuestions) {
          const points = eq.getPoints() || 1;
          sectionMaxPoints += points;
          maxPoints += points;

          const selectedChoiceIds = answerMap.get(eq.getQuestionId());
          if (selectedChoiceIds && selectedChoiceIds.length > 0) {
            const choices = await this.repository.findChoicesByQuestionId(eq.getQuestionId());
            const correctChoice = choices.find((c) => c.getIsCorrect());
            if (correctChoice && selectedChoiceIds.includes(correctChoice.id)) {
              sectionCorrect++;
              sectionPoints += points;
              totalPoints += points;
            }
          }
        }

        sectionScores.push({
          sectionId: section.id,
          sectionTitle: section.getTitle(),
          correctCount: sectionCorrect,
          totalQuestions: sectionQuestions.length,
          points: sectionPoints,
          maxPoints: sectionMaxPoints,
        });

        const pct = Math.round((sectionScores.length / sections.length) * 100);
        await job.updateProgress(pct);
      }

      const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
      const passScore = exam.getPassScore() || 450;
      const maxScore = exam.getMaxScore() || 990;
      const bandScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * maxScore) : 0;
      const passed = bandScore >= passScore;

      // Mark session as completed
      examSession.complete();
      await this.repository.saveSession(examSession);

      const scoreResult: ScoreResult = {
        sessionId, examId, userId,
        totalPoints, maxPoints, percentage,
        bandScore, passed, sectionScores,
        status: 'completed',
      };
      await this.cacheService.set(scoreKey, scoreResult, SCORE_TTL);

      await job.updateProgress(100);
      this.logger.log(`[Scoring] Session ${sessionId} scored: ${bandScore}/${maxScore} (${percentage}%) ${passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      this.logger.error(`[Scoring] Failed to score session ${sessionId}`, error);
      await this.cacheService.set(scoreKey, {
        sessionId, examId, userId,
        totalPoints: 0, maxPoints: 0, percentage: 0,
        bandScore: null, passed: false, sectionScores: [],
        status: 'failed',
      } as ScoreResult, SCORE_TTL);
      throw error;
    }
  }
}
