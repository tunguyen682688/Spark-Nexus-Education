export interface SaveQuestionOptionDto {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface SaveQuestionDto {
  id?: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  category?: string;
  shuffleOptions?: boolean;
  options: SaveQuestionOptionDto[];
  explanation?: string;
  points?: number;
  estimatedTime?: string;
  tags?: string[];
  skills?: string[];
  cognitiveLevel?: string;
  target?: 'exam' | 'bank';
  referenceType?: string;
  passageSource?: string;
  highlight?: string;
  passageId?: string;
  passageText?: string;
  modelAnswer?: string;
  rubric?: unknown;
  matchingPairs?: Array<{ left: string; right: string }>;
  wordRoot?: string;
  keyWord?: string;
}

export interface SaveQuestionResult {
  id: string;
  savedToBank: boolean;
  status: string;
}

export interface LinkQuestionToExamDto {
  examId: string;
  questionId: string;
  order?: number;
  points?: number;
  sectionId?: string;
  audioUrl?: string;
  imageUrl?: string;
  partNumber?: number;
  gapNumber?: number;
  writingTaskType?: string;
  speakingPrompt?: string;
  isGridIn?: boolean;
  formatMetadata?: unknown;
}

export interface SectionQuestion {
  examQuestionId: string;
  id: string;
  number: number;
  title: string;
  partTag: string;
  type: string;
  difficulty: string;
  points: number;
  imageUrl: string | null;
  audioUrl: string | null;
  partNumber: number | null;
  passageId: string | null;
  modelAnswer: string | null;
  formatMetadata: unknown | null;
}

export interface SectionQuestionsResponse {
  questions: SectionQuestion[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QuestionVersion {
  id: string;
  questionId: string;
  version: number;
  content: string;
  createdAt: Date | string;
  createdBy: string | null;
}

export interface QuestionMetadata {
  id: string;
  questionId: string;
  explanation: string | null;
  points: number;
  estimatedTime: string | null;
  shuffleOptions: boolean;
  referenceType: string | null;
  passageSource: string | null;
  highlight: string | null;
  cognitiveLevel: string | null;
  tags: string[];
  skills: string[];
  qualityScore: number | null;
  qualityRating: string | null;
}

export interface QuestionBuilderData {
  id: string;
  badgeType: string;
  status: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  shuffleOptions: boolean;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  reference: {
    type: string | null;
    passageSource: string | null;
    highlight: string | null;
  };
  properties: {
    id: string;
    points: number;
    estimatedTime: string;
    tags: string[];
    skills: string[];
    cognitiveLevel: string;
    createdDate: string;
    lastUpdatedDate: string;
    createdBy: string;
  };
  qualityScore: {
    score: number;
    rating: string;
    description: string;
    checks: string[];
  };
  usedIn: {
    examTitle: string;
    sectionInfo: string;
    collectionId: string | null;
    collectionTitle: string | null;
  } | null;
  examFormatFields: {
    audioUrl: string | null;
    imageUrl: string | null;
    passageId: string | null;
    passageText: string | null;
    modelAnswer: string | null;
    rubric: unknown | null;
    matchingPairs: unknown | null;
    wordRoot: string | null;
    keyWord: string | null;
    partNumber: number | null;
    gapNumber: number | null;
    writingTaskType: string | null;
    speakingPrompt: string | null;
    gridInAnswer: string | null;
    isGridIn: boolean;
    formatMetadata: unknown | null;
  } | null;
  certificationType?: string;
  examType?: string;
}

export interface AnswerOptionItem {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}
