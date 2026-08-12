import type { ExamQuestion } from './grammar-exam.types';

export interface AssessmentAnswer {
  userAnswer?: string;
  words?: string[];
  incorrectWord?: string | null;
  correctedText?: string;
  isAnswered?: boolean;
}

export interface ExamAttemptResult {
  success: boolean;
  proficiency: number;
  isPassed: boolean;
  xpEarned: number;
  newCertificateIssued: boolean;
  certificate?: {
    id?: string;
    level?: string;
    examType?: string;
    serialNumber?: string;
    issuedAt?: string;
  } | null;
}

export interface RecoveryData {
  answers?: Record<string, AssessmentAnswer>;
  flaggedIds?: string[];
  currentIdx?: number;
  timeLeft?: number;
  score?: number;
  wrongQuestionIds?: string[];
  isAnswered?: boolean;
  isCorrect?: boolean | null;
  selectedOpt?: string | null;
  selectedWords?: string[];
  selectedErrorWord?: string | null;
  correctedText?: string;
}

export interface AssessmentSessionState {
  currentIdx: number;
  answers: Record<string, AssessmentAnswer>;
  flaggedIds: string[];
  timeLeft: number;
  isCompleted: boolean;
  isSubmitting: boolean;
  examResult: ExamAttemptResult | null;
  selectedOpt: string | null;
  selectedWords: string[];
  selectedErrorWord: string | null;
  correctedText: string;
  savedTrapIds: string[];
  showRecoveryModal: boolean;
  recoveryData: RecoveryData | null;
  currentQuestion: ExamQuestion;
  formattedTime: string;
  progressPercent: number;
}

export interface AssessmentSessionActions {
  setCurrentIdx: React.Dispatch<React.SetStateAction<number>>;
  toggleFlag: (qId: string) => void;
  handleSelectOption: (opt: string) => void;
  handleWordClick: (word: string) => void;
  handleRemoveWord: (wordIndex: number) => void;
  handleClearWords: () => void;
  handleSelectErrorWord: (word: string) => void;
  handleCorrectionChange: (text: string) => void;
  submitExam: () => Promise<void>;
  handleRecover: () => void;
  handleDiscard: () => void;
  handleSaveTrap: (q: ExamQuestion, userAnswer: string) => Promise<void>;
  retryExam: () => void;
}
