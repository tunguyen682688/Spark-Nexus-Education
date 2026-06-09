import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { SubmitExamAttemptCommand } from './submit-exam-attempt.command';
import { Inject, NotFoundException } from '@nestjs/common';
import * as grammarExamRepositoryInterface from '../../../domain/repositories/grammar-exam.repository.interface';
import * as grammarStreakRepositoryInterface from '../../../domain/repositories/grammar-streak.repository.interface';
import { ExamAttemptSubmittedEvent } from '../../../domain/events/exam-attempt-submitted.event';

@CommandHandler(SubmitExamAttemptCommand)
export class SubmitExamAttemptHandler
  implements ICommandHandler<SubmitExamAttemptCommand, any>
{
  constructor(
    @Inject(grammarExamRepositoryInterface.GRAMMAR_EXAM_REPOSITORY)
    private readonly examRepository: grammarExamRepositoryInterface.IGrammarExamRepository,
    @Inject(grammarStreakRepositoryInterface.GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: grammarStreakRepositoryInterface.IGrammarStreakRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SubmitExamAttemptCommand): Promise<any> {
    const { userId, id, correctCount, totalCount } = command;
    const set = await this.examRepository.findExamSetById(id);
    if (!set) {
      throw new NotFoundException('Không tìm thấy bộ đề thi yêu cầu.');
    }

    const total = totalCount > 0 ? totalCount : 1;
    const proficiency = Math.round((correctCount / total) * 100);
    const isPassed = proficiency >= 80;

    const existingProgress =
      await this.examRepository.findUserExamProgressSingle(userId, id);
    const isNewPass =
      isPassed && (!existingProgress || !existingProgress.isPassed);

    await this.examRepository.upsertUserExamProgress(userId, id, {
      bestScore: Math.max(proficiency, existingProgress?.bestScore || 0),
      isPassed: isPassed || existingProgress?.isPassed || false,
    });

    let xpEarned = correctCount * 15;
    if (isNewPass) {
      xpEarned += 100;
    } else {
      xpEarned += 30;
    }

    await this.streakRepository.incrementXP(userId, xpEarned);

    let newCertificateIssued = false;
    let issuedCertificate: any = null;

    if (isPassed) {
      const level = set.level;
      const examType = set.examType;

      const siblingSets = await this.examRepository.findExamSets({
        level,
        examType,
        status: 'APPROVED',
      });

      const userProgress = await this.examRepository.findUserExamProgress(
        userId,
        siblingSets.map((s) => s.id)
      );

      const allPassed = siblingSets.every((s) => {
        const p = userProgress.find((up) => up.examSetId === s.id);
        return p && p.isPassed;
      });

      if (allPassed) {
        const existingCert =
          await this.examRepository.findCertificateByLevelAndType(
            userId,
            level,
            examType
          );

        if (!existingCert) {
          const randomHash = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          const serialNumber = `CERT-SNE-${examType.toUpperCase()}-${level.toUpperCase()}-${randomHash}`;

          issuedCertificate = await this.examRepository.createCertificate(
            userId,
            level,
            examType,
            serialNumber,
            {
              issuedTo: 'Học viên danh dự',
              bestScore: proficiency,
              totalExamsCleared: siblingSets.length,
            }
          );
          newCertificateIssued = true;
        }
      }
    }

    // Publish event
    await this.eventBus.publish(
      new ExamAttemptSubmittedEvent(userId, id, proficiency, isPassed, xpEarned)
    );

    return {
      success: true,
      proficiency,
      isPassed,
      xpEarned,
      newCertificateIssued,
      certificate: issuedCertificate,
    };
  }
}
