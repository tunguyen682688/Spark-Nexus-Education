// ─── Exam-Type-Specific Section Configuration ────────────────────────────────
// Maps (certificationType, sectionType) → section fields, question groups, hints.
// Used by FlatListEditor to render type-specific section editing UI.

import type { SectionType } from '../types/exam-content-editor.types';

export interface SectionFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url';
  placeholder?: string;
  required?: boolean;
}

export interface QuestionGroupConfig {
  label: string;
  questionTypeIds: string[];
}

export interface ExamTypeSectionConfig {
  sectionFields: SectionFieldConfig[];
  questionGroups: QuestionGroupConfig[];
  hints: string[];
}

// ─── Config Registry ─────────────────────────────────────────────────────────

const TOEIC_LISTENING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'audioMediaId', label: 'Audio URL', type: 'url', placeholder: 'https://...mp3', required: true },
    { key: 'scriptText', label: 'Script / Transcript', type: 'textarea', placeholder: 'Transcript của bài nghe...' },
  ],
  questionGroups: [
    { label: 'Part 1 — Photographs', questionTypeIds: ['photograph_choice'] },
    { label: 'Part 2 — Question-Response', questionTypeIds: ['question_response'] },
    { label: 'Part 3 — Conversations', questionTypeIds: ['conversation_mc'] },
    { label: 'Part 4 — Short Talks', questionTypeIds: ['short_talk_mc'] },
  ],
  hints: [
    'Mỗi Part cần file audio riêng.',
    'Part 1: 6 câu mô tả ảnh. Part 2: 25 câu hỏi-đáp. Part 3: 39 câu (13 hội thoại×3). Part 4: 30 câu (10 bài×3).',
  ],
};

const TOEIC_READING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Passage / Đoạn văn', type: 'textarea', placeholder: 'Nội dung đoạn văn...' },
    { key: 'passageTitle', label: 'Passage Title', type: 'text' },
  ],
  questionGroups: [
    { label: 'Part 5 — Incomplete Sentences', questionTypeIds: ['incomplete_sentence'] },
    { label: 'Part 6 — Text Completion', questionTypeIds: ['text_completion'] },
    { label: 'Part 7 — Reading Comprehension', questionTypeIds: ['reading_comprehension_single', 'reading_comprehension_double'] },
  ],
  hints: [
    'Part 5: 30 câu điền từ. Part 6: 16 câu (4 đoạn×4 chỗ). Part 7: 54 câu (đơn + kép).',
    'Part 6/7 cần passage text.',
  ],
};

const IELTS_LISTENING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'audioMediaId', label: 'Audio URL', type: 'url', placeholder: 'https://...mp3', required: true },
    { key: 'scriptText', label: 'Script / Transcript', type: 'textarea', placeholder: 'Transcript...' },
  ],
  questionGroups: [
    { label: 'Form / Note Completion', questionTypeIds: ['form_completion', 'note_completion', 'sentence_completion'] },
    { label: 'Multiple Choice', questionTypeIds: ['mc'] },
    { label: 'Matching / Labeling', questionTypeIds: ['matching', 'map_labeling'] },
  ],
  hints: [
    '4 sections: Section 1 (2 người), Section 2 (bài nói ngắn), Section 3 (học thuật), Section 4 (bài giảng).',
    'Mỗi section có audio riêng. Viết HOA HẠT, KHÔNG QUÁ 2 TỪ.',
  ],
};

const IELTS_READING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Passage Text', type: 'textarea', placeholder: 'Nội dung bài đọc...', required: true },
    { key: 'passageTitle', label: 'Passage Title', type: 'text' },
    { key: 'passageType', label: 'Passage Type', type: 'text', placeholder: 'Academic / General' },
  ],
  questionGroups: [
    { label: 'True / False / Not Given', questionTypeIds: ['true_false_not_given'] },
    { label: 'Yes / No / Not Given', questionTypeIds: ['yes_no_not_given'] },
    { label: 'Matching', questionTypeIds: ['matching', 'matching_headings'] },
    { label: 'Multiple Choice', questionTypeIds: ['mc'] },
    { label: 'Sentence Completion', questionTypeIds: ['sentence_completion'] },
  ],
  hints: [
    '3 passages: Passage 1 (14 câu), Passage 2 (13 câu), Passage 3 (13 câu).',
    'Mỗi passage cần passage text đầy đủ.',
  ],
};

const IELTS_WRITING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Task Prompt / Đề bài', type: 'textarea', placeholder: 'Đề bài写作...' },
  ],
  questionGroups: [
    { label: 'Task 1 — Academic Report', questionTypeIds: ['writing_task_1_academic'] },
    { label: 'Task 2 — Essay', questionTypeIds: ['writing_task_2'] },
  ],
  hints: [
    'Task 1: ≥150 từ, 20 phút. Tóm tắt biểu đồ/bảng.',
    'Task 2: ≥250 từ, 40 phút. Luận văn.',
  ],
};

const IELTS_SPEAKING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Cue Card / Prompts', type: 'textarea', placeholder: 'Describe a time when...' },
  ],
  questionGroups: [
    { label: 'Part 1 — Introduction', questionTypeIds: ['speaking_part_1'] },
    { label: 'Part 2 — Cue Card', questionTypeIds: ['speaking_part_2'] },
    { label: 'Part 3 — Discussion', questionTypeIds: ['speaking_part_3'] },
  ],
  hints: [
    'Part 1: 5 câu giới thiệu. Part 2: Nói 1-2 phút. Part 3: Thảo luận chuyên sâu.',
  ],
};

const VSTEP_LISTENING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'audioMediaId', label: 'Audio URL', type: 'url', placeholder: 'https://...mp3', required: true },
    { key: 'scriptText', label: 'Script / Transcript', type: 'textarea' },
  ],
  questionGroups: [
    { label: 'Short Conversation MC', questionTypeIds: ['short_conv_mc'] },
    { label: 'Long Conversation MC', questionTypeIds: ['long_conv_mc'] },
    { label: 'Gap Fill / Talk', questionTypeIds: ['short_talk_gap'] },
    { label: 'Lecture MC', questionTypeIds: ['lecture_mc'] },
  ],
  hints: [
    '40 câu: 10 short conv + 10 long conv + 10 gap fill + 10 lecture.',
  ],
};

const VSTEP_READING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Passage Text', type: 'textarea', placeholder: 'Nội dung bài đọc...', required: true },
    { key: 'passageTitle', label: 'Passage Title', type: 'text' },
  ],
  questionGroups: [
    { label: 'Factual Reading MC', questionTypeIds: ['factual_reading_mc'] },
    { label: 'Opinion T/F/NG', questionTypeIds: ['opinion_tfng'] },
    { label: 'Argument Matching', questionTypeIds: ['argument_matching'] },
  ],
  hints: [
    '40 câu: 14 factual MC + 12 opinion T/F/NG + 14 argument matching.',
  ],
};

const VSTEP_WRITING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Task Prompt / Đề bài', type: 'textarea', placeholder: 'Đề bài...' },
  ],
  questionGroups: [
    { label: 'Task 1 — Email/Letter (150-180 từ)', questionTypeIds: ['email_writing'] },
    { label: 'Task 2 — Essay (250-300 từ)', questionTypeIds: ['essay_writing_vstep'] },
  ],
  hints: [
    'Task 1: Email/letter 150-180 từ. Task 2: Essay 250-300 từ.',
  ],
};

const VSTEP_SPEAKING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Prompts / Cue Cards', type: 'textarea', placeholder: 'Describe your favorite...' },
  ],
  questionGroups: [
    { label: 'Interview', questionTypeIds: ['speaking_interview_vstep'] },
    { label: 'Picture Description', questionTypeIds: ['speaking_picture'] },
    { label: 'Discussion', questionTypeIds: ['speaking_discussion_vstep'] },
  ],
  hints: [
    'Interview 5 câu + Picture 3 cue cards + Discussion 4 câu.',
  ],
};

const CAMBRIDGE_READING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Passage / Text', type: 'textarea', placeholder: 'Nội dung...', required: true },
    { key: 'passageTitle', label: 'Passage Title', type: 'text' },
  ],
  questionGroups: [
    { label: 'Multiple Choice Cloze', questionTypeIds: ['multiple_choice_cloze'] },
    { label: 'Open Cloze', questionTypeIds: ['open_cloze'] },
    { label: 'Word Formation', questionTypeIds: ['word_formation'] },
    { label: 'Key Word Transformation', questionTypeIds: ['key_word_transformation'] },
    { label: 'Multiple Choice Reading', questionTypeIds: ['multiple_choice_reading'] },
    { label: 'Gapped Text', questionTypeIds: ['gapped_text'] },
    { label: 'Multiple Matching', questionTypeIds: ['multiple_matching'] },
  ],
  hints: [
    'Use of English: 32 câu (8 MC cloze + 8 open cloze + 8 word form + 8 KWT).',
    'Reading: 19 câu (6 MC + 7 gapped + 6 matching).',
  ],
};

const CAMBRIDGE_WRITING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Task Prompt / Đề bài', type: 'textarea', placeholder: 'Đề bài...' },
  ],
  questionGroups: [
    { label: 'Part 1 — Essay (220-260 từ)', questionTypeIds: ['essay_writing'] },
    { label: 'Part 2 — Review/Letter/Story', questionTypeIds: ['long_writing'] },
  ],
  hints: [
    'Part 1: Essay 220-260 từ. Part 2: Chọn 1 trong 3 (review/letter/story).',
  ],
};

const CAMBRIDGE_LISTENING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'audioMediaId', label: 'Audio URL', type: 'url', placeholder: 'https://...mp3', required: true },
    { key: 'scriptText', label: 'Script / Transcript', type: 'textarea' },
  ],
  questionGroups: [
    { label: 'Multiple Choice', questionTypeIds: ['listening_mc'] },
    { label: 'Sentence Completion', questionTypeIds: ['sentence_completion_listening'] },
    { label: 'Multiple Matching', questionTypeIds: ['multiple_matching_listening'] },
  ],
  hints: [
    '23 câu: 7 MC + 6 sentence + 5 MC + 5 matching.',
  ],
};

const CAMBRIDGE_SPEAKING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Prompts / Visuals', type: 'textarea', placeholder: 'Prompts...' },
  ],
  questionGroups: [
    { label: 'Interview', questionTypeIds: ['speaking_interview'] },
    { label: 'Long Turn', questionTypeIds: ['speaking_long_turn'] },
    { label: 'Collaborative Task', questionTypeIds: ['speaking_collaborative'] },
    { label: 'Discussion', questionTypeIds: ['speaking_discussion'] },
  ],
  hints: [
    '4 parts: Interview (4 câu) + Long Turn (1-2 phút) + Collaborative + Discussion.',
  ],
};

// ─── Generic fallbacks ───────────────────────────────────────────────────────

const GENERIC_LISTENING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'audioMediaId', label: 'Audio URL', type: 'url', placeholder: 'https://...', required: true },
    { key: 'scriptText', label: 'Script', type: 'textarea' },
  ],
  questionGroups: [],
  hints: ['Cần file audio cho section này.'],
};

const GENERIC_READING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Passage Text', type: 'textarea', required: true },
    { key: 'passageTitle', label: 'Passage Title', type: 'text' },
  ],
  questionGroups: [],
  hints: ['Cần nội dung bài đọc.'],
};

const GENERIC_WRITING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Task Prompt', type: 'textarea' },
  ],
  questionGroups: [],
  hints: [],
};

const GENERIC_SPEAKING: ExamTypeSectionConfig = {
  sectionFields: [
    { key: 'passageText', label: 'Prompts', type: 'textarea' },
  ],
  questionGroups: [],
  hints: [],
};

// ─── Registry ────────────────────────────────────────────────────────────────

const SECTION_CONFIG_REGISTRY: Record<string, Record<SectionType, ExamTypeSectionConfig>> = {
  TOEIC: { listening: TOEIC_LISTENING, reading: TOEIC_READING, writing: GENERIC_WRITING, speaking: GENERIC_SPEAKING, break: { sectionFields: [], questionGroups: [], hints: [] } },
  IELTS: { listening: IELTS_LISTENING, reading: IELTS_READING, writing: IELTS_WRITING, speaking: IELTS_SPEAKING, break: { sectionFields: [], questionGroups: [], hints: [] } },
  VSTEP: { listening: VSTEP_LISTENING, reading: VSTEP_READING, writing: VSTEP_WRITING, speaking: VSTEP_SPEAKING, break: { sectionFields: [], questionGroups: [], hints: [] } },
  CAMBRIDGE: { listening: CAMBRIDGE_LISTENING, reading: CAMBRIDGE_READING, writing: CAMBRIDGE_WRITING, speaking: CAMBRIDGE_SPEAKING, break: { sectionFields: [], questionGroups: [], hints: [] } },
};

export function getSectionConfig(certType: string, sectionType: SectionType): ExamTypeSectionConfig {
  const certKey = certType.toUpperCase();
  if (SECTION_CONFIG_REGISTRY[certKey]?.[sectionType]) {
    return SECTION_CONFIG_REGISTRY[certKey][sectionType];
  }
  // Fallback to generic
  const fallbackMap: Record<SectionType, ExamTypeSectionConfig> = {
    listening: GENERIC_LISTENING,
    reading: GENERIC_READING,
    writing: GENERIC_WRITING,
    speaking: GENERIC_SPEAKING,
    break: { sectionFields: [], questionGroups: [], hints: [] },
  };
  return fallbackMap[sectionType];
}

export function getExamTypeFromCertification(certType: string): string {
  const map: Record<string, string> = {
    TOEIC: 'TOEIC',
    IELTS: 'IELTS',
    VSTEP: 'VSTEP',
    CAMBRIDGE: 'CAMBRIDGE',
    TOEFL: 'TOEFL',
    SAT: 'SAT',
  };
  return map[certType.toUpperCase()] || certType.toUpperCase();
}
