// ─── Exam Builder — Pure Helpers ────────────────────────────────────────────────
// Stateless mapping, computation, and reconciliation functions.
// No hooks, no side effects — pure data transformations.

import type { ExamSection, ExamQuestion } from '../types';
import type { BuilderQuestion, BuilderSection, ExamBlueprint } from '../types/exam-builder.types';

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_QUESTION_TYPE = 'Single Choice';
const DEFAULT_DIFFICULTY = 'Medium';

/** UUID regex: checks if a string is a real UUID (not a temporary/default section ID) */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Check if a section ID is temporary (not a real UUID from DB) */
export function isTemporarySectionId(id: string): boolean {
  return !UUID_REGEX.test(id);
}

// ─── API → Builder Mapping ─────────────────────────────────────────────────────

/** Map API question type string to builder UI type */
export function mapQuestionType(apiType?: string): BuilderQuestion['type'] {
  switch (apiType) {
    case 'MULTIPLE_CHOICE':
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'SHORT_ANSWER':
    case 'fill_in_blank':
      return 'Fill in Blank';
    case 'essay':
      return 'Essay';
    case 'SINGLE_CHOICE':
    case 'single_choice':
    default:
      return 'Single Choice';
  }
}

/** Map a single API ExamQuestion to BuilderQuestion */
export function mapExamQuestion(examQuestion: ExamQuestion, index: number): BuilderQuestion {
  return {
    id: examQuestion.id,
    number: index + 1,
    title: examQuestion.questionText || examQuestion.content || '',
    partTag: '',
    type: mapQuestionType(examQuestion.questionType),
    difficulty: DEFAULT_DIFFICULTY as BuilderQuestion['difficulty'],
    points: examQuestion.points ?? 1,
    imageUrl: null,
    status: 'Linked',
  };
}

/** Map an API ExamSection to BuilderSection */
export function mapApiSection(apiSection: ExamSection, index: number): BuilderSection {
  const questions = (apiSection.questions || []).map(mapExamQuestion);
  return {
    id: apiSection.id,
    number: index + 1,
    title: apiSection.title,
    subtitle: apiSection.description || apiSection.sectionType,
    sectionType: apiSection.sectionType || 'general',
    questionCount: apiSection.questionCount ?? questions.length,
    durationMinutes: apiSection.durationMinutes || 0,
    isBreak: apiSection.sectionType === 'BREAK' || apiSection.isBreak || false,
    questions,
  };
}

// ─── Builder → API Mapping ─────────────────────────────────────────────────────

/** Map builder sections to the payload format expected by saveExamSections API */
export function mapSectionsToSavePayload(sections: BuilderSection[]) {
  return sections.map((section) => ({
    id: isTemporarySectionId(section.id) ? undefined : section.id,
    title: section.title,
    sectionType: section.sectionType,
    instruction: section.subtitle,
    order: section.number,
    durationMinutes: section.durationMinutes,
  }));
}

// ─── Reconciliation ────────────────────────────────────────────────────────────

/** After saving new sections (temp IDs), reconcile with server-assigned IDs */
export function reconcileSavedSectionIds(prev: BuilderSection[], savedIds: string[]): BuilderSection[] {
  let changed = false;
  const updated = prev.map((section, index) => {
    if (isTemporarySectionId(section.id) && savedIds[index]) {
      changed = true;
      return { ...section, id: savedIds[index] };
    }
    return section;
  });
  return changed ? updated : prev;
}

// ─── Blueprint Computation ─────────────────────────────────────────────────────

/** Compute exam blueprint summary (totals, per-skill breakdowns) */
export function computeBlueprint(sections: BuilderSection[]): ExamBlueprint {
  let totalQuestions = 0;
  let totalTimeMinutes = 0;
  let totalPoints = 0;
  let listeningQuestions = 0;
  let listeningTime = 0;
  let readingQuestions = 0;
  let readingTime = 0;
  let writingQuestions = 0;
  let writingTime = 0;
  let speakingQuestions = 0;
  let speakingTime = 0;
  let mathQuestions = 0;
  let mathTime = 0;

  for (const section of sections) {
    const qCount = section.questions.length > 0 ? section.questions.length : section.questionCount;
    totalQuestions += qCount;
    totalTimeMinutes += section.durationMinutes;
    for (const q of section.questions) {
      totalPoints += q.points;
    }

    switch (section.sectionType) {
      case 'listening':
        listeningQuestions += qCount;
        listeningTime += section.durationMinutes;
        break;
      case 'reading':
        readingQuestions += qCount;
        readingTime += section.durationMinutes;
        break;
      case 'writing':
        writingQuestions += qCount;
        writingTime += section.durationMinutes;
        break;
      case 'speaking':
        speakingQuestions += qCount;
        speakingTime += section.durationMinutes;
        break;
      case 'math':
        mathQuestions += qCount;
        mathTime += section.durationMinutes;
        break;
    }
  }

  const hours = Math.floor(totalTimeMinutes / 60);
  const remainingMinutes = totalTimeMinutes % 60;

  return {
    totalQuestions,
    totalTimeMinutes,
    durationText: `${hours}h ${remainingMinutes}m`,
    totalPoints,
    listening: { questions: listeningQuestions, timeMinutes: listeningTime },
    reading: { questions: readingQuestions, timeMinutes: readingTime },
    writing: { questions: writingQuestions, timeMinutes: writingTime },
    speaking: { questions: speakingQuestions, timeMinutes: speakingTime },
    math: { questions: mathQuestions, timeMinutes: mathTime },
  };
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

/** Create a new section with default values */
export function createNewSection(nextNumber: number): BuilderSection {
  return {
    id: `section-${Date.now()}`,
    number: nextNumber,
    title: `Section ${nextNumber}`,
    subtitle: 'Custom Part',
    sectionType: 'general',
    questionCount: 0,
    durationMinutes: 30,
    isBreak: false,
    questions: [],
  };
}

/** Create a new question with default values */
export function createNewQuestion(nextNumber: number): BuilderQuestion {
  return {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    number: nextNumber,
    title: `New Question ${nextNumber}`,
    partTag: '',
    type: DEFAULT_QUESTION_TYPE as BuilderQuestion['type'],
    difficulty: 'Easy',
    points: 1,
    imageUrl: null,
    status: 'Local',
  };
}
