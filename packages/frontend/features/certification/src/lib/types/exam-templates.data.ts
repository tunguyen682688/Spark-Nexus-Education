import type { SectionType } from './exam-content-editor.types';

export interface QuestionSlot {
  questionTypeId: string;
  label: string;
  points: number;
  estimatedTime?: number;
  optionsCount?: number;
}

export interface PassageGroup {
  /** Unique ID for this passage group (e.g., "p7-s1" for Part 7 single passage 1) */
  id: string;
  /** Number of questions in this passage group */
  questionCount: number;
  /** Type of passage */
  passageType: 'single' | 'double' | 'triple';
  /** Question type ID for all questions in this group */
  questionTypeId: string;
}

export interface ExamTemplateSection {
  title: string;
  subtitle?: string;
  sectionType: SectionType;
  instruction?: string;
  durationMinutes: number;
  isBreak: boolean;
  questionSlots: QuestionSlot[];
  /** Number of questions that share a passage/script (e.g., 3 for conversations, 4 for text completion) */
  groupSize?: number;
  /** Explicit passage groups for variable-size grouping (e.g., Part 7) */
  passageGroups?: PassageGroup[];
}

export interface ExamTemplateScoring {
  label: string;
  description: string;
  passingScore: number;
  maxScore: number;
}

export interface ExamTemplate {
  id: string;
  name: string;
  description: string;
  certificationType: string;
  durationMinutes: number;
  language: string;
  level: string;
  scoring: ExamTemplateScoring;
  sections: ExamTemplateSection[];
  /** When true, sections are predefined and cannot be added/removed/reordered */
  isFixedStructure?: boolean;
}

function makeSlots(typeId: string, count: number, opts?: { points?: number; time?: number; options?: number }): QuestionSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    questionTypeId: typeId,
    label: `Q${i + 1}`,
    points: opts?.points ?? 1,
    estimatedTime: opts?.time ?? 10,
    optionsCount: opts?.options,
  }));
}

// ─── TOEIC (200 questions, 120 min) ────────────────────────────────────────
// Real TOEIC structure:
// Listening (100): Part 1 (6) + Part 2 (25) + Part 3 (13×3=39) + Part 4 (10×3=30)
// Reading (100): Part 5 (30) + Part 6 (4×4=16) + Part 7 (54)
// Part 7: Single (10 passages, 2-4 Qs each = 29) + Double (2 sets × 5 = 10) + Triple (3 sets × 5 = 15)
export const EXAM_TEMPLATE_TOEIC: ExamTemplate = {
  id: 'template-toeic', name: 'TOEIC Listening & Reading',
  description: '200 câu — Listening 100 (Part 1-4) + Reading 100 (Part 5-7), thang điểm 10-990',
  certificationType: 'TOEIC', durationMinutes: 120, language: 'en', level: 'Intermediate',
  isFixedStructure: true,
  scoring: { label: 'TOEIC', description: '10-990 (L: 490 + R: 490)', passingScore: 550, maxScore: 990 },
  sections: [
    // ─── Listening ────────────────────────────────────────────────────────────
    { title: 'Part 1 — Photographs', subtitle: '6 câu', sectionType: 'listening', durationMinutes: 0, isBreak: false,
      instruction: 'Look at the photograph and choose the statement that best describes it.',
      questionSlots: makeSlots('photograph_choice', 6, { time: 5, options: 4 }) },
    { title: 'Part 2 — Question-Response', subtitle: '25 câu', sectionType: 'listening', durationMinutes: 0, isBreak: false,
      instruction: 'Listen to the question and choose the best response.',
      questionSlots: makeSlots('question_response', 25, { time: 5, options: 3 }) },
    { title: 'Part 3 — Conversations', subtitle: '39 câu (13 hội thoại × 3)', sectionType: 'listening', durationMinutes: 0, isBreak: false,
      instruction: 'Listen to each conversation and answer the questions.',
      questionSlots: makeSlots('conversation_mc', 39, { time: 8, options: 4 }),
      groupSize: 3 },
    { title: 'Part 4 — Short Talks', subtitle: '30 câu (10 bài × 3)', sectionType: 'listening', durationMinutes: 0, isBreak: false,
      instruction: 'Listen to each talk and answer the questions.',
      questionSlots: makeSlots('short_talk_mc', 30, { time: 8, options: 4 }),
      groupSize: 3 },
    { title: 'Break', sectionType: 'break', durationMinutes: 10, isBreak: true, questionSlots: [] },
    // ─── Reading ──────────────────────────────────────────────────────────────
    { title: 'Part 5 — Incomplete Sentences', subtitle: '30 câu', sectionType: 'reading', durationMinutes: 0, isBreak: false,
      instruction: 'Choose the word or phrase that best completes the sentence.',
      questionSlots: makeSlots('incomplete_sentence', 30, { time: 10, options: 4 }) },
    { title: 'Part 6 — Text Completion', subtitle: '16 câu (4 đoạn × 4 chỗ trống)', sectionType: 'reading', durationMinutes: 0, isBreak: false,
      instruction: 'Read each passage and choose the best answer for each blank.',
      questionSlots: makeSlots('text_completion', 16, { time: 12, options: 4 }),
      groupSize: 4 },
    // Part 7: 54 questions — variable group sizes per passage
    // Single passages: 10 passages with 2-4 questions each = 29 questions
    // Double passages: 2 sets × 5 questions = 10 questions
    // Triple passages: 3 sets × 5 questions = 15 questions
    { title: 'Part 7 — Reading Comprehension', subtitle: '54 câu (đơn + kép + ba)', sectionType: 'reading', durationMinutes: 0, isBreak: false,
      instruction: 'Read the passages and answer the questions.',
      questionSlots: [
        // Single passages (10 passages, 29 questions total)
        ...makeSlots('reading_comprehension_single', 2, { time: 12, options: 4 }),  // Passage 1: 2 Qs
        ...makeSlots('reading_comprehension_single', 3, { time: 12, options: 4 }),  // Passage 2: 3 Qs
        ...makeSlots('reading_comprehension_single', 2, { time: 12, options: 4 }),  // Passage 3: 2 Qs
        ...makeSlots('reading_comprehension_single', 3, { time: 12, options: 4 }),  // Passage 4: 3 Qs
        ...makeSlots('reading_comprehension_single', 2, { time: 12, options: 4 }),  // Passage 5: 2 Qs
        ...makeSlots('reading_comprehension_single', 3, { time: 12, options: 4 }),  // Passage 6: 3 Qs
        ...makeSlots('reading_comprehension_single', 3, { time: 12, options: 4 }),  // Passage 7: 3 Qs
        ...makeSlots('reading_comprehension_single', 4, { time: 12, options: 4 }),  // Passage 8: 4 Qs
        ...makeSlots('reading_comprehension_single', 3, { time: 12, options: 4 }),  // Passage 9: 3 Qs
        ...makeSlots('reading_comprehension_single', 4, { time: 12, options: 4 }),  // Passage 10: 4 Qs
        // Double passages (2 sets × 5 = 10 questions)
        ...makeSlots('reading_comprehension_double', 5, { time: 12, options: 4 }),  // Double Set 1: 5 Qs
        ...makeSlots('reading_comprehension_double', 5, { time: 12, options: 4 }),  // Double Set 2: 5 Qs
        // Triple passages (3 sets × 5 = 15 questions)
        ...makeSlots('reading_comprehension_triple', 5, { time: 12, options: 4 }),  // Triple Set 1: 5 Qs
        ...makeSlots('reading_comprehension_triple', 5, { time: 12, options: 4 }),  // Triple Set 2: 5 Qs
        ...makeSlots('reading_comprehension_triple', 5, { time: 12, options: 4 }),  // Triple Set 3: 5 Qs
      ],
      passageGroups: [
        // Single passages (10 groups)
        { id: 'p7-s1', questionCount: 2, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s2', questionCount: 3, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s3', questionCount: 2, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s4', questionCount: 3, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s5', questionCount: 2, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s6', questionCount: 3, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s7', questionCount: 3, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s8', questionCount: 4, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s9', questionCount: 3, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        { id: 'p7-s10', questionCount: 4, passageType: 'single', questionTypeId: 'reading_comprehension_single' },
        // Double passages (2 groups)
        { id: 'p7-d1', questionCount: 5, passageType: 'double', questionTypeId: 'reading_comprehension_double' },
        { id: 'p7-d2', questionCount: 5, passageType: 'double', questionTypeId: 'reading_comprehension_double' },
        // Triple passages (3 groups)
        { id: 'p7-t1', questionCount: 5, passageType: 'triple', questionTypeId: 'reading_comprehension_triple' },
        { id: 'p7-t2', questionCount: 5, passageType: 'triple', questionTypeId: 'reading_comprehension_triple' },
        { id: 'p7-t3', questionCount: 5, passageType: 'triple', questionTypeId: 'reading_comprehension_triple' },
      ],
    },
  ],
};

// ─── IELTS Academic (40L + 40R + 2W + Speaking, ~165 min) ──────────────────
export const EXAM_TEMPLATE_IELTS: ExamTemplate = {
  id: 'template-ielts', name: 'IELTS Academic',
  description: 'Listening 40 câu + Reading 40 câu + Writing 2 tasks + Speaking 3 parts',
  certificationType: 'IELTS', durationMinutes: 165, language: 'en', level: 'Advanced',
  scoring: { label: 'IELTS Band', description: 'Band 0-9 (L 30% + R 30% + W 30% + S 10%)', passingScore: 50, maxScore: 100 },
  sections: [
    { title: 'Listening Section 1', subtitle: '10 câu — Hội thoại 2 người', sectionType: 'listening', durationMinutes: 10, isBreak: false,
      instruction: 'Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.',
      questionSlots: [...makeSlots('form_completion', 5, { time: 15 }), ...makeSlots('mc', 5, { time: 15, options: 4 })] },
    { title: 'Listening Section 2', subtitle: '10 câu — Bài nói ngắn', sectionType: 'listening', durationMinutes: 10, isBreak: false,
      instruction: 'Listen to the monologue and answer the questions.',
      questionSlots: [...makeSlots('matching', 5, { time: 15 }), ...makeSlots('mc', 2, { time: 15, options: 4 }),
        ...makeSlots('map_labeling', 2, { time: 15 }), ...makeSlots('sentence_completion', 1, { time: 15 })] },
    { title: 'Listening Section 3', subtitle: '10 câu — Thảo luận học thuật', sectionType: 'listening', durationMinutes: 10, isBreak: false,
      instruction: 'Listen to the discussion and answer the questions.',
      questionSlots: [...makeSlots('matching', 5, { time: 15 }), ...makeSlots('mc', 3, { time: 15, options: 4 }),
        ...makeSlots('sentence_completion', 2, { time: 15 })] },
    { title: 'Listening Section 4', subtitle: '10 câu — Bài giảng học thuật', sectionType: 'listening', durationMinutes: 10, isBreak: false,
      instruction: 'Complete the notes. Write NO MORE THAN TWO WORDS.',
      questionSlots: [...makeSlots('sentence_completion', 6, { time: 15 }), ...makeSlots('note_completion', 4, { time: 15 })] },
    { title: 'Break', sectionType: 'break', durationMinutes: 10, isBreak: true, questionSlots: [] },
    { title: 'Reading Passage 1', subtitle: '14 câu', sectionType: 'reading', durationMinutes: 20, isBreak: false,
      instruction: 'Read the passage and answer the questions.',
      questionSlots: [...makeSlots('true_false_not_given', 4, { time: 30 }), ...makeSlots('matching_headings', 5, { time: 30 }),
        ...makeSlots('sentence_completion', 3, { time: 30 }), ...makeSlots('mc', 2, { time: 30, options: 4 })] },
    { title: 'Reading Passage 2', subtitle: '13 câu', sectionType: 'reading', durationMinutes: 20, isBreak: false,
      instruction: 'Read the passage and answer the questions.',
      questionSlots: [...makeSlots('yes_no_not_given', 5, { time: 30 }), ...makeSlots('matching', 3, { time: 30 }),
        ...makeSlots('mc', 5, { time: 30, options: 4 })] },
    { title: 'Reading Passage 3', subtitle: '13 câu', sectionType: 'reading', durationMinutes: 20, isBreak: false,
      instruction: 'Read the passage and answer the questions.',
      questionSlots: [...makeSlots('mc', 5, { time: 30, options: 4 }), ...makeSlots('matching', 3, { time: 30 }),
        ...makeSlots('sentence_completion', 5, { time: 30 })] },
    { title: 'Break', sectionType: 'break', durationMinutes: 5, isBreak: true, questionSlots: [] },
    { title: 'Writing Task 1', subtitle: 'Báo cáo biểu đồ (≥150 từ, 20 phút)', sectionType: 'writing', durationMinutes: 20, isBreak: false,
      instruction: 'Summarise the information by selecting and reporting the main features.',
      questionSlots: [{ questionTypeId: 'writing_task_1_academic', label: 'Task 1', points: 33, estimatedTime: 1200 }] },
    { title: 'Writing Task 2', subtitle: 'Luận văn (≥250 từ, 40 phút)', sectionType: 'writing', durationMinutes: 40, isBreak: false,
      instruction: 'Write an essay in response to a point of view, argument or problem.',
      questionSlots: [{ questionTypeId: 'writing_task_2', label: 'Task 2', points: 67, estimatedTime: 2400 }] },
    { title: 'Speaking Part 1', subtitle: '5 câu — Giới thiệu', sectionType: 'speaking', durationMinutes: 5, isBreak: false,
      instruction: 'Introduction and interview on familiar topics.',
      questionSlots: makeSlots('speaking_part_1', 5, { points: 4, time: 30 }) },
    { title: 'Speaking Part 2', subtitle: 'Cue Card — Nói 1-2 phút', sectionType: 'speaking', durationMinutes: 5, isBreak: false,
      instruction: 'Describe a topic on a card. You have 1 minute to prepare and speak for 1-2 minutes.',
      questionSlots: [{ questionTypeId: 'speaking_part_2', label: 'Cue Card', points: 15, estimatedTime: 150 }] },
    { title: 'Speaking Part 3', subtitle: '5 câu — Thảo luận chuyên sâu', sectionType: 'speaking', durationMinutes: 5, isBreak: false,
      instruction: 'Discussion on abstract ideas related to Part 2 topic.',
      questionSlots: makeSlots('speaking_part_3', 5, { points: 4, time: 45 }) },
  ],
};

// ─── VSTEP (40L + 40R + 2W + Speaking, ~165 min) ──────────────────────────
export const EXAM_TEMPLATE_VSTEP: ExamTemplate = {
  id: 'template-vstep', name: 'VSTEP',
  description: 'Listening 40 + Reading 40 + Writing 2 tasks + Speaking 3 parts',
  certificationType: 'VSTEP', durationMinutes: 165, language: 'en', level: 'Intermediate',
  scoring: { label: 'VSTEP Band', description: 'Band 3-9', passingScore: 50, maxScore: 100 },
  sections: [
    { title: 'Listening', subtitle: '40 câu', sectionType: 'listening', durationMinutes: 30, isBreak: false,
      instruction: 'Listen to 4 sections and answer the questions.',
      questionSlots: [...makeSlots('short_conv_mc', 10, { time: 15, options: 4 }), ...makeSlots('long_conv_mc', 10, { time: 15, options: 4 }),
        ...makeSlots('short_talk_gap', 10, { time: 15 }), ...makeSlots('lecture_mc', 10, { time: 15, options: 4 })] },
    { title: 'Reading', subtitle: '40 câu', sectionType: 'reading', durationMinutes: 60, isBreak: false,
      instruction: 'Read 3 passages and answer the questions.',
      questionSlots: [...makeSlots('factual_reading_mc', 14, { time: 20, options: 4 }),
        ...makeSlots('opinion_tfng', 12, { time: 20, options: 3 }), ...makeSlots('argument_matching', 14, { time: 20 })] },
    { title: 'Writing', subtitle: '2 bài viết', sectionType: 'writing', durationMinutes: 60, isBreak: false,
      instruction: 'Write an email/letter and an essay.',
      questionSlots: [
        { questionTypeId: 'email_writing', label: 'Task 1 — Email/Letter (150-180 từ)', points: 50, estimatedTime: 1800 },
        { questionTypeId: 'essay_writing_vstep', label: 'Task 2 — Essay (250-300 từ)', points: 50, estimatedTime: 1800 },
      ] },
    { title: 'Speaking', subtitle: '3 phần, 12-15 phút', sectionType: 'speaking', durationMinutes: 15, isBreak: false,
      instruction: 'Face-to-face interview with examiner.',
      questionSlots: [
        ...makeSlots('speaking_interview_vstep', 5, { points: 10, time: 30 }),
        ...makeSlots('speaking_picture', 3, { points: 15, time: 60 }),
        ...makeSlots('speaking_discussion_vstep', 4, { points: 10, time: 45 }),
      ] },
  ],
};

// ─── Cambridge B2 First (FCE) ──────────────────────────────────────────────
export const EXAM_TEMPLATE_CAMBRIDGE_FCE: ExamTemplate = {
  id: 'template-cambridge-fce', name: 'Cambridge B2 First (FCE)',
  description: 'Use of English + Reading + Writing + Listening + Speaking, tương đương B2 CEFR',
  certificationType: 'CAMBRIDGE', durationMinutes: 235, language: 'en', level: 'Upper-Intermediate',
  scoring: { label: 'Cambridge Score', description: '142-190 (A: 180+, B: 173+, C: 160+)', passingScore: 60, maxScore: 100 },
  sections: [
    { title: 'Use of English', subtitle: '32 câu — Ngữ pháp & từ vựng', sectionType: 'reading', durationMinutes: 45, isBreak: false,
      instruction: 'Complete the sentences and text with the correct words.',
      questionSlots: [...makeSlots('multiple_choice_cloze', 8, { time: 30, options: 4 }),
        ...makeSlots('open_cloze', 8, { time: 30 }), ...makeSlots('word_formation', 8, { time: 30 }),
        ...makeSlots('key_word_transformation', 8, { time: 30, points: 2 })] },
    { title: 'Reading', subtitle: '19 câu', sectionType: 'reading', durationMinutes: 45, isBreak: false,
      instruction: 'Read the texts and answer the questions.',
      questionSlots: [...makeSlots('multiple_choice_reading', 6, { time: 45, options: 4, points: 2 }),
        ...makeSlots('gapped_text', 7, { time: 45, points: 2 }), ...makeSlots('multiple_matching', 6, { time: 45, points: 2 })] },
    { title: 'Writing', subtitle: '2 bài', sectionType: 'writing', durationMinutes: 80, isBreak: false,
      instruction: 'Write an essay and choose one task (review/letter/story).',
      questionSlots: [
        { questionTypeId: 'essay_writing', label: 'Part 1 — Essay (220-260 từ)', points: 20, estimatedTime: 2400 },
        { questionTypeId: 'long_writing', label: 'Part 2 — Review/Letter/Story (220-260 từ)', points: 20, estimatedTime: 2400 },
      ] },
    { title: 'Listening', subtitle: '23 câu', sectionType: 'listening', durationMinutes: 40, isBreak: false,
      instruction: 'Listen to the recordings and answer the questions.',
      questionSlots: [...makeSlots('listening_mc', 7, { time: 30, options: 3 }),
        ...makeSlots('sentence_completion_listening', 6, { time: 30 }),
        ...makeSlots('listening_mc', 5, { time: 30, options: 3 }),
        ...makeSlots('multiple_matching_listening', 5, { time: 30 })] },
    { title: 'Speaking', subtitle: '4 Parts, 14 phút', sectionType: 'speaking', durationMinutes: 14, isBreak: false,
      instruction: 'Face-to-face interview in 4 parts.',
      questionSlots: [
        ...makeSlots('speaking_interview', 4, { points: 5, time: 30 }),
        ...makeSlots('speaking_long_turn', 1, { points: 10, time: 120 }),
        ...makeSlots('speaking_collaborative', 1, { points: 5, time: 120 }),
        ...makeSlots('speaking_discussion', 4, { points: 5, time: 90 }),
      ] },
  ],
};

// ─── Registry ──────────────────────────────────────────────────────────────
export const EXAM_TEMPLATES: ExamTemplate[] = [
  EXAM_TEMPLATE_TOEIC,
  EXAM_TEMPLATE_IELTS,
  EXAM_TEMPLATE_VSTEP,
  EXAM_TEMPLATE_CAMBRIDGE_FCE,
];

export function getTemplateById(id: string): ExamTemplate | undefined {
  return EXAM_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCertificationType(type: string): ExamTemplate[] {
  return EXAM_TEMPLATES.filter((t) => t.certificationType === type);
}
