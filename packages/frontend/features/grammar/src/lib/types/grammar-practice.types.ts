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
