import { BaseExamStrategy } from '../shared/base-exam.strategy';
import type { ExamStructureDef } from '../exam-strategy.interface';

export class VstepStrategy extends BaseExamStrategy {
  readonly certificationType = 'VSTEP';

  getStructure(): ExamStructureDef {
    return {
      certificationType: 'VSTEP',
      sections: [
        { title: 'Listening — Section 1', sectionType: 'listening', order: 1, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'vstep_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
        { title: 'Listening — Section 2', sectionType: 'listening', order: 2, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'vstep_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
        { title: 'Listening — Section 3', sectionType: 'listening', order: 3, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'vstep_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
        { title: 'Listening — Section 4', sectionType: 'listening', order: 4, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'vstep_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
        { title: 'Reading — Passage 1', sectionType: 'reading', order: 5, durationMinutes: 20, questionSlots: Array.from({ length: 13 }, () => ({ questionType: 'vstep_reading_mc', points: 1, estimatedTime: 120, optionsCount: 4 })) },
        { title: 'Reading — Passage 2', sectionType: 'reading', order: 6, durationMinutes: 20, questionSlots: Array.from({ length: 13 }, () => ({ questionType: 'vstep_reading_mc', points: 1, estimatedTime: 120, optionsCount: 4 })) },
        { title: 'Reading — Passage 3', sectionType: 'reading', order: 7, durationMinutes: 20, questionSlots: Array.from({ length: 14 }, () => ({ questionType: 'vstep_reading_mc', points: 1, estimatedTime: 120, optionsCount: 4 })) },
        { title: 'Writing — Task 1', sectionType: 'writing', order: 8, durationMinutes: 20, questionSlots: [{ questionType: 'vstep_writing_task1', points: 1, estimatedTime: 1200, optionsCount: 0 }] },
        { title: 'Writing — Task 2', sectionType: 'writing', order: 9, durationMinutes: 40, questionSlots: [{ questionType: 'vstep_writing_task2', points: 1, estimatedTime: 2400, optionsCount: 0 }] },
        { title: 'Speaking', sectionType: 'speaking', order: 10, durationMinutes: 15, questionSlots: [{ questionType: 'vstep_speaking', points: 1, estimatedTime: 900, optionsCount: 0 }] },
      ],
    };
  }
}
