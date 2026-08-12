import type { GrammarBlock } from '../types';

interface LessonTemplate {
  title: string;
  vietnameseTitle: string;
  level: string;
  tags: string[];
  blocks: GrammarBlock[];
}

const STANDARD_TEMPLATE: LessonTemplate = {
  title: 'The Present Perfect Tense',
  vietnameseTitle: 'Thì Hiện tại hoàn thành',
  level: 'B2',
  tags: ['TENSES', 'INTERMEDIATE'],
  blocks: [
    { id: 'block-media-init', type: 'media', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', provider: 'youtube', blockLabel: 'Video Lecture' },
    { id: 'block-text-init-1', type: 'text', content: '### Usage & Concept\n\nThe present perfect tense is used to describe an action that happened at an unspecified time in the past, or an action that began in the past and continues to the present.', blockLabel: 'Usage & Concept' },
    { id: 'block-formula-init', type: 'formula', elements: ['[Subject]', '+', 'have / has', '+', 'Past Participle (V3)'], note: 'Structure of Present Perfect', blockLabel: 'Structure Formula' },
    { id: 'block-example-init', type: 'example', items: [
      { text: 'I have lived in Hanoi for five years.', explanation: 'Action started in the past and is still true today (I still live in Hanoi).' },
      { text: 'She has already finished her homework.', explanation: 'The action is completed in the past, but the time is not specific.' },
    ], blockLabel: 'Examples in Context' },
    { id: 'block-quiz-init', type: 'quiz', question: 'Complete the sentence:\n"They _____ (know) each other since high school."', options: ['knew', 'have known', 'has known'], answer: 'have known', blockLabel: 'Knowledge Check' },
  ],
};

const PRACTICE_TEMPLATE: LessonTemplate = {
  title: 'Present Simple vs Present Continuous',
  vietnameseTitle: 'Thì Hiện tại đơn vs Hiện tại tiếp diễn',
  level: 'A2',
  tags: ['TENSES', 'FOUNDATION', 'PRACTICE'],
  blocks: [
    { id: 'block-text-prac-1', type: 'text', content: '### Action vs State\n\nUse the Present Simple for habits, facts, and permanent situations. Use the Present Continuous for actions happening right now, temporary situations, or trends.', blockLabel: 'Concept Comparison' },
    { id: 'block-example-prac-1', type: 'example', items: [
      { text: 'He usually drinks tea, but today he is drinking coffee.', explanation: 'drinks: habit (Present Simple) | is drinking: exception happening today (Present Continuous).' },
      { text: 'Water boils at 100 degrees Celsius.', explanation: 'Scientific fact, always true.' },
    ], blockLabel: 'Examples in Context' },
    { id: 'block-quiz-prac-1', type: 'quiz', question: 'Choose the correct form:\n"Shh! The baby _____ (sleep) right now."', options: ['sleeps', 'is sleeping', 'sleeping'], answer: 'is sleeping', blockLabel: 'Practice Quiz 1' },
    { id: 'block-quiz-prac-2', type: 'quiz', question: 'Choose the correct form:\n"Every Sunday, we _____ (visit) our grandparents."', options: ['are visiting', 'visit', 'visits'], answer: 'visit', blockLabel: 'Practice Quiz 2' },
  ],
};

const ACADEMIC_TEMPLATE: LessonTemplate = {
  title: 'Advanced Subjunctive Mood',
  vietnameseTitle: 'Thể giả định nâng cao',
  level: 'C2',
  tags: ['SUBJUNCTIVE', 'ADVANCED', 'FORMAL'],
  blocks: [
    { id: 'block-media-acad', type: 'media', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', provider: 'youtube', blockLabel: 'Advanced Lecture' },
    { id: 'block-text-acad-1', type: 'text', content: '### Definition & Formal Usage\n\nThe subjunctive mood is used to express wishes, proposals, suggestions, or hypothetical situations. In English, it uses the bare form of the verb (infinitive without "to"), even for third person singular subjects.', blockLabel: 'Academic Concept' },
    { id: 'block-formula-acad', type: 'formula', elements: ['[Subject]', '+', 'demand / suggest / insist', '+', 'that', '+', '[Subject]', '+', 'bare infinitive'], note: 'Formula for Mandative Subjunctive', blockLabel: 'Subjunctive Formula' },
    { id: 'block-callout-acad', type: 'callout', title: 'ACADEMIC INSIGHT: ABSENCE OF "S" AND "SHOULD"', content: 'In formal American English, the "should" is omitted and the verb has no third-person "s".\n\nExample: *We insist that he be present.* (NOT *he is present* or *he should be present* in highly formal context).', blockLabel: 'Critical Analysis' },
    { id: 'block-quiz-acad', type: 'quiz', question: 'Select the highly formal subjunctive sentence:\n"The doctor recommended that she _____ some rest."', options: ['takes', 'took', 'take', 'should take'], answer: 'take', blockLabel: 'Elite Quiz' },
  ],
};

export const LESSON_TEMPLATES: Record<'standard' | 'practice' | 'academic', LessonTemplate> = {
  standard: STANDARD_TEMPLATE,
  practice: PRACTICE_TEMPLATE,
  academic: ACADEMIC_TEMPLATE,
};
