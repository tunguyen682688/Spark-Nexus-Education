export interface QuestionSlotDef {
  questionType: string;
  points: number;
  estimatedTime?: number;
  optionsCount: number;
  passageGroupId?: string;
  passageType?: 'single' | 'double' | 'triple';
}

export interface SectionDef {
  title: string;
  sectionType: string;
  order: number;
  durationMinutes: number;
  questionSlots: QuestionSlotDef[];
}

export interface ExamStructureDef {
  certificationType: string;
  sections: SectionDef[];
}

export interface QuestionDefaults {
  content: string;
  options: Array<{ content: string; isCorrect: boolean }>;
  metadata: Record<string, unknown>;
}

export interface ExamStrategy {
  readonly certificationType: string;

  getStructure(): ExamStructureDef;

  validateConfig(config: { certificationType?: string }): boolean;

  createQuestionDefaults(slot: QuestionSlotDef): QuestionDefaults;
}
