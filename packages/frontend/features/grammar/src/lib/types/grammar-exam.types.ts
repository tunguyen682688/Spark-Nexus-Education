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
