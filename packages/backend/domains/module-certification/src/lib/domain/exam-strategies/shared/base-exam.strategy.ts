import type {
  ExamStrategy,
  ExamStructureDef,
  QuestionSlotDef,
  QuestionDefaults,
} from '../exam-strategy.interface';

export abstract class BaseExamStrategy implements ExamStrategy {
  abstract readonly certificationType: string;

  abstract getStructure(): ExamStructureDef;

  validateConfig(config: { certificationType?: string }): boolean {
    return config.certificationType === this.certificationType;
  }

  createQuestionDefaults(slot: QuestionSlotDef): QuestionDefaults {
    return {
      content: '',
      options: Array.from({ length: slot.optionsCount }, (_, i) => ({
        content: '',
        isCorrect: i === 0,
      })),
      metadata: {
        points: slot.points,
        estimatedTime: slot.estimatedTime ?? null,
      },
    };
  }
}
