/**
 * Chapter handlers — add, update, delete, reorder chapters.
 */
import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { EditorChapter } from '../../types/collection-editor.types';
import type { ChapterDeps } from '../../types/editor-hook.types';
import { generateId } from '../../services/collection-editor-helpers.service';

export type { ChapterDeps } from '../../types/editor-hook.types';

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
    (newTitle: string) => setChapters((prev) => prev.map((chapter) => (chapter.id === activeChapterId ? { ...chapter, title: newTitle } : chapter))),
    [activeChapterId, setChapters],
  );

  const handleUpdateActiveChapterDescription = useCallback(
    (newDesc: string) => setChapters((prev) => prev.map((chapter) => (chapter.id === activeChapterId ? { ...chapter, description: newDesc } : chapter))),
    [activeChapterId, setChapters],
  );

  const handleDeleteChapter = useCallback((chapterId: string) => {
    if (!activeCollectionId) return;
    setChapters((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((chapter) => chapter.id !== chapterId).map((chapter, idx) => ({ ...chapter, number: idx + 1 }));
      syncChaptersToServer(activeCollectionId, updated).catch(() => setSyncStatus('error'));
      return updated;
    });
    setActiveChapterId((prev) => (prev === chapterId ? '' : prev));
  }, [activeCollectionId, setChapters, setActiveChapterId, setSyncStatus, syncChaptersToServer]);

  const handleReorderChapters = useCallback(
    (oldIndex: number, newIndex: number) => {
      setChapters((prev) => arrayMove(prev, oldIndex, newIndex).map((chapter, idx) => ({ ...chapter, number: idx + 1 })));
    },
    [setChapters],
  );

  return { handleAddChapter, handleUpdateActiveChapterTitle, handleUpdateActiveChapterDescription, handleDeleteChapter, handleReorderChapters };
}
