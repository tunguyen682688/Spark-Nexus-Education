import { BaseExamStrategy } from '../shared/base-exam.strategy';
import type { ExamStructureDef } from '../exam-strategy.interface';

export class CambridgeStrategy extends BaseExamStrategy {
  readonly certificationType = 'CAMBRIDGE';

  getStructure(): ExamStructureDef {
    return {
      certificationType: 'CAMBRIDGE',
      sections: [
        { title: 'Reading & Writing — Part 1', sectionType: 'reading', order: 1, durationMinutes: 45, questionSlots: Array.from({ length: 8 }, () => ({ questionType: 'cambridge_use_of_english', points: 1, estimatedTime: 180, optionsCount: 4 })) },
        { title: 'Reading & Writing — Part 2', sectionType: 'reading', order: 2, durationMinutes: 0, questionSlots: Array.from({ length: 8 }, () => ({ questionType: 'cambridge_use_of_english', points: 1, estimatedTime: 180, optionsCount: 4 })) },
        { title: 'Reading & Writing — Part 3', sectionType: 'reading', order: 3, durationMinutes: 0, questionSlots: Array.from({ length: 8 }, () => ({ questionType: 'cambridge_use_of_english', points: 1, estimatedTime: 180, optionsCount: 4 })) },
        { title: 'Reading & Writing — Part 4', sectionType: 'reading', order: 4, durationMinutes: 0, questionSlots: Array.from({ length: 8 }, () => ({ questionType: 'cambridge_use_of_english', points: 1, estimatedTime: 180, optionsCount: 0 })) },
        { title: 'Reading — Part 5', sectionType: 'reading', order: 5, durationMinutes: 0, questionSlots: Array.from({ length: 6 }, () => ({ questionType: 'cambridge_reading_mc', points: 1, estimatedTime: 300, optionsCount: 4 })) },
        { title: 'Reading — Part 6', sectionType: 'reading', order: 6, durationMinutes: 0, questionSlots: Array.from({ length: 7 }, () => ({ questionType: 'cambridge_reading_mc', points: 1, estimatedTime: 300, optionsCount: 4 })) },
        { title: 'Reading — Part 7', sectionType: 'reading', order: 7, durationMinutes: 0, questionSlots: Array.from({ length: 6 }, () => ({ questionType: 'cambridge_reading_mc', points: 1, estimatedTime: 300, optionsCount: 4 })) },
        { title: 'Listening — Part 1', sectionType: 'listening', order: 8, durationMinutes: 0, questionSlots: Array.from({ length: 6 }, () => ({ questionType: 'cambridge_listening_mc', points: 1, estimatedTime: 60, optionsCount: 3 })) },
        { title: 'Listening — Part 2', sectionType: 'listening', order: 9, durationMinutes: 0, questionSlots: Array.from({ length: 8 }, () => ({ questionType: 'cambridge_listening_mc', points: 1, estimatedTime: 60, optionsCount: 3 })) },
        { title: 'Listening — Part 3', sectionType: 'listening', order: 10, durationMinutes: 0, questionSlots: Array.from({ length: 5 }, () => ({ questionType: 'cambridge_listening_mc', points: 1, estimatedTime: 60, optionsCount: 3 })) },
        { title: 'Listening — Part 4', sectionType: 'listening', order: 11, durationMinutes: 0, questionSlots: Array.from({ length: 4 }, () => ({ questionType: 'cambridge_listening_mc', points: 1, estimatedTime: 60, optionsCount: 3 })) },
        { title: 'Writing — Part 1', sectionType: 'writing', order: 12, durationMinutes: 0, questionSlots: [{ questionType: 'cambridge_writing_email', points: 1, estimatedTime: 1200, optionsCount: 0 }] },
        { title: 'Writing — Part 2', sectionType: 'writing', order: 13, durationMinutes: 0, questionSlots: [{ questionType: 'cambridge_writing_essay', points: 1, estimatedTime: 1800, optionsCount: 0 }] },
        { title: 'Speaking', sectionType: 'speaking', order: 14, durationMinutes: 15, questionSlots: [{ questionType: 'cambridge_speaking', points: 1, estimatedTime: 900, optionsCount: 0 }] },
      ],
    };
  }
}
