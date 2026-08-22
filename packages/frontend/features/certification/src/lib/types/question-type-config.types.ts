export type QuestionTypeCategory = 'choice' | 'input' | 'gap-fill' | 'matching' | 'writing' | 'speaking';

export type SkillGroup = 'listening' | 'reading' | 'writing' | 'speaking' | 'all-skills';

export interface QuestionTypeConfig {
  id: string;
  label: string;
  labelVi: string;
  category: QuestionTypeCategory;
  skillGroup: SkillGroup;
  description: string;
  supportsAudio?: boolean;
  supportsImage?: boolean;
  supportsPassage?: boolean;
  maxOptions?: number;
  minOptions?: number;
  requiresCorrectAnswer?: boolean;
  placeholderText?: string;
  icon?: string;
  fixedOptions?: string[];
  wordLimit?: number;
  timeLimitSeconds?: number;
  isMultiQuestion?: boolean;
  maxQuestionsPerPassage?: number;
  maxBlanksPerPassage?: number;
  partNumber?: number;
  subQuestionTypes?: string[];
}

export interface CertificationQuestionConfig {
  certificationType: string;
  questionTypes: QuestionTypeConfig[];
  defaultQuestionType: string;
}
