export interface QuestionVersion {
  id: string;
  questionId: string;
  version: number;
  content: string;
  createdAt: Date | string;
  createdBy: string | null;
}

export interface AnswerOptionItem {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}
