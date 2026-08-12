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
