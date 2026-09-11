// ─── Exam Content Editor — Type Definitions ──────────────────────────────────
// Types for the new Exam Content Editor that replaces the fragmented Question Builder flow.

import type { AnswerOptionItem } from './question.types';

/** Section types supported by the exam content editor */
export type SectionType = 'listening' | 'reading' | 'writing' | 'speaking' | 'break';

/** Question data within a section (embedded, not linked) */
export interface ExamSectionQuestion {
  id: string;
  order: number;
  questionType: string;
  questionText: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  
  // Answer data
  options: AnswerOptionItem[];
  modelAnswer?: string;
  rubric?: string;
  
  // Metadata
  explanation?: string;
  detailedExplanation?: string;
  points: number;
  estimatedTime?: number; // seconds
  
  // Format-specific fields
  audioMediaId?: string;
  imageMediaId?: string;
  passageGroupId?: string;
  subQuestionNumber?: number;
  
  // TOEIC Part 6/7 fields
  /** Passage text for Part 6 (text completion) and Part 7 (reading comprehension) */
  passageText?: string;
  /** For Part 6: which blank number this question corresponds to */
  blankIndex?: number;
  /** For Part 7: passage type (single, double, triple) */
  passageType?: string;
  /** For Part 7: passage title (double/triple passages) */
  passageTitle?: string;
  /** For Part 7: sub-questions linked to a passage */
  subQuestions?: ExamSectionQuestion[];
  /** Flexible metadata for per-exam extra data (e.g., choices layout for TOEIC) */
  formatMetadata?: Record<string, unknown>;
  
  // Status tracking
  status?: 'Local' | 'Saving' | 'Saved' | 'Error';
}

/** Section content within the exam */
export interface ExamSectionContent {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  sectionType: SectionType;
  instruction?: string;
  durationMinutes: number;
  questionCount: number;
  isBreak: boolean;
  
  // Section-specific content
  audioMediaId?: string;
  passageText?: string;
  passageTitle?: string;
  passageType?: string;
  scriptText?: string;
  speakers?: string[];
  
  // Embedded questions
  questions: ExamSectionQuestion[];
  
  // Status tracking
  status?: 'Local' | 'Saving' | 'Saved' | 'Error';
}

/** Exam settings form state */
export interface ExamContentSettings {
  title: string;
  description: string;
  level: string;
  language: string;
  passingScore: number;
  maxScore: number;
  examType: string;
  certificationType: string;
  duration: number; // total exam duration in minutes
}

/** Full exam content state */
export interface ExamContentState {
  exam: ExamContentSettings;
  sections: ExamSectionContent[];
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt?: Date;
  /** When true, sections are predefined (TOEIC fixed structure) */
  isFixedStructure?: boolean;
  /** Exam publish status from API */
  publishStatus?: 'draft' | 'published';
  /** IDs of questions modified since last save (for differential PATCH) */
  dirtyQuestionIds?: Set<string>;
  /** IDs of sections that contain dirty questions (for differential PATCH) */
  dirtySectionIds?: Set<string>;
  /** True when exam-level settings changed (title, description, etc.) */
  dirtyExamSettings?: boolean;
  /** IDs of questions deleted since last save (for differential PATCH) */
  deletedQuestionIds?: Set<string>;
}

/** Validation issue for a section */
export interface SectionValidationIssue {
  sectionId: string;
  sectionTitle: string;
  issueType: 'missing_content' | 'missing_answer' | 'missing_questions' | 'invalid_format' | 'warning';
  message: string;
  questionId?: string;
}

/** Props for the exam content editor container */
export interface ExamContentEditorContainerProps {
  examId: string;
}
