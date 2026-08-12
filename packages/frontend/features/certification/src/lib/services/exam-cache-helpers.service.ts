import { useQueryClient } from '@tanstack/react-query';
import type { CollectionEditorResponse, ExamBuilderResponse } from '../types';

// ─── Shared cache helpers ────────────────────────────────────────────────────

export type EditorExam = CollectionEditorResponse['chapters'][number]['exams'][number];
export type EditorChapter = CollectionEditorResponse['chapters'][number];

export function updateEditorCache(
  queryClient: ReturnType<typeof useQueryClient>,
  collectionId: string,
  updater: (data: CollectionEditorResponse) => CollectionEditorResponse,
) {
  queryClient.setQueryData<CollectionEditorResponse>(
    ['certification', 'collection-editor', collectionId],
    (old) => (old ? updater(old) : old),
  );
}

export function updateExamBuilderCache(
  queryClient: ReturnType<typeof useQueryClient>,
  examId: string,
  updater: (data: ExamBuilderResponse) => ExamBuilderResponse,
) {
  queryClient.setQueryData<ExamBuilderResponse>(
    ['certification', 'exam-builder', examId],
    (old) => (old ? updater(old) : old),
  );
}
