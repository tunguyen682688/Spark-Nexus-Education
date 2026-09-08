import { BaseExamStrategy } from '../shared/base-exam.strategy';
import type { ExamStructureDef, QuestionSlotDef, SectionDef } from '../exam-strategy.interface';

export class ToeicStrategy extends BaseExamStrategy {
  readonly certificationType = 'TOEIC';

  getStructure(): ExamStructureDef {
    return {
      certificationType: 'TOEIC',
      sections: [
        this.buildPart1(),
        this.buildPart2(),
        this.buildPart3(),
        this.buildPart4(),
        this.buildPart5(),
        this.buildPart6(),
        this.buildPart7(),
      ],
    };
  }

  override createQuestionDefaults(slot: QuestionSlotDef) {
    const base = super.createQuestionDefaults(slot);
    if (slot.questionType === 'photograph_choice') {
      return { ...base, metadata: { ...base.metadata, requiresAudio: false, requiresImage: true } };
    }
    if (['conversation_mc', 'short_talk_mc', 'question_response'].includes(slot.questionType)) {
      return { ...base, metadata: { ...base.metadata, requiresAudio: true } };
    }
    return base;
  }

  private buildPart1(): SectionDef {
    return {
      title: 'Part 1 — Photographs',
      sectionType: 'listening',
      order: 1,
      durationMinutes: 0,
      questionSlots: Array.from({ length: 6 }, () => ({
        questionType: 'photograph_choice',
        points: 5,
        estimatedTime: 30,
        optionsCount: 4,
      })),
    };
  }

  private buildPart2(): SectionDef {
    return {
      title: 'Part 2 — Question-Response',
      sectionType: 'listening',
      order: 2,
      durationMinutes: 0,
      questionSlots: Array.from({ length: 25 }, () => ({
        questionType: 'question_response',
        points: 5,
        estimatedTime: 20,
        optionsCount: 3,
      })),
    };
  }

  private buildPart3(): SectionDef {
    const questionSlots: QuestionSlotDef[] = [];
    for (let group = 0; group < 13; group++) {
      for (let q = 0; q < 3; q++) {
        questionSlots.push({
          questionType: 'conversation_mc',
          points: 5,
          estimatedTime: 30,
          optionsCount: 4,
          passageGroupId: `part3-g${group + 1}`,
        });
      }
    }
    return {
      title: 'Part 3 — Conversations',
      sectionType: 'listening',
      order: 3,
      durationMinutes: 0,
      questionSlots,
    };
  }

  private buildPart4(): SectionDef {
    const questionSlots: QuestionSlotDef[] = [];
    for (let group = 0; group < 10; group++) {
      for (let q = 0; q < 3; q++) {
        questionSlots.push({
          questionType: 'short_talk_mc',
          points: 5,
          estimatedTime: 30,
          optionsCount: 4,
          passageGroupId: `part4-g${group + 1}`,
        });
      }
    }
    return {
      title: 'Part 4 — Short Talks',
      sectionType: 'listening',
      order: 4,
      durationMinutes: 0,
      questionSlots,
    };
  }

  private buildPart5(): SectionDef {
    return {
      title: 'Part 5 — Incomplete Sentences',
      sectionType: 'reading',
      order: 5,
      durationMinutes: 0,
      questionSlots: Array.from({ length: 30 }, () => ({
        questionType: 'incomplete_sentence',
        points: 5,
        estimatedTime: 30,
        optionsCount: 4,
      })),
    };
  }

  private buildPart6(): SectionDef {
    const questionSlots: QuestionSlotDef[] = [];
    for (let group = 0; group < 4; group++) {
      for (let q = 0; q < 4; q++) {
        questionSlots.push({
          questionType: 'text_completion',
          points: 5,
          estimatedTime: 30,
          optionsCount: 4,
          passageGroupId: `part6-g${group + 1}`,
        });
      }
    }
    return {
      title: 'Part 6 — Text Completion',
      sectionType: 'reading',
      order: 6,
      durationMinutes: 0,
      questionSlots,
    };
  }

  private buildPart7(): SectionDef {
    const questionSlots: QuestionSlotDef[] = [];

    for (let g = 0; g < 10; g++) {
      questionSlots.push({
        questionType: 'reading_comprehension_single',
        points: 5,
        estimatedTime: 60,
        optionsCount: 4,
        passageGroupId: `part7-s${g + 1}`,
        passageType: 'single',
      });
    }

    for (let g = 0; g < 2; g++) {
      for (let q = 0; q < 2; q++) {
        questionSlots.push({
          questionType: 'reading_comprehension_double',
          points: 5,
          estimatedTime: 60,
          optionsCount: 4,
          passageGroupId: `part7-d${g + 1}`,
          passageType: 'double',
        });
      }
    }

    for (let g = 0; g < 3; g++) {
      for (let q = 0; q < 4; q++) {
        questionSlots.push({
          questionType: 'reading_comprehension_triple',
          points: 5,
          estimatedTime: 60,
          optionsCount: 4,
          passageGroupId: `part7-t${g + 1}`,
          passageType: 'triple',
        });
      }
    }

    const remaining = 54 - questionSlots.length;
    for (let g = 0; g < remaining; g++) {
      questionSlots.push({
        questionType: 'reading_comprehension_single',
        points: 5,
        estimatedTime: 60,
        optionsCount: 4,
        passageGroupId: `part7-s${10 + g + 1}`,
        passageType: 'single',
      });
    }

    return {
      title: 'Part 7 — Reading Comprehension',
      sectionType: 'reading',
      order: 7,
      durationMinutes: 0,
      questionSlots,
    };
  }
}
