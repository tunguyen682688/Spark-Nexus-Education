import { useState, useCallback, useEffect, useRef } from 'react';
import { useUpdateReadingProgress } from './use-reading';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import type { ParsedContent } from '../utils/reader-parser';

interface UseReaderProgressOptions {
  articleId: string;
  article: {
    progress?: number;
    lastPosition?: number;
    wordCount?: number;
  } | undefined;
  parsed: ParsedContent;
  selectedChapterIndex: number;
  hasInitializedChapter: boolean;
  activeWordCount: number;
}

export function useReaderProgress({
  articleId,
  article,
  parsed,
  selectedChapterIndex,
  hasInitializedChapter,
  activeWordCount,
}: UseReaderProgressOptions) {
  const { mutate: updateProgress } = useUpdateReadingProgress();
  const { toast } = useToast();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const timeSpentRef = useRef(0);
  const lastSavedProgressRef = useRef(0);

  const scrollToProgress = useCallback((progress: number) => {
    window.setTimeout(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      window.scrollTo({
        top: (Math.min(100, Math.max(0, progress)) / 100) * docHeight,
        behavior: 'smooth',
      });
    }, 150);
  }, []);

  const handleSelectChapter = useCallback((index: number) => {
    if (!parsed.chapters || index < 0 || index >= parsed.chapters.length) return;
    setScrollProgress(0);
    lastSavedProgressRef.current = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateProgress({
      id: articleId,
      progress: 0,
      lastPosition: index,
      timeSpent: timeSpentRef.current,
    });
  }, [parsed.chapters, articleId, updateProgress]);

  const handleStartReading = useCallback((index = 0) => {
    if (parsed.isBook) {
      handleSelectChapter(index);
      return;
    }

    setScrollProgress(0);
    lastSavedProgressRef.current = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateProgress({
      id: articleId,
      progress: 0,
      lastPosition: 1,
      timeSpent: timeSpentRef.current,
    });
  }, [articleId, handleSelectChapter, parsed.isBook, updateProgress]);

  const handleResumeReading = useCallback((index = 0) => {
    const savedProgress = Math.min(100, Math.max(0, article?.progress ?? 0));

    setScrollProgress(savedProgress);
    lastSavedProgressRef.current = savedProgress;
    scrollToProgress(savedProgress);
  }, [
    article?.progress,
    scrollToProgress,
  ]);

  const handleMarkComplete = useCallback(() => {
    lastSavedProgressRef.current = 100;
    setScrollProgress(100);

    updateProgress({
      id: articleId,
      progress: 100,
      lastPosition: parsed.isBook ? selectedChapterIndex : 1,
      timeSpent: timeSpentRef.current,
    });

    toast({
      title: 'Reading completed',
      description: 'Progress has been saved at 100%.',
    });
  }, [
    articleId,
    parsed.isBook,
    selectedChapterIndex,
    toast,
    updateProgress,
  ]);

  // Time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      timeSpentRef.current += 1;
      setTimeSpent(timeSpentRef.current);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (article && scrollProgress > lastSavedProgressRef.current) {
        updateProgress({
          id: articleId,
          progress: Math.round(scrollProgress),
          lastPosition: parsed.isBook ? selectedChapterIndex : 1,
          timeSpent: timeSpentRef.current,
        });
      }
    };
  }, [article, scrollProgress, articleId, updateProgress, parsed.isBook, selectedChapterIndex]);

  // Periodic progress saving
  useEffect(() => {
    if (!article) return;

    const currentRounded = Math.round(scrollProgress);
    const hasProgressIncreased = currentRounded > lastSavedProgressRef.current;

    if (hasProgressIncreased && (currentRounded - lastSavedProgressRef.current >= 5 || currentRounded === 100)) {
      lastSavedProgressRef.current = currentRounded;
      updateProgress({
        id: articleId,
        progress: currentRounded,
        lastPosition: parsed.isBook ? selectedChapterIndex : 1,
        timeSpent: timeSpentRef.current,
      });
    }
  }, [scrollProgress, article, articleId, updateProgress, parsed.isBook, selectedChapterIndex]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = (scrollTop / docHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, pct)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set initial scroll progress from DB
  useEffect(() => {
        if (article && article.progress && lastSavedProgressRef.current === 0 && (!parsed.isBook || hasInitializedChapter)) {
      lastSavedProgressRef.current = article.progress;
      setTimeout(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          scrollToProgress(article.progress!);
        }
      }, 500);
    }
  }, [article, parsed.isBook, hasInitializedChapter, scrollToProgress]);

  const rawWpm = Math.round((activeWordCount / (timeSpent || 1)) * 60);
  const activeWpm = rawWpm > 1000 ? 0 : rawWpm;

  return {
    scrollProgress,
    timeSpent,
    activeWpm,
    timeSpentRef,
    handleSelectChapter,
    handleStartReading,
    handleResumeReading,
    handleMarkComplete,
  };
}
