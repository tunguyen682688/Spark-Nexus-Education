import { useQueryClient } from '@tanstack/react-query';
import { certificationKeys } from '../constants/query-key-factory';
import type { ExamContentState } from '../types/exam-content-editor.types';

// ─── Exam Content Cache Helpers ─────────────────────────────────────────────
// Wrappers around queryClient.setQueryData for type-safe optimistic updates.

type ExamBuilderData = {
  title: string;
  description: string;
  settings?: Record<string, unknown>;
  durationMinutes: number;
  totalQuestions: number;
  certificationType?: string;
  sections?: Array<{
    id: string;
    title: string;
    description?: string;
    instructions?: string;
    sectionType: string;
    orderIndex: number;
    durationMinutes?: number;
    questionCount?: number;
    isBreak?: boolean;
    questions?: Array<Record<string, unknown>>;
  }>;
};

/** Read current cached exam builder data */
export function getExamBuilderCache(
  queryClient: ReturnType<typeof useQueryClient>,
  examId: string,
): ExamBuilderData | undefined {
  return queryClient.getQueryData<ExamBuilderData>(
    certificationKeys.examContent.builder(examId),
  );
}

/** Optimistically update exam builder cache */
export function updateExamBuilderCache(
  queryClient: ReturnType<typeof useQueryClient>,
  examId: string,
  updater: (old: ExamBuilderData) => ExamBuilderData,
) {
  queryClient.setQueryData<ExamBuilderData>(
    certificationKeys.examContent.builder(examId),
    (old) => (old ? updater(old) : old),
  );
}

/** Optimistically set section question count after template creation */
export function setSectionQuestionsInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  examId: string,
  sections: ExamContentState['sections'],
) {
  updateExamBuilderCache(queryClient, examId, (old) => ({
    ...old,
    totalQuestions: sections.reduce((sum, s) => sum + s.questions.length, 0),
    sections: sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.subtitle,
      sectionType: s.sectionType,
      orderIndex: s.order,
      durationMinutes: s.durationMinutes,
      questionCount: s.questions.length,
      isBreak: s.isBreak,
      questions: s.questions.map((q) => ({
        id: q.id,
        title: q.questionText,
        questionText: q.questionText,
        type: q.questionType,
        questionType: q.questionType,
        difficulty: q.difficulty,
        points: q.points,
        audioMediaId: q.audioMediaId,
        imageMediaId: q.imageMediaId,
        passageGroupId: q.passageGroupId,
        passageText: q.passageText,
        options: q.options,
      })),
    })),
  }));
}

/** Invalidate exam builder cache to refetch from API */
export function invalidateExamBuilderCache(
  queryClient: ReturnType<typeof useQueryClient>,
  examId: string,
) {
  queryClient.invalidateQueries({
    queryKey: certificationKeys.examContent.builder(examId),
  });
  // Also invalidate all section question caches for this exam
  queryClient.invalidateQueries({
    queryKey: certificationKeys.exams.sectionQuestions(examId, ''),
    exact: false,
  });
}

/** Invalidate collection editor cache (when exam structure changes) */
export function invalidateCollectionEditorCache(
  queryClient: ReturnType<typeof useQueryClient>,
  collectionId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: certificationKeys.collections.editor(collectionId),
  });
}
