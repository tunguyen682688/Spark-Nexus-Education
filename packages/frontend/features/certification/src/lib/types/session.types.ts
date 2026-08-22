import type { ExamQuestion } from './exam.types';

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText?: string | null;
  choiceIds: string[];
  savedAt?: string;
  updatedAt?: string;
}

export interface SessionViolation {
  id: string;
  sessionId: string;
  violationType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'TIMEOUT';
  description?: string;
  timestamp: string;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'terminated';
  startedAt: string;
  endedAt?: string;
  remainingSeconds: number;
  answers: SessionAnswer[];
  violations: SessionViolation[];
  questions?: ExamQuestion[];
  examTitle?: string;
  title?: string;
}

export interface SkillResult {
  skill: string;
  score: number;
  maxScore: number;
  accuracyRate: string;
  feedback: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamResult {
  id: string;
  sessionId: string;
  examId: string;
  examTitle: string;
  totalScore: number;
  maxScore: number;
  targetBand: string;
  achievedBand: string;
  accuracyRate: string;
  timeSpentMinutes: number;
  completedAt: string;
  skillResults: SkillResult[];
  questionResults: QuestionResult[];
  overallAiSummary: string;
  actionableRecommendations: string[];
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: string;
}

export interface SaveSessionAnswerDto {
  questionId: string;
  answerText?: string;
  choiceIds?: string[];
}

export interface RecordSessionViolationDto {
  violationType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'TIMEOUT';
  description?: string;
}

export interface UseExamSessionContainerLogicProps {
  sessionId: string;
  onSubmitted?: (resultId: string) => void;
}
