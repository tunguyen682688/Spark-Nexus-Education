import type {
  ExamContentState,
  ExamSectionContent,
  ExamSectionQuestion,
  SectionValidationIssue,
} from '../types/exam-content-editor.types';
import type { AnswerOptionItem } from '../types/question.types';

function isTempId(id: string): boolean {
  return id.startsWith('temp-') || id.startsWith('tmpl-');
}

const MC_TYPES = new Set(['mc', 'photograph_choice', 'question_response', 'conversation_mc', 'short_talk_mc', 'incomplete_sentence', 'text_completion', 'reading_comprehension_single', 'reading_comprehension_double', 'reading_comprehension_triple', 'short_conv_mc', 'long_conv_mc', 'factual_reading_mc', 'listening_mc', 'multiple_choice_cloze', 'multiple_choice_reading']);
const FIXED_ANSWER_TYPES = new Set(['true_false_not_given', 'yes_no_not_given', 'opinion_tfng']);

// Part-specific validation rules
const PART_REQUIRES_IMAGE = new Set([1]);        // Part 1: moi cau hoi can imageUrl
const PART_REQUIRES_AUDIO = new Set([2]);        // Part 2: moi cau hoi can audioUrl (独立音频)

export function validateSections(sections: ExamSectionContent[]): SectionValidationIssue[] {
  const issues: SectionValidationIssue[] = [];

  for (const section of sections) {
    if (section.isBreak) continue;

    // Section-level audio check (Parts 3, 4 share audio at section level)
    if (section.sectionType === 'listening' && !section.audioUrl) {
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
      if (PART_REQUIRES_IMAGE.has(section.order) && !question.imageUrl?.trim()) {
        issues.push({
          sectionId: section.id,
          sectionTitle: section.title,
          issueType: 'missing_content',
          message: `Câu ${question.order}: Chưa có hình ảnh`,
          questionId: question.id,
        });
      }

      // Part 2: audio required per question (each question has independent audio)
      if (PART_REQUIRES_AUDIO.has(section.order) && !question.audioUrl?.trim()) {
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
  sections: Array<{
    id?: string;
    title: string;
    subtitle?: string;
    sectionType: string;
    instruction?: string;
    order: number;
    durationMinutes: number;
    isBreak: boolean;
    audioUrl?: string;
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
      audioUrl?: string;
      imageUrl?: string;
      passageGroupId?: string;
      passageText?: string;
      passageType?: string;
      passageTitle?: string;
      blankNumber?: number;
      subQuestionNumber?: number;
    }>;
  }>;
} {
  return {
    title: state.exam.title,
    description: state.exam.description,
    level: state.exam.level,
    duration: state.exam.duration,
    sections: state.sections.map((s: ExamSectionContent) => ({
      id: isTempId(s.id) ? undefined : s.id,
      title: s.title,
      subtitle: s.subtitle,
      sectionType: s.sectionType,
      instruction: s.instruction,
      order: s.order,
      durationMinutes: s.durationMinutes,
      isBreak: s.isBreak,
      audioUrl: s.audioUrl,
      scriptText: s.scriptText,
      passageText: s.passageText,
      passageTitle: s.passageTitle,
      passageType: s.passageType,
      questions: s.questions.map((q: ExamSectionQuestion) => ({
        id: isTempId(q.id) ? undefined : q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        difficulty: q.difficulty,
        options: q.options.map((o: AnswerOptionItem) => ({
          id: isTempId(o.id) ? undefined : o.id,
          label: o.label,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
        modelAnswer: q.modelAnswer,
        rubric: q.rubric,
        explanation: q.detailedExplanation || q.explanation,
        points: q.points,
        estimatedTime: q.estimatedTime,
        audioUrl: q.audioUrl,
        imageUrl: q.imageUrl,
        passageGroupId: q.passageGroupId,
        passageText: q.passageText,
        passageType: q.passageType,
        passageTitle: q.passageTitle,
        blankNumber: q.blankIndex,
        subQuestionNumber: q.subQuestionNumber,
      })),
    })),
  };
}
