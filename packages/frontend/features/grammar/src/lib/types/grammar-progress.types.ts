export interface UserGrammarTrap {
  id: string;
  userId: string;
  questionId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  questionData: unknown;
  category: 'syntax' | 'tenses' | 'morphology' | 'modality';
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  aiAnalysis?: string | null;
  status: 'TRAPPED' | 'BROKEN';
  createdAt: string;
  updatedAt: string;
}

export interface SaveGrammarTrapDto {
  questionId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  questionData: unknown;
  category: 'syntax' | 'tenses' | 'morphology' | 'modality';
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface UserGrammarProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'IN_PROGRESS' | 'MASTERED';
  proficiency: number;
  quickNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDailyStreak {
  id: string;
  userId: string;
  streakCount: number;
  lastActiveAt: string | null;
  totalXP: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLevelGraduation {
  id: string;
  userId: string;
  level: string;
  isPassed: boolean;
  bestScore: number;
  certificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSrsProgress {
  id: string;
  userId: string;
  quizId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}
