import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExamSessionDomainService } from './exam-session-domain.service';
import { ICertificationRepository } from '../repositories/certification.repository.interface';
import { ExamSessionEntity } from '../entities/exam-session.entity';
import { ExamEntity } from '../entities/exam.entity';
import { SessionAnswerEntity } from '../entities/session-answer.entity';
import { ExamQuestionEntity } from '../entities/exam-question.entity';
import { QuestionChoiceEntity } from '../entities/question-choice.entity';

describe('ExamSessionDomainService', () => {
  let service: ExamSessionDomainService;
  let repository: jest.Mocked<ICertificationRepository>;

  const mockSession = ExamSessionEntity.create({
    id: 'session-1',
    examId: 'exam-1',
    userId: 'user-1',
    status: 'started',
    startedAt: new Date(),
  });

  const mockExam = ExamEntity.create({
    id: 'exam-1',
    title: 'IELTS Listening Test 1',
    duration: 1800,
    totalQuestions: 2,
    maxScore: 10,
    passScore: 5,
    publishStatus: 'published',
    collectionId: 'col-1',
  });

  const mockExamQuestion1 = ExamQuestionEntity.create({
    id: 'eq-1',
    examId: 'exam-1',
    questionId: 'q-1',
    order: 1,
    points: 5.0,
  });

  const mockExamQuestion2 = ExamQuestionEntity.create({
    id: 'eq-2',
    examId: 'exam-1',
    questionId: 'q-2',
    order: 2,
    points: 5.0,
  });

  const mockChoicesQ1 = [
    QuestionChoiceEntity.create({
      id: 'c-1-1',
      questionId: 'q-1',
      content: 'Correct Option',
      isCorrect: true,
      order: 1,
    }),
    QuestionChoiceEntity.create({
      id: 'c-1-2',
      questionId: 'q-1',
      content: 'Wrong Option',
      isCorrect: false,
      order: 2,
    }),
  ];

  const mockChoicesQ2 = [
    QuestionChoiceEntity.create({
      id: 'c-2-1',
      questionId: 'q-2',
      content: 'Correct Choice',
      isCorrect: true,
      order: 1,
    }),
  ];

  const mockUserAnswers = [
    SessionAnswerEntity.create({
      id: 'sa-1',
      sessionId: 'session-1',
      questionId: 'q-1',
      choiceIds: ['c-1-1'],
    }),
    SessionAnswerEntity.create({
      id: 'sa-2',
      sessionId: 'session-1',
      questionId: 'q-2',
      choiceIds: ['c-2-1'],
    }),
  ];

  beforeEach(async () => {
    repository = {
      findSessionById: jest.fn(),
      saveSession: jest.fn(),
      findSessionsByUserId: jest.fn(),
      findExamById: jest.fn(),
      saveExam: jest.fn(),
      findExams: jest.fn(),
      deleteExam: jest.fn(),
      findCollections: jest.fn(),
      findCollectionById: jest.fn(),
      saveCollection: jest.fn(),
      deleteCollection: jest.fn(),
      findSectionsByExamId: jest.fn(),
      saveExamSection: jest.fn(),
      deleteExamSection: jest.fn(),
      findRulesByExamId: jest.fn(),
      saveExamRule: jest.fn(),
      deleteExamRule: jest.fn(),
      findResultById: jest.fn(),
      findResultBySessionId: jest.fn(),
      saveResult: jest.fn(),
      findResultsByUserId: jest.fn(),
      findQuestionById: jest.fn(),
      saveQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
      saveQuestionChoice: jest.fn(),
      deleteQuestionChoice: jest.fn(),
      findHintsByQuestionId: jest.fn(),
      saveQuestionHint: jest.fn(),
      deleteQuestionHint: jest.fn(),
      findMediaByQuestionId: jest.fn(),
      saveQuestionMedia: jest.fn(),
      deleteQuestionMedia: jest.fn(),
      findAnswersBySessionId: jest.fn(),
      findQuestionsByExamId: jest.fn(),
      findChoicesByQuestionId: jest.fn(),
      saveSessionAnswer: jest.fn(),
      saveViolation: jest.fn(),
      findSnapshotsBySessionId: jest.fn(),
      saveAutosaveSnapshot: jest.fn(),
      findSkillResultsByResultId: jest.fn(),
      saveSkillResult: jest.fn(),
      findQuestionResultsByResultId: jest.fn(),
      saveQuestionResult: jest.fn(),
      findAiEvaluationByResultId: jest.fn(),
      saveAiEvaluation: jest.fn(),
      findCreatorProfileById: jest.fn(),
      saveCreatorProfile: jest.fn(),
    } as unknown as jest.Mocked<ICertificationRepository>;

    service = new ExamSessionDomainService(repository);
  });

  it('should successfully evaluate and complete an exam session with passing score', async () => {
    repository.findSessionById.mockResolvedValue(mockSession);
    repository.findExamById.mockResolvedValue(mockExam);
    repository.findAnswersBySessionId.mockResolvedValue(mockUserAnswers);
    repository.findQuestionsByExamId.mockResolvedValue([mockExamQuestion1, mockExamQuestion2]);
    repository.findChoicesByQuestionId.mockImplementation(async (qId) => {
      return qId === 'q-1' ? mockChoicesQ1 : mockChoicesQ2;
    });

    repository.saveSession.mockImplementation(async (s) => s);
    repository.saveSessionAnswer.mockImplementation(async (a) => a);
    repository.saveResult.mockImplementation(async (r) => r);

    const result = await service.completeSession('session-1');

    expect(result).toBeDefined();
    expect(result.getTotalScore()).toBe(10.0);
    expect(result.isPassed()).toBe(true);
    expect(repository.saveSession).toHaveBeenCalled();
    expect(repository.saveResult).toHaveBeenCalled();
  });

  it('should throw NotFoundException if session does not exist', async () => {
    repository.findSessionById.mockResolvedValue(null);

    await expect(service.completeSession('invalid-session')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw BadRequestException if session is already completed', async () => {
    const completedSession = ExamSessionEntity.create({
      id: 'session-1',
      examId: 'exam-1',
      userId: 'user-1',
      status: 'completed',
    });
    repository.findSessionById.mockResolvedValue(completedSession);

    await expect(service.completeSession('session-1')).rejects.toThrow(
      BadRequestException
    );
  });
});
