import { useCallback, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { withRetry } from '../../services/collection-editor-helpers.service';
import type { AddExamConfig } from '../../types/collection-editor.types';
import type { ExamDeps } from '../../types/editor-hook.types';
import { RETRY_COUNT, RETRY_DELAY_MS } from '../../constants/editor.constants';

export type { ExamDeps } from '../../types/editor-hook.types';
export { RETRY_COUNT, RETRY_DELAY_MS } from '../../constants/editor.constants';

export function useExamHandlers(deps: ExamDeps) {
  const { activeCollectionId, activeChapter, chapters, mutations, setChapters, setSyncStatus, setLastSavedAt, syncChaptersToServer, refetchAndHydrate, showToast, navigate } = deps;
  const isAddingExamRef = useRef(false);

  const handleAddExamConfirm = useCallback(
    async (config: AddExamConfig) => {
      if (!activeChapter || !activeCollectionId) {
        showToast({ title: 'Error', description: 'Collection not found.', variant: 'destructive' });
        return;
      }
      if (isAddingExamRef.current) return;
      isAddingExamRef.current = true;

      setSyncStatus('retrying');
      try {
        await syncChaptersToServer(activeCollectionId, chapters);
        const result = await withRetry(
          () => mutations.createExam.mutateAsync({
            collectionId: activeCollectionId, title: config.title, duration: config.duration,
            totalQuestions: config.totalQuestions, maxScore: config.maxScore, passScore: config.passScore,
            examType: config.examType, certificationType: config.certificationType,
            chapterId: activeChapter.id, sections: config.sections,
          }),
          RETRY_COUNT, RETRY_DELAY_MS,
        );
        await refetchAndHydrate();
        setLastSavedAt(new Date());
        if (result?.id) {
          navigate(`/certification/exam-content-editor/${result.id}`);
        }
      } catch {
        setSyncStatus('error');
      } finally {
        isAddingExamRef.current = false;
      }
    },
    [activeChapter, activeCollectionId, chapters, mutations, syncChaptersToServer, refetchAndHydrate, setSyncStatus, setLastSavedAt, showToast, navigate],
  );

  const handleRemoveExamFromChapter = useCallback(
    async (examId: string) => {
      if (!activeCollectionId || !activeChapter) return;
      try {
        await mutations.deleteExam.mutateAsync({ examId, collectionId: activeCollectionId });
        await refetchAndHydrate();
      } catch {
        setSyncStatus('error');
      }
    },
    [activeCollectionId, activeChapter, mutations, refetchAndHydrate, setSyncStatus],
  );

  const handleReorderExams = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!activeChapter) return;
      setChapters((prev) =>
        prev.map((chapter) => {
          if (chapter.id !== activeChapter.id) return chapter;
          const reordered = arrayMove(chapter.exams, oldIndex, newIndex);
          return { ...chapter, exams: reordered.map((exam, idx) => ({ ...exam, order: idx, number: idx + 1 })) };
        }),
      );
    },
    [activeChapter, setChapters],
  );

  return { handleAddExamConfirm, handleRemoveExamFromChapter, handleReorderExams };
}
