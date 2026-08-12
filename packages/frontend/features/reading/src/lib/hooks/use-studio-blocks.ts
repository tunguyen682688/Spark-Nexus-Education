import { useState, useEffect, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { StudioFormValues } from '../types';
import { STUDIO_UI_TEXT } from '../constants/studio-ui-text';

export function useStudioBlocks(form: UseFormReturn<StudioFormValues>) {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isOverviewActive, setIsOverviewActive] = useState(true);

  const chapters = form.watch('chapters') || [];
  const watchedChapterTitle = form.watch('chapterTitle');
  const watchedChapterContent = form.watch('chapterContent');

  useEffect(() => {
    if (activeChapterId && !isOverviewActive) {
      const currentChapters = form.getValues('chapters') || [];
      const updated = currentChapters.map((ch) =>
        ch.id === activeChapterId
          ? {
              ...ch,
              title:
                watchedChapterTitle || STUDIO_UI_TEXT.DEFAULT_CHAPTER_TITLE,
              content: watchedChapterContent ?? null,
            }
          : ch
      );
      form.setValue('chapters', updated, { shouldDirty: true });
    }
  }, [
    watchedChapterTitle,
    watchedChapterContent,
    activeChapterId,
    isOverviewActive,
    form,
  ]);

  const handleAddChapter = useCallback(() => {
    const newId = Date.now().toString();
    const currentChapters = form.getValues('chapters') || [];

    const newChapter = {
      id: newId,
      title: STUDIO_UI_TEXT.DEFAULT_CHAPTER_TITLE,
      content: null,
      isDraft: true,
    };
    const updated = [...currentChapters, newChapter];

    form.setValue('chapters', updated, { shouldDirty: true });
    setActiveChapterId(newId);
    setIsOverviewActive(false);

    form.setValue('chapterTitle', STUDIO_UI_TEXT.DEFAULT_CHAPTER_TITLE, {
      shouldDirty: true,
    });
    form.setValue('chapterContent', null, { shouldDirty: true });
  }, [form]);

  const handleSelectChapter = useCallback(
    (id: string) => {
      const currentChapters = form.getValues('chapters') || [];
      const target = currentChapters.find((c) => c.id === id);
      if (target) {
        setActiveChapterId(id);
        setIsOverviewActive(false);

        form.setValue('chapterTitle', target.title || '', {
          shouldDirty: true,
        });
        form.setValue('chapterContent', target.content || null, {
          shouldDirty: true,
        });
      }
    },
    [form]
  );

  const handleSelectOverview = useCallback(() => {
    setIsOverviewActive(true);
    setActiveChapterId(null);
  }, []);

  return {
    activeChapterId,
    isOverviewActive,
    chapters,
    handleAddChapter,
    handleSelectChapter,
    handleSelectOverview,
  };
}
