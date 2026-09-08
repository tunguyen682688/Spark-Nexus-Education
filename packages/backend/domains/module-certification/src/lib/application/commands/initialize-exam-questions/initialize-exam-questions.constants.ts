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

// ─── TOEIC Structure (200 questions) ─────────────────────────────────────

function buildToeicPart1(): SectionDef {
  return {
    title: 'Part 1 — Photographs',
    sectionType: 'listening',
    order: 1,
    durationMinutes: 0,
    questionSlots: Array.from({ length: 6 }, (_, i) => ({
      questionType: 'photograph_choice',
      points: 5,
      estimatedTime: 30,
      optionsCount: 4,
    })),
  };
}

function buildToeicPart2(): SectionDef {
  return {
    title: 'Part 2 — Question-Response',
    sectionType: 'listening',
    order: 2,
    durationMinutes: 0,
    questionSlots: Array.from({ length: 25 }, (_, i) => ({
      questionType: 'question_response',
      points: 5,
      estimatedTime: 20,
      optionsCount: 3,
    })),
  };
}

function buildToeicPart3(): SectionDef {
  // 39 questions = 13 groups × 3 questions
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

function buildToeicPart4(): SectionDef {
  // 30 questions = 10 groups × 3 questions
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

function buildToeicPart5(): SectionDef {
  return {
    title: 'Part 5 — Incomplete Sentences',
    sectionType: 'reading',
    order: 5,
    durationMinutes: 0,
    questionSlots: Array.from({ length: 30 }, (_, i) => ({
      questionType: 'incomplete_sentence',
      points: 5,
      estimatedTime: 30,
      optionsCount: 4,
    })),
  };
}

function buildToeicPart6(): SectionDef {
  // 16 questions = 4 groups × 4 questions
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

function buildToeicPart7(): SectionDef {
  // 54 questions: 10 single (1q each) + 2 double (2q each) + 3 triple (4q each) = 10+4+12=26
  // Remaining 28 are additional single passages to reach 54 total
  const questionSlots: QuestionSlotDef[] = [];

  // 10 single passages × 1 question = 10
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

  // 2 double passages × 2 questions = 4
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

  // 3 triple passages × 4 questions = 12
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

  // Fill remaining to reach 54 total with additional single passages
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

// ─── Exam Structure Registry ─────────────────────────────────────────────

export const EXAM_STRUCTURES: Record<string, ExamStructureDef> = {
  TOEIC: {
    certificationType: 'TOEIC',
    sections: [
      buildToeicPart1(),
      buildToeicPart2(),
      buildToeicPart3(),
      buildToeicPart4(),
      // Part 5-7 are reading sections (no break in backend; break is display-only)
      buildToeicPart5(),
      buildToeicPart6(),
      buildToeicPart7(),
    ],
  },
  IELTS: {
    certificationType: 'IELTS',
    sections: [
      { title: 'Listening — Section 1', sectionType: 'listening', order: 1, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'ielts_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
      { title: 'Listening — Section 2', sectionType: 'listening', order: 2, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'ielts_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
      { title: 'Listening — Section 3', sectionType: 'listening', order: 3, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'ielts_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
      { title: 'Listening — Section 4', sectionType: 'listening', order: 4, durationMinutes: 20, questionSlots: Array.from({ length: 10 }, () => ({ questionType: 'ielts_listening_mc', points: 1, estimatedTime: 60, optionsCount: 4 })) },
      { title: 'Reading — Passage 1', sectionType: 'reading', order: 5, durationMinutes: 20, questionSlots: Array.from({ length: 13 }, () => ({ questionType: 'ielts_reading_mc', points: 1, estimatedTime: 120, optionsCount: 4 })) },
      { title: 'Reading — Passage 2', sectionType: 'reading', order: 6, durationMinutes: 20, questionSlots: Array.from({ length: 13 }, () => ({ questionType: 'ielts_reading_mc', points: 1, estimatedTime: 120, optionsCount: 4 })) },
      { title: 'Reading — Passage 3', sectionType: 'reading', order: 7, durationMinutes: 20, questionSlots: Array.from({ length: 14 }, () => ({ questionType: 'ielts_reading_mc', points: 1, estimatedTime: 120, optionsCount: 4 })) },
      { title: 'Writing — Task 1', sectionType: 'writing', order: 8, durationMinutes: 20, questionSlots: [{ questionType: 'ielts_writing_task1', points: 1, estimatedTime: 1200, optionsCount: 0 }] },
      { title: 'Writing — Task 2', sectionType: 'writing', order: 9, durationMinutes: 40, questionSlots: [{ questionType: 'ielts_writing_task2', points: 1, estimatedTime: 2400, optionsCount: 0 }] },
      { title: 'Speaking', sectionType: 'speaking', order: 10, durationMinutes: 15, questionSlots: [{ questionType: 'ielts_speaking', points: 1, estimatedTime: 900, optionsCount: 0 }] },
    ],
  },
  VSTEP: {
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
  },
  CAMBRIDGE: {
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
  },
};

export function getExamStructure(certificationType: string): ExamStructureDef | undefined {
  return EXAM_STRUCTURES[certificationType.toUpperCase()];
}
