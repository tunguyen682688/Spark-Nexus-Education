/**
 * Chapter handlers — add, update, delete, reorder chapters.
 */
import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { EditorChapter, SyncStatus } from './collection-editor.types';
import { generateId } from './collection-editor.helpers';

interface ChapterDeps {
  activeCollectionId: string | null;
  activeChapterId: string;
  chapters: EditorChapter[];
  setChapters: React.Dispatch<React.SetStateAction<EditorChapter[]>>;
  setActiveChapterId: React.Dispatch<React.SetStateAction<string>>;
  setSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
  syncChaptersToServer: (collectionId: string, chapters: EditorChapter[]) => Promise<void>;
}

export function useChapterHandlers(deps: ChapterDeps) {
  const { activeCollectionId, activeChapterId, chapters, setChapters, setActiveChapterId, setSyncStatus, syncChaptersToServer } = deps;

  const handleAddChapter = useCallback(() => {
    if (!activeCollectionId) return;
    const nextNum = chapters.length + 1;
    const newChap: EditorChapter = {
      id: generateId(),
      number: nextNum,
      title: `Part ${nextNum}: New Chapter`,
      description: 'Add essential exams and topic guides for learners.',
      exams: [],
    };
    const updated = [...chapters, newChap];
    setChapters(updated);
    setActiveChapterId(newChap.id);
    syncChaptersToServer(activeCollectionId, updated).catch(() => setSyncStatus('error'));
  }, [activeCollectionId, chapters, setChapters, setActiveChapterId, setSyncStatus, syncChaptersToServer]);

  const handleUpdateActiveChapterTitle = useCallback(
    (newTitle: string) => setChapters((prev) => prev.map((ch) => (ch.id === activeChapterId ? { ...ch, title: newTitle } : ch))),
    [activeChapterId, setChapters],
  );

  const handleUpdateActiveChapterDescription = useCallback(
    (newDesc: string) => setChapters((prev) => prev.map((ch) => (ch.id === activeChapterId ? { ...ch, description: newDesc } : ch))),
    [activeChapterId, setChapters],
  );

  const handleDeleteChapter = useCallback((chapterId: string) => {
    if (!activeCollectionId) return;
    setChapters((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((ch) => ch.id !== chapterId).map((ch, idx) => ({ ...ch, number: idx + 1 }));
      syncChaptersToServer(activeCollectionId, updated).catch(() => setSyncStatus('error'));
      return updated;
    });
    setActiveChapterId((prev) => (prev === chapterId ? '' : prev));
  }, [activeCollectionId, setChapters, setActiveChapterId, setSyncStatus, syncChaptersToServer]);

  const handleReorderChapters = useCallback(
    (oldIndex: number, newIndex: number) => {
      setChapters((prev) => arrayMove(prev, oldIndex, newIndex).map((ch, idx) => ({ ...ch, number: idx + 1 })));
    },
    [setChapters],
  );

  return { handleAddChapter, handleUpdateActiveChapterTitle, handleUpdateActiveChapterDescription, handleDeleteChapter, handleReorderChapters };
}
