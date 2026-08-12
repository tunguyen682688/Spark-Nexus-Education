import type React from 'react';
import type { AnswerOptionItem } from './question.types';

export type { AnswerOptionItem };

export interface QuestionPropertiesForm {
  id: string;
  points: number;
  estimatedTime: string;
  tags: string[];
  skills: string[];
  cognitiveLevel: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
}

export interface QuestionFormState {
  questionText: string;
  questionType: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  shuffleOptions: boolean;
  options: AnswerOptionItem[];
  explanation: string;
  referenceType: 'Passage' | 'Image' | 'External Link';
  passageSource: string;
  highlight: string;
  properties: QuestionPropertiesForm;
  audioUrl?: string;
  imageUrl?: string;
  passageId?: string;
  passageText?: string;
  modelAnswer?: string;
  rubric?: string;
  gridInAnswer?: string;
  matchingPairs?: Array<{ left: string; right: string }>;
  wordRoot?: string;
  keyWord?: string;
  writingTaskType?: string;
  speakingPrompt?: string;
}

export type QuestionFormAction =
  | { type: 'SET_FIELD'; field: keyof QuestionFormState; value: unknown }
  | { type: 'SET_PROPERTIES'; value: QuestionPropertiesForm | ((prev: QuestionPropertiesForm) => QuestionPropertiesForm) }
  | { type: 'HYDRATE'; payload: Partial<QuestionFormState> };

export interface HandlersDeps {
  form: QuestionFormState;
  dispatch: React.Dispatch<QuestionFormAction>;
  setIsDirty: (value: boolean) => void;
}
