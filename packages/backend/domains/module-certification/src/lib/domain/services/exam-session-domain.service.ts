import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as certificationRepoInterface from '../repositories/certification.repository.interface';
import { ExamResultEntity } from '../entities/exam-result.entity';
import { SessionAnswerEntity } from '../entities/session-answer.entity';

@Injectable()
export class ExamSessionDomainService {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly certificationRepo: certificationRepoInterface.ICertificationRepository
  ) {}

  /**
   * Evaluates answers and completes an active exam session.
   * This is pure domain logic and does not contain any direct database/ORM calls.
   */
  async completeSession(sessionId: string): Promise<ExamResultEntity> {
    // 1. Fetch Session
    const session = await this.certificationRepo.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundException(`Exam Session with ID ${sessionId} not found`);
    }

    if (session.getStatus() === 'completed') {
      throw new BadRequestException(`Session ${sessionId} is already completed`);
    }

    // 2. Fetch Exam details
    const exam = await this.certificationRepo.findExamById(session.getExamId());
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${session.getExamId()} not found`);
    }

    // 3. Fetch Questions and User Answers
    const examQuestions = await this.certificationRepo.findExamQuestionsByExamId(exam.id);
    const userAnswers = await this.certificationRepo.findAnswersBySessionId(session.id);

    let totalScore = 0;

    // 4. Evaluate each question
    for (const examQuestion of examQuestions) {
      const qId = examQuestion.getQuestionId();
      const choices = await this.certificationRepo.findChoicesByQuestionId(qId);
      
      const correctChoiceIds = choices
        .filter((c) => c.getIsCorrect() === true)
        .map((c) => c.id)
        .sort();

      const userAnswer = userAnswers.find((a) => a.getQuestionId() === qId);

      if (userAnswer) {
        const userChoiceIds = [...userAnswer.getChoiceIds()].sort();

        const isCorrect = correctChoiceIds.length > 0 &&
          userChoiceIds.length === correctChoiceIds.length &&
          userChoiceIds.every((id, idx) => id === correctChoiceIds[idx]);

        const pointsAwarded = isCorrect ? examQuestion.getPoints() : 0;
        
        if (isCorrect) {
          totalScore += pointsAwarded;
        }

        // Update answer with evaluation details
        const mutatedAnswer = SessionAnswerEntity.create({
          id: userAnswer.id,
          sessionId: userAnswer.getSessionId(),
          questionId: userAnswer.getQuestionId(),
          answerText: userAnswer.getAnswerText(),
          choiceIds: userAnswer.getChoiceIds(),
          isCorrect,
          points: pointsAwarded,
          createdBy: userAnswer.getCreatedBy(),
          updatedBy: userAnswer.getUpdatedBy(),
          createdAt: userAnswer.createdAt,
          updatedAt: new Date(),
        });
        
        await this.certificationRepo.saveSessionAnswer(mutatedAnswer);
      }
    }

    // 5. Update session status
    session.complete();
    await this.certificationRepo.saveSession(session);

    // 6. Create and save the Exam Result
    const passed = totalScore >= exam.getPassScore();
    const result = ExamResultEntity.create({
      id: randomUUID(),
      sessionId: session.id,
      examId: exam.id,
      userId: session.getUserId(),
      totalScore,
      passed,
    });

    const savedResult = await this.certificationRepo.saveResult(result);
    return savedResult;
  }
}
