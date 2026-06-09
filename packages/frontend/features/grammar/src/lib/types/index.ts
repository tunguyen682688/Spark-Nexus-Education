export type GrammarLessonStatus = 'MASTERED' | 'IN_PROGRESS' | 'LOCKED' | 'DRAFT';


export interface GrammarLesson {
  id: string;
  title: string;
  description: string;
  status: GrammarLessonStatus;
  successRate?: string;
  proficiency?: number;
  icon: string;
  hasLeak?: boolean;
  trapCount?: number;
}

export interface GrammarLevel {
  level: string;
  name: string;
  subName: string;
  lessons: GrammarLesson[];
}

export interface GrammarRoadmapResponse {
  percentComplete: number;
  completedLessons: number;
  totalLessons: number;
  streakDays: number;
  currentXP: number;
  levels: GrammarLevel[];
  skills?: Array<{ name: string; value: number }>;
}

export interface GrammarBlock {
  id: string;
  type: 'text' | 'formula' | 'example' | 'quiz' | 'media' | 'callout';
  blockLabel?: string;
  content?: string;
  url?: string;
  provider?: 'youtube' | 'local';
  elements?: string[];
  note?: string;
  items?: Array<{ text: string; explanation: string }>;
  question?: string;
  options?: string[];
  answer?: string;
  title?: string;
  quizType?: string;
  words?: string[];
  sentence?: string;
  incorrectWord?: string;
  correctWord?: string;
  explanation?: string;
}

export interface SaveGrammarLessonDto {
  title: string;
  vietnameseTitle?: string | null;
  level: string;
  status?: string;
  tags: string[];
  outline?: GrammarOutlineItem[];
  blocks?: GrammarBlock[];
  theoryText: string;
  formulaElements: string[];
  formulaNote: string;
}

export interface GrammarOutlineItem {
  id: string;
  label: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

export interface GrammarLessonDetailResponse {
  id: string;
  title: string;
  vietnameseTitle?: string;
  status: string;
  level: string;
  tags: string[];
  theory: string;
  formula: string[];
  outline: GrammarOutlineItem[];
  blocks?: GrammarBlock[];
  quickNotes?: string;
  nextLesson?: { id: string; title: string; level: string; icon: string } | null;
  proficiency?: number;
}

export interface ExamQuestion {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  options?: string[];
  answer: string;
  explanation: string;
  category: 'syntax' | 'tenses' | 'morphology' | 'modality';
  words?: string[];
  sentence?: string;
  incorrectWord?: string;
  correctWord?: string;
}

export interface PracticeQuestion {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'DRAG_DROP' | 'SENTENCE_REBUILDER';
  category: string;
  level: string;
  options?: string[];
  correctAnswer: string;
  optionExplanations?: Record<string, string>;
  explanation: string;
  words?: string[];
  slots?: string[];
}

export interface GrammarExamSet {
  id: string;
  title: string;
  description: string;
  level: string;
  examType: 'CEFR' | 'TOEIC' | 'IELTS' | 'VSTEP';
  examMetadata: Record<string, unknown>;
  creatorId: string;
  creatorName: string;
  questions: ExamQuestion[];
  timeLimit: number;
  upvotes: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bestScore: number;
  isPassed: boolean;
}

export interface CommunityGrammarCertificate {
  id: string;
  userId: string;
  level: string;
  examType: string;
  serialNumber: string;
  issuedAt: string;
  metadata: {
    issuedTo?: string;
    bestScore?: number;
    totalExamsCleared?: number;
  };
}

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

export interface XPTrendItem {
  date: string;
  dayName: string;
  xp: number;
}

export interface TrapCategoryItem {
  category: string;
  displayName: string;
  trapped: number;
  broken: number;
}

export interface GrammarAnalyticsResponse {
  totalTraps: number;
  trappedCount: number;
  brokenCount: number;
  accuracyRate: number;
  masteryPercentage: number;
  xpTrend: XPTrendItem[];
  trapCategories: TrapCategoryItem[];
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  likesCount: number;
  tags: string[];
  hasQuiz?: boolean;
  quizType?: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  quizData?: {
    text?: string;
    words?: string[];
    answer?: string;
    options?: string[];
    sentence?: string;
    incorrectWord?: string;
    correctWord?: string;
    explanation?: string;
  };
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: {
      name: string;
      avatar?: string;
    };
  }>;
}

export interface CrowdsourcedQuiz {
  id: string;
  lessonId: string;
  contributorId: string;
  questionType: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  questionData: {
    options?: string[];
    answer?: string;
    words?: string[];
    sentence?: string;
    incorrectWord?: string;
    correctWord?: string;
    text?: string;
    question?: string;
  };
  explanation: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  upvotes: number;
  createdAt: string;
}
