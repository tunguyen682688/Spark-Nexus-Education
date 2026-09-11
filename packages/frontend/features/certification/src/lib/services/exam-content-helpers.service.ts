import type {
  ExamContentState,
  ExamContentSettings,
  ExamSectionContent,
  ExamSectionQuestion,
  SectionValidationIssue,
} from '../types/exam-content-editor.types';
import type { AnswerOptionItem } from '../types/question.types';

export function isTempId(id: string): boolean {
  return id.startsWith('temp-') || id.startsWith('tmpl-');
}

/** Simple hash of question data for change detection — must match backend hash fields */
export function hashQuestion(q: ExamSectionQuestion): string {
  return JSON.stringify({
    t: q.questionType,
    txt: q.questionText,
    d: q.difficulty,
    o: q.options.map((o) => ({ l: o.label, t: o.text, c: o.isCorrect })),
    m: q.modelAnswer,
    e: q.explanation,
    de: q.detailedExplanation,
    r: q.rubric,
    p: q.points,
    et: q.estimatedTime,
    au: q.audioMediaId,
    im: q.imageMediaId,
    pg: q.passageGroupId,
    pt: q.passageText,
    pp: q.passageType,
    ppo: q.passageTitle,
    bi: q.blankIndex,
    sq: q.subQuestionNumber,
    fm: q.formatMetadata,
  });
}

/** Hash of section metadata for change detection */
export function hashSection(s: ExamSectionContent): string {
  return JSON.stringify({
    title: s.title,
    subtitle: s.subtitle,
    instruction: s.instruction,
    order: s.order,
    durationMinutes: s.durationMinutes,
    audioMediaId: s.audioMediaId,
    scriptText: s.scriptText,
    passageText: s.passageText,
    passageTitle: s.passageTitle,
    passageType: s.passageType,
  });
}

/** Hash of exam settings for change detection */
export function hashExamSettings(e: ExamContentSettings): string {
  return JSON.stringify({
    title: e.title,
    description: e.description,
    level: e.level,
    duration: e.duration,
    passScore: e.passingScore,
    maxScore: e.maxScore,
    examType: e.examType,
    certificationType: e.certificationType,
  });
}

const MC_TYPES = new Set(['mc', 'photograph_choice', 'question_response', 'conversation_mc', 'short_talk_mc', 'incomplete_sentence', 'text_completion', 'reading_comprehension_single', 'reading_comprehension_double', 'reading_comprehension_triple', 'short_conv_mc', 'long_conv_mc', 'factual_reading_mc', 'listening_mc', 'multiple_choice_cloze', 'multiple_choice_reading']);
const FIXED_ANSWER_TYPES = new Set(['true_false_not_given', 'yes_no_not_given', 'opinion_tfng']);

// Part-specific validation rules
const PART_REQUIRES_IMAGE = new Set([1]);        // Part 1: moi cau hoi can imageMediaId
const PART_REQUIRES_AUDIO = new Set([1, 2]);     // Part 1 & 2: moi cau hoi can audioMediaId

export function validateSections(sections: ExamSectionContent[]): SectionValidationIssue[] {
  const issues: SectionValidationIssue[] = [];

  for (const section of sections) {
    if (section.isBreak) continue;

    // Section-level audio check (Parts 3, 4 share audio at section level)
    if (section.sectionType === 'listening' && !section.audioMediaId) {
      issues.push({
        sectionId: section.id,
        sectionTitle: section.title,
        issueType: 'missing_content',
        message: 'Chưa có link âm thanh',
      });
    }

    if (section.questions.length === 0) {
      issues.push({
        sectionId: section.id,
        sectionTitle: section.title,
        issueType: 'missing_questions',
        message: 'Chưa có câu hỏi nào',
      });
    }

    // Check passage groups for Parts 3, 4, 6, 7
    const hasGroupedQuestions = section.questions.some((q) => q.passageGroupId);
    if (hasGroupedQuestions) {
      const groupIds = new Set(section.questions.map((q) => q.passageGroupId).filter(Boolean));
      for (const gid of groupIds) {
        const groupQuestions = section.questions.filter((q) => q.passageGroupId === gid);
        const firstQ = groupQuestions[0];
        if (firstQ && !firstQ.passageText?.trim()) {
          const isListening = section.sectionType === 'listening';
          issues.push({
            sectionId: section.id,
            sectionTitle: section.title,
            issueType: 'missing_content',
            message: `Nhóm câu ${firstQ.order}-${groupQuestions[groupQuestions.length - 1].order}: Chưa có ${isListening ? 'kịch bản' : 'đoạn văn'}`,
            questionId: firstQ.id,
          });
        }
      }
    }

    // Per-question validation
    for (const question of section.questions) {
      // Question text required
      if (!question.questionText?.trim()) {
        issues.push({
          sectionId: section.id,
          sectionTitle: section.title,
          issueType: 'missing_content',
          message: `Câu ${question.order}: Chưa có nội dung câu hỏi`,
          questionId: question.id,
        });
      }

      // Part 1: image required per question
      if (PART_REQUIRES_IMAGE.has(section.order) && !question.imageMediaId?.trim()) {
        issues.push({
          sectionId: section.id,
          sectionTitle: section.title,
          issueType: 'missing_content',
          message: `Câu ${question.order}: Chưa có hình ảnh`,
          questionId: question.id,
        });
      }

      // Part 2: audio required per question (each question has independent audio)
      if (PART_REQUIRES_AUDIO.has(section.order) && !question.audioMediaId?.trim()) {
        issues.push({
          sectionId: section.id,
          sectionTitle: section.title,
          issueType: 'missing_content',
          message: `Câu ${question.order}: Chưa có file âm thanh`,
          questionId: question.id,
        });
      }

      // MC correct answer check (skip if options not loaded yet)
      if (question.options.length > 0 && MC_TYPES.has(question.questionType) && !question.options.some((o: AnswerOptionItem) => o.isCorrect)) {
        issues.push({
          sectionId: section.id,
          sectionTitle: section.title,
          issueType: 'missing_answer',
          message: `Câu ${question.order}: Chưa chọn đáp án đúng`,
          questionId: question.id,
        });
      }

      // Fixed answer types correct answer check (skip if options not loaded yet)
      if (question.options.length > 0 && FIXED_ANSWER_TYPES.has(question.questionType) && !question.options.some((o: AnswerOptionItem) => o.isCorrect)) {
        issues.push({
          sectionId: section.id,
          sectionTitle: section.title,
          issueType: 'missing_answer',
          message: `Câu ${question.order}: Chưa chọn đáp án đúng`,
          questionId: question.id,
        });
      }
    }
  }

  return issues;
}

export function mapStateToSavePayload(
  state: ExamContentState
): {
  title: string;
  description: string;
  level: string;
  duration: number;
  passScore: number;
  maxScore: number;
  examType: string;
  certificationType: string;
  sections: Array<{
    id?: string;
    title: string;
    subtitle?: string;
    sectionType: string;
    instruction?: string;
    order: number;
    durationMinutes: number;
    isBreak: boolean;
    audioMediaId?: string;
    scriptText?: string;
    passageText?: string;
    passageTitle?: string;
    passageType?: string;
    questions: Array<{
      id?: string;
      questionType: string;
      questionText: string;
      difficulty: string;
      options: Array<{ id?: string; label: string; text: string; isCorrect: boolean }>;
      modelAnswer?: string;
      rubric?: unknown;
      explanation?: string;
      points: number;
      estimatedTime?: number;
      audioMediaId?: string;
      imageMediaId?: string;
      passageGroupId?: string;
      passageText?: string;
      passageType?: string;
      passageTitle?: string;
      blankNumber?: number;
      subQuestionNumber?: number;
      formatMetadata?: Record<string, unknown>;
    }>;
  }>;
  sectionMetadata?: Array<{
    id: string;
    title?: string;
    subtitle?: string;
    instruction?: string;
    order?: number;
    durationMinutes?: number;
    audioMediaId?: string;
    scriptText?: string;
    passageText?: string;
    passageTitle?: string;
    passageType?: string;
  }>;
  removedQuestionIds: string[];
} {
  return {
    title: state.exam.title,
    description: state.exam.description,
    level: state.exam.level,
    duration: state.exam.duration,
    passScore: state.exam.passingScore,
    maxScore: state.exam.maxScore,
    examType: state.exam.examType,
    certificationType: state.exam.certificationType,
    sections: state.sections.map((s: ExamSectionContent) => {
      return {
        id: s.id,  // Send temp ID so backend can handle it
        title: s.title,
        subtitle: s.subtitle ?? undefined,
        sectionType: s.sectionType,
        instruction: s.instruction ?? undefined,
        order: s.order,
        durationMinutes: s.durationMinutes,
        isBreak: s.isBreak,
        audioMediaId: s.audioMediaId ?? undefined,
        scriptText: s.scriptText ?? undefined,
        passageText: s.passageText ?? undefined,
        passageTitle: s.passageTitle ?? undefined,
        passageType: s.passageType ?? undefined,
        questions: s.questions.map((q: ExamSectionQuestion) => {
          // Build formatMetadata with choices for option text round-trip
          const formatMetadata: Record<string, unknown> = {
            choices: q.options.map((o: AnswerOptionItem) => ({
              content: o.text,
              isCorrect: o.isCorrect,
            })),
          };

          return {
            id: q.id,  // Send temp ID so backend can handle it
            questionType: q.questionType,
            questionText: q.questionText,
            difficulty: q.difficulty,
            options: q.options.map((o: AnswerOptionItem) => ({
              id: o.id,  // Send temp ID so backend can handle it
              label: o.label,
              text: o.text,
              isCorrect: o.isCorrect,
            })),
            modelAnswer: q.modelAnswer ?? undefined,
            rubric: q.rubric ?? undefined,
            explanation: (q.detailedExplanation || q.explanation) ?? undefined,
            points: q.points,
            estimatedTime: q.estimatedTime ?? undefined,
            audioMediaId: q.audioMediaId ?? undefined,
            imageMediaId: q.imageMediaId ?? undefined,
            passageGroupId: q.passageGroupId ?? undefined,
            passageText: q.passageText ?? undefined,
            passageType: q.passageType ?? undefined,
            passageTitle: q.passageTitle ?? undefined,
            blankNumber: q.blankIndex ?? undefined,
            subQuestionNumber: q.subQuestionNumber ?? undefined,
            formatMetadata,
          };
        }),
      };
    }),
    removedQuestionIds: [],
  };
}

/** Build granular PATCH payload: only dirty questions grouped by section.
 *  @param snapshot - Map of questionId → hash of last-saved state. If provided, questions with matching hash are skipped.
 *  @param sectionSnapshot - Map of sectionId → hash of last-saved section metadata. If provided, sections with matching hash are skipped. */
export function mapDirtyQuestionsToPayload(
  state: ExamContentState,
  snapshot?: Map<string, string>,
  sectionSnapshot?: Map<string, string>
): {
  examSettings?: {
    title: string;
    description: string;
    level: string;
    duration: number;
    passScore: number;
    maxScore: number;
    examType: string;
    certificationType: string;
  };
  sections: Array<{
    id: string;
    questions: Array<{
      id?: string;
      questionType: string;
      questionText: string;
      difficulty: string;
      options: Array<{ id?: string; label: string; text: string; isCorrect: boolean }>;
      modelAnswer?: string;
      rubric?: unknown;
      explanation?: string;
      points: number;
      estimatedTime?: number;
      audioMediaId?: string;
      imageMediaId?: string;
      passageGroupId?: string;
      passageText?: string;
      passageType?: string;
      passageTitle?: string;
      blankNumber?: number;
      subQuestionNumber?: number;
      formatMetadata?: Record<string, unknown>;
    }>;
  }>;
  sectionMetadata?: Array<{
    id: string;
    title?: string;
    subtitle?: string;
    instruction?: string;
    order?: number;
    durationMinutes?: number;
    audioMediaId?: string;
    scriptText?: string;
    passageText?: string;
    passageTitle?: string;
    passageType?: string;
  }>;
  removedQuestionIds: string[];
} {
  const dirtyQuestionIds = state.dirtyQuestionIds || new Set();
  const examSettings = state.dirtyExamSettings
    ? {
        title: state.exam.title,
        description: state.exam.description,
        level: state.exam.level,
        duration: state.exam.duration,
        passScore: state.exam.passingScore,
        maxScore: state.exam.maxScore,
        examType: state.exam.examType,
        certificationType: state.exam.certificationType,
      }
    : undefined;

  // Filter: only questions that are dirty AND actually changed (hash mismatch with snapshot)
  const actuallyChangedIds = new Set<string>();
  for (const qId of dirtyQuestionIds) {
    const section = state.sections.find((s) => s.questions.some((q) => q.id === qId));
    const question = section?.questions.find((q) => q.id === qId);
    if (!question) {
      console.warn(`[PATCH] Question ${qId} NOT found in any section - SKIPPED`);
      continue;
    }
    const currentHash = hashQuestion(question);
    const lastHash = snapshot?.get(qId);
    if (!lastHash || lastHash !== currentHash) {
      actuallyChangedIds.add(qId);
    } else {
      console.warn(`[PATCH] Question ${qId} hash MATCHES snapshot - excluded from payload`);
    }
  }
  console.log(`[PATCH] dirtyQuestionIds: ${dirtyQuestionIds.size}, actuallyChangedIds: ${actuallyChangedIds.size}, snapshot size: ${snapshot?.size ?? 0}`);

  const sections = state.sections
    .filter((s) => s.questions.some((q) => actuallyChangedIds.has(q.id)))
    .map((s) => ({
      id: s.id,
      questions: s.questions
        .filter((q) => actuallyChangedIds.has(q.id))
        .map((q) => ({
          id: q.id,  // Send temp ID so backend can map it back
          questionType: q.questionType,
          questionText: q.questionText,
          difficulty: q.difficulty,
          options: q.options.map((o: AnswerOptionItem) => ({
            id: o.id,  // Send temp ID so backend can handle it
            label: o.label,
            text: o.text,
            isCorrect: o.isCorrect,
          })),
          modelAnswer: q.modelAnswer ?? undefined,
          rubric: q.rubric ?? undefined,
          explanation: (q.detailedExplanation || q.explanation) ?? undefined,
          points: q.points,
          estimatedTime: q.estimatedTime ?? undefined,
          audioMediaId: q.audioMediaId ?? undefined,
          imageMediaId: q.imageMediaId ?? undefined,
          passageGroupId: q.passageGroupId ?? undefined,
          passageText: q.passageText ?? undefined,
          passageType: q.passageType ?? undefined,
          passageTitle: q.passageTitle ?? undefined,
          blankNumber: q.blankIndex ?? undefined,
          subQuestionNumber: q.subQuestionNumber ?? undefined,
          formatMetadata: {
            choices: q.options.map((o: AnswerOptionItem) => ({
              content: o.text,
              isCorrect: o.isCorrect,
            })),
          },
        })),
    }));

  // Build sectionMetadata for dirty sections — only if hash actually changed
  const dirtySectionIds = state.dirtySectionIds || new Set();
  const sectionMetadata: Array<{
    id: string;
    title?: string;
    subtitle?: string;
    instruction?: string;
    order?: number;
    durationMinutes?: number;
    audioMediaId?: string;
    scriptText?: string;
    passageText?: string;
    passageTitle?: string;
    passageType?: string;
  }> = [];
  for (const sectionId of dirtySectionIds) {
    const section = state.sections.find((s) => s.id === sectionId);
    if (!section || isTempId(section.id)) continue;
    const currentHash = hashSection(section);
    const lastHash = sectionSnapshot?.get(sectionId);
    if (!lastHash || lastHash !== currentHash) {
      sectionMetadata.push({
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        instruction: section.instruction,
        order: section.order,
        durationMinutes: section.durationMinutes,
        audioMediaId: section.audioMediaId ?? undefined,
        scriptText: section.scriptText ?? undefined,
        passageText: section.passageText ?? undefined,
        passageTitle: section.passageTitle ?? undefined,
        passageType: section.passageType ?? undefined,
      });
    }
  }

  return {
    examSettings,
    sections,
    sectionMetadata: sectionMetadata.length > 0 ? sectionMetadata : undefined,
    removedQuestionIds: Array.from(state.deletedQuestionIds || []),
  };
}

/** Build selective PATCH payload: only section metadata for dirty sections (no questions)
 *  @param sectionSnapshot - Map of sectionId → hash of last-saved section metadata */
export function mapDirtySectionsToPayload(
  state: ExamContentState,
  sectionSnapshot?: Map<string, string>
): {
  sectionMetadata?: Array<{
    id: string;
    title?: string;
    subtitle?: string;
    instruction?: string;
    order?: number;
    durationMinutes?: number;
    audioMediaId?: string;
    scriptText?: string;
    passageText?: string;
    passageTitle?: string;
    passageType?: string;
  }>;
} {
  const dirtySectionIds = state.dirtySectionIds || new Set();

  const sectionMetadata = state.sections
    .filter((s) => {
      if (!dirtySectionIds.has(s.id) || isTempId(s.id)) return false;
      const currentHash = hashSection(s);
      const lastHash = sectionSnapshot?.get(s.id);
      return !lastHash || lastHash !== currentHash;
    })
    .map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle ?? undefined,
      instruction: s.instruction ?? undefined,
      order: s.order,
      durationMinutes: s.durationMinutes,
      audioMediaId: s.audioMediaId ?? undefined,
      scriptText: s.scriptText ?? undefined,
      passageText: s.passageText ?? undefined,
      passageTitle: s.passageTitle ?? undefined,
      passageType: s.passageType ?? undefined,
    }));

  return { sectionMetadata: sectionMetadata.length > 0 ? sectionMetadata : undefined };
}
