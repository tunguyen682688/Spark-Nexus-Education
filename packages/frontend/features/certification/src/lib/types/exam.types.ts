export interface ExamQuestionChoice {
  id: string;
  choiceKey: string;
  content: string;
}

export interface ExamQuestion {
  id: string;
  questionText?: string;
  content?: string;
  questionType?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'MCQ' | string;
  orderIndex?: number;
  points?: number;
  explanation?: string;
  estimatedTime?: number;
  imageUrl?: string;
  audioUrl?: string;
  passageGroupId?: string;
  passageText?: string;
  passageType?: string;
  passageTitle?: string;
  blankNumber?: number;
  subQuestionNumber?: number;
  choices?: ExamQuestionChoice[];
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  sectionType: string;
  orderIndex: number;
  durationMinutes?: number;
  questionCount?: number;
  isBreak?: boolean;
  questions: ExamQuestion[];
}

export interface Exam {
  id: string;
  collectionId: string;
  title: string;
  code: string;
  description?: string;
  examType: 'FULL_MOCK' | 'MINI_TEST' | 'SECTION_PRACTICE';
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  sections?: ExamSection[];
}

export interface ExamBuilderResponse {
  id: string;
  title: string;
  description: string;
  examType: string;
  certificationType: string | null;
  collectionId: string;
  collectionTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  status: string;
  lastAutosaved: string;
  settings: {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    maxScore: number;
    difficulty: string;
    level: string;
    language: string;
    instructions: string;
    createdDate: string;
    lastUpdatedDate: string;
  };
  sections: ExamSection[];
  blueprint?: {
    totalQuestions: number;
    totalTimeMinutes: number;
    totalPoints: number;
  };
}
