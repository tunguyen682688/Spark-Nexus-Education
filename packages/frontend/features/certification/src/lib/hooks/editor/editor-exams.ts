/**
 * Exam handlers — add, remove, reorder exams within chapters.
 */
import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { withRetry } from './collection-editor.helpers';
import type { EditorChapter, AddExamConfig, SyncStatus } from './collection-editor.types';
import type { EditorMutations } from './editor-shared-types';

const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

interface ExamDeps {
  activeCollectionId: string | null;
  activeChapter: EditorChapter | undefined;
  chapters: EditorChapter[];
  mutations: Pick<EditorMutations, 'createExam' | 'deleteExam'>;
  setChapters: React.Dispatch<React.SetStateAction<EditorChapter[]>>;
  setSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
  setLastSavedAt: React.Dispatch<React.SetStateAction<Date | null>>;
  syncChaptersToServer: (collectionId: string, chapters: EditorChapter[]) => Promise<void>;
  refetchAndHydrate: () => Promise<void>;
  showToast: (msg: { title: string; description: string; variant: string }) => void;
}

export function useExamHandlers(deps: ExamDeps) {
  const { activeCollectionId, activeChapter, chapters, mutations, setChapters, setSyncStatus, setLastSavedAt, syncChaptersToServer, refetchAndHydrate, showToast } = deps;

  const handleAddExamConfirm = useCallback(
    async (config: AddExamConfig) => {
      if (!activeChapter || !activeCollectionId) {
        showToast({ title: 'Lỗi', description: 'Không tìm thấy bộ sưu tập.', variant: 'destructive' });
        return;
      }
      setSyncStatus('retrying');
      try {
        await syncChaptersToServer(activeCollectionId, chapters);
        await withRetry(
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
      } catch {
        setSyncStatus('error');
      }
    },
    [activeChapter, activeCollectionId, chapters, mutations, syncChaptersToServer, refetchAndHydrate, setSyncStatus, setLastSavedAt, showToast],
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
        prev.map((ch) => {
          if (ch.id !== activeChapter.id) return ch;
          const reordered = arrayMove(ch.exams, oldIndex, newIndex);
          return { ...ch, exams: reordered.map((ex, idx) => ({ ...ex, order: idx, number: idx + 1 })) };
        }),
      );
    },
    [activeChapter, setChapters],
  );

  return { handleAddExamConfirm, handleRemoveExamFromChapter, handleReorderExams };
}
