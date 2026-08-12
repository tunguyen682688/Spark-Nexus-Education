export type QuestionTypeCategory = 'choice' | 'input' | 'gap-fill' | 'matching' | 'writing' | 'speaking' | 'media';

export interface QuestionTypeConfig {
  id: string;
  label: string;
  labelVi: string;
  category: QuestionTypeCategory;
  description: string;
  supportsAudio?: boolean;
  supportsImage?: boolean;
  supportsPassage?: boolean;
  maxOptions?: number;
  minOptions?: number;
  requiresCorrectAnswer?: boolean;
  placeholderText?: string;
  icon?: string;
}

export interface CertificationQuestionConfig {
  certificationType: string;
  questionTypes: QuestionTypeConfig[];
  defaultQuestionType: string;
}
