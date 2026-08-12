import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useArticle } from './use-reading';
import { extractTextFromBlocks, parseReaderContent } from '../utils/reader-parser';
import {
  readReaderSettings,
  writeReaderSettings,
} from './reader-helpers';
import { useReaderTts } from './use-reader-tts';
import { useReaderVocab } from './use-reader-vocab';
import { useReaderProgress } from './use-reader-progress';

export function useAdvancedReader(articleId: string) {
  const initialSettings = useMemo(readReaderSettings, []);
  const { data: article, isLoading, isError } = useArticle(articleId);

  const [isBionicMode, setIsBionicMode] = useState(
    initialSettings.isBionicMode ?? false
  );
  const [isFocusMode, setIsFocusMode] = useState(
    initialSettings.isFocusMode ?? false
  );
  const [focusHeightLines, setFocusHeightLines] = useState<1 | 3>(
    initialSettings.focusHeightLines ?? 3
  );
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(
    initialSettings.fontSize ?? 'md'
  );
  const [fixation, setFixation] = useState(initialSettings.fixation ?? 0.4);
  const [saccade, setSaccade] = useState(initialSettings.saccade ?? 1.0);
  const [isQuickSaveEnabled, setIsQuickSaveEnabled] = useState(
    initialSettings.isQuickSaveEnabled ?? true
  );
  const [isBilingualView, setIsBilingualView] = useState(
    initialSettings.isBilingualView ?? false
  );
  const [mouseY, setMouseY] = useState(300);

  const parsed = useMemo(() => {
    return parseReaderContent(article?.content || '', article?.category);
  }, [article?.content, article?.category]);

  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [hasInitializedChapter, setHasInitializedChapter] = useState(false);

  useEffect(() => {
    if (article && parsed.isBook && parsed.chapters && parsed.chapters.length > 0 && !hasInitializedChapter) {
      const savedIndex = article.lastPosition ?? 0;
      if (savedIndex >= 0 && savedIndex < parsed.chapters.length) {
        setSelectedChapterIndex(savedIndex);
      }
      setHasInitializedChapter(true);
    }
  }, [article, parsed, hasInitializedChapter]);

  const activeText = useMemo(() => {
    if (parsed.isBook) {
      if (parsed.chapters && parsed.chapters.length > 0) {
        const activeChapter = parsed.chapters[selectedChapterIndex];
        return extractTextFromBlocks(activeChapter?.content);
      }
      return '';
    } else {
      return parsed.plainText;
    }
  }, [parsed, selectedChapterIndex]);

  const calculatedWordCount = useMemo(() => {
    if (!activeText) return 0;
    return activeText.trim().split(/\s+/).length;
  }, [activeText]);

  const finalWordCount = calculatedWordCount || (article?.wordCount) || 1;
  const activeReadingMinutes = Math.max(1, Math.ceil(finalWordCount / 200));

  const containerRef = useRef<HTMLDivElement>(null);

  const tts = useReaderTts({ activeText, article });

  useEffect(() => {
    writeReaderSettings({
      isBionicMode,
      isFocusMode,
      focusHeightLines,
      fontSize,
      fixation,
      saccade,
      ttsRate: tts.ttsRate,
      isQuickSaveEnabled,
      isBilingualView,
    });
  }, [
    isBionicMode,
    isFocusMode,
    focusHeightLines,
    fontSize,
    fixation,
    saccade,
    tts.ttsRate,
    isQuickSaveEnabled,
    isBilingualView,
  ]);

  const progress = useReaderProgress({
    articleId,
    article,
    parsed,
    selectedChapterIndex,
    hasInitializedChapter,
    activeWordCount: finalWordCount,
  });

  const vocab = useReaderVocab({
    containerRef,
    isQuickSaveEnabled,
    activeText,
    selectedChapterIndex,
  });

  const handleSelectChapter = useCallback((index: number) => {
    if (!parsed.chapters || index < 0 || index >= parsed.chapters.length) return;
    setSelectedChapterIndex(index);
    progress.handleSelectChapter(index);
  }, [parsed.chapters, progress]);

  const handleStartReading = useCallback((index = 0) => {
    if (parsed.isBook) {
      handleSelectChapter(index);
      return;
    }
    setSelectedChapterIndex(index);
    progress.handleStartReading(index);
  }, [parsed.isBook, handleSelectChapter, progress]);

  const handleResumeReading = useCallback((index = 0) => {
    if (parsed.isBook && parsed.chapters && parsed.chapters.length > 0) {
      const safeIndex =
        index >= 0 && index < parsed.chapters.length
          ? index
          : article?.lastPosition ?? 0;
      setSelectedChapterIndex(safeIndex);
    }

    progress.handleResumeReading(index);
  }, [
    article?.lastPosition,
    article?.progress,
    parsed.chapters,
    parsed.isBook,
    progress,
  ]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseY(e.clientY);
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === 'Escape') {
        vocab.setHighlightedWord('');
        setIsFocusMode(false);
        if (tts.isPlayingTts) {
          tts.handleStopTts();
        }
        return;
      }

      if (event.key === 'ArrowLeft' && parsed.isBook) {
        event.preventDefault();
        handleStartReading(selectedChapterIndex - 1);
        return;
      }

      if (event.key === 'ArrowRight' && parsed.isBook) {
        event.preventDefault();
        handleStartReading(selectedChapterIndex + 1);
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'b') {
        setIsBionicMode((value) => !value);
      }

      if (key === 'f') {
        setIsFocusMode((value) => !value);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleStartReading,
    tts.handleStopTts,
    tts.isPlayingTts,
    parsed.isBook,
    selectedChapterIndex,
    vocab,
  ]);

  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-sm leading-relaxed'
      : fontSize === 'lg'
      ? 'text-lg md:text-xl leading-relaxed'
      : 'text-base md:text-lg leading-relaxed';

  return {
    article,
    isLoading,
    isError,
    isBionicMode,
    setIsBionicMode,
    isFocusMode,
    setIsFocusMode,
    focusHeightLines,
    setFocusHeightLines,
    fontSize,
    setFontSize,
    scrollProgress: progress.scrollProgress,
    fixation,
    setFixation,
    saccade,
    setSaccade,
    isPlayingTts: tts.isPlayingTts,
    ttsRate: tts.ttsRate,
    spokenWord: tts.spokenWord,
    mouseY,
    highlightedWord: vocab.highlightedWord,
    setHighlightedWord: vocab.setHighlightedWord,
    sentenceContext: vocab.sentenceContext,
    popoverCoords: vocab.popoverCoords,
    selectedChapterIndex,
    parsed,
    activeText,
    activeWordCount: finalWordCount,
    activeReadingMinutes,
    activeWpm: progress.activeWpm,
    fontSizeClass,
    containerRef,
    handleSelectChapter,
    handleStartReading,
    handleResumeReading,
    handleMarkComplete: progress.handleMarkComplete,
    handleTextSelection: vocab.handleTextSelection,
    handleMouseMove,
    handleTogglePlayTts: tts.handleTogglePlayTts,
    handleStopTts: tts.handleStopTts,
    handleChangeTtsRate: tts.handleChangeTtsRate,
    initialDefinition: vocab.initialDefinition,
    initialPronunciation: vocab.initialPronunciation,
    initialPartOfSpeech: vocab.initialPartOfSpeech,
    initialExample: vocab.initialExample,
    initialExampleTrans: vocab.initialExampleTrans,
    isQuickSaveEnabled,
    setIsQuickSaveEnabled,
    isBilingualView,
    setIsBilingualView,
  };
}
