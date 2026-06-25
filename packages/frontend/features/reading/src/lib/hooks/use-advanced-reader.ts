import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useArticle, useUpdateReadingProgress, useUserVocabularyPackages, useAddWordToPackage } from './use-reading';
import { TextToSpeechPlayer } from '../services/reading.service';
import { extractTextFromBlocks, parseReaderContent } from '../utils/reader-parser';
import { useToast } from '@spark-nest-ed/frontend-shared-components';

type ReaderSettings = {
  isBionicMode: boolean;
  isFocusMode: boolean;
  focusHeightLines: 1 | 3;
  fontSize: 'sm' | 'md' | 'lg';
  fixation: number;
  saccade: number;
  ttsRate: number;
  isQuickSaveEnabled: boolean;
  isBilingualView: boolean;
};

const READER_SETTINGS_STORAGE_KEY = 'spark-nexus-reader-settings-v1';

const readReaderSettings = (): Partial<ReaderSettings> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(READER_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeReaderSettings = (settings: ReaderSettings) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      READER_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Preference persistence should never block reading.
  }
};

const getCharOffsetOfNode = (ancestor: Node, targetNode: Node): number => {
  let offset = 0;
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const showTextFilter = window.NodeFilter?.SHOW_TEXT ?? 4;
  const walk = document.createTreeWalker(ancestor, showTextFilter);
  while (walk.nextNode()) {
    const currentNode = walk.currentNode;
    if (targetNode.contains(currentNode)) {
      break;
    }
    offset += currentNode.textContent?.length || 0;
  }
  return offset;
};

export function useAdvancedReader(articleId: string) {
  const initialSettings = useMemo(readReaderSettings, []);
  const { data: article, isLoading, isError } = useArticle(articleId);
  const { mutate: updateProgress } = useUpdateReadingProgress();
  const { data: packagesData } = useUserVocabularyPackages();
  const addWordMutation = useAddWordToPackage();
  const { toast } = useToast();

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
  const [scrollProgress, setScrollProgress] = useState(0);

  // Bionic Reading Weights
  const [fixation, setFixation] = useState(initialSettings.fixation ?? 0.4);
  const [saccade, setSaccade] = useState(initialSettings.saccade ?? 1.0);

  // Text To Speech
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsRate, setTtsRate] = useState(initialSettings.ttsRate ?? 1.0);
  const [spokenWord, setSpokenWord] = useState('');

  // Quick Save configuration
  const [isQuickSaveEnabled, setIsQuickSaveEnabled] = useState(
    initialSettings.isQuickSaveEnabled ?? true
  );

  // Bilingual Mode configuration
  const [isBilingualView, setIsBilingualView] = useState(
    initialSettings.isBilingualView ?? false
  );

  // Live WPM tracking
  const [timeSpent, setTimeSpent] = useState(0);

  // Focus Mode overlay position
  const [mouseY, setMouseY] = useState(300);

  // Word selection state
  const [highlightedWord, setHighlightedWord] = useState('');
  const [sentenceContext, setSentenceContext] = useState('');
  const [popoverCoords, setPopoverCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialDefinition, setInitialDefinition] = useState('');
  const [initialPronunciation, setInitialPronunciation] = useState('');
  const [initialPartOfSpeech, setInitialPartOfSpeech] = useState('');
  const [initialExample, setInitialExample] = useState('');
  const [initialExampleTrans, setInitialExampleTrans] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const timeSpentRef = useRef(0);
  const lastSavedProgressRef = useRef(0);

  useEffect(() => {
    writeReaderSettings({
      isBionicMode,
      isFocusMode,
      focusHeightLines,
      fontSize,
      fixation,
      saccade,
      ttsRate,
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
    ttsRate,
    isQuickSaveEnabled,
    isBilingualView,
  ]);

  // Parse Wrapped & Book Content Structure
  const parsed = useMemo(() => {
    return parseReaderContent(article?.content || '', article?.category);
  }, [article?.content, article?.category]);

  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [hasInitializedChapter, setHasInitializedChapter] = useState(false);

  // Initialize Chapter Index from article lastPosition
  useEffect(() => {
    if (article && parsed.isBook && parsed.chapters && parsed.chapters.length > 0 && !hasInitializedChapter) {
      const savedIndex = article.lastPosition ?? 0;
      if (savedIndex >= 0 && savedIndex < parsed.chapters.length) {
        setSelectedChapterIndex(savedIndex);
      }
      setHasInitializedChapter(true);
    }
  }, [article, parsed, hasInitializedChapter]);

  // Extract active plain text for TTS, word counter & estimations
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

  // Calculate dynamic word count for active content
  const calculatedWordCount = useMemo(() => {
    if (!activeText) return 0;
    return activeText.trim().split(/\s+/).length;
  }, [activeText]);

  const finalWordCount = calculatedWordCount || (article?.wordCount) || 1;
  const activeReadingMinutes = Math.max(1, Math.ceil(finalWordCount / 200));

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

  // Chapter selection handler
  const handleSelectChapter = useCallback((index: number) => {
    if (!parsed.chapters || index < 0 || index >= parsed.chapters.length) return;
    setSelectedChapterIndex(index);
    setScrollProgress(0);
    lastSavedProgressRef.current = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save progress immediately for the new chapter
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

    if (parsed.isBook && parsed.chapters && parsed.chapters.length > 0) {
      const safeIndex =
        index >= 0 && index < parsed.chapters.length
          ? index
          : article?.lastPosition ?? 0;
      setSelectedChapterIndex(safeIndex);
    }

    setScrollProgress(savedProgress);
    lastSavedProgressRef.current = savedProgress;
    scrollToProgress(savedProgress);
  }, [
    article?.lastPosition,
    article?.progress,
    parsed.chapters,
    parsed.isBook,
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

  // 1. Time tracking & Periodic Progress Sync
  useEffect(() => {
    const interval = setInterval(() => {
      timeSpentRef.current += 1;
      setTimeSpent(timeSpentRef.current);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Auto save on unmount if progress has changed
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

  // 2. Scroll event listener to calculate scroll progress
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

  // Set initial scroll progress from DB progress if available on load
  useEffect(() => {
    if (article && article.progress && lastSavedProgressRef.current === 0 && (!parsed.isBook || hasInitializedChapter)) {
      lastSavedProgressRef.current = article.progress;
      setTimeout(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          scrollToProgress(article.progress);
        }
      }, 500);
    }
  }, [article, parsed.isBook, hasInitializedChapter, scrollToProgress]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      TextToSpeechPlayer.stop();
    };
  }, []);

  const getWordAndSentenceAtEvent = useCallback((e: MouseEvent): { word: string; sentence: string } | null => {
    let range: Range | null = null;

    // Prefer the modern, non-deprecated CaretPosition API when available.
    const caretPosition = (Document.prototype as unknown as {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    }).caretPositionFromPoint;

    if (typeof caretPosition === 'function') {
      const position = caretPosition.call(document, e.clientX, e.clientY);
      if (position) {
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.setEnd(position.offsetNode, position.offset);
      }
    } else if (typeof (document as unknown as {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    }).caretRangeFromPoint === 'function') {
      // Fallback for older WebKit/Blink browsers where the modern API is missing.
      range = (document as unknown as {
        caretRangeFromPoint: (x: number, y: number) => Range | null;
      }).caretRangeFromPoint(e.clientX, e.clientY);
    }

    if (!range) return null;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent || '';
    const offset = range.startOffset;

    // Expand offset to find the word boundaries
    let start = offset;
    while (start > 0 && /\w/.test(text[start - 1])) {
      start--;
    }
    let end = offset;
    while (end < text.length && /\w/.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end).trim();
    if (!word || word.length <= 1 || !/^[a-zA-Z-]+$/.test(word)) return null;

    const sentence = getSurroundingSentence(text, offset);
    return { word, sentence };
  }, []);

  const handleQuickSave = useCallback(async (wordToSave: string, sentenceToSave: string) => {
    if (!packagesData?.data || packagesData.data.length === 0) {
      toast({
        title: 'Không thể lưu nhanh',
        description: 'Vui lòng tạo ít nhất một bộ từ vựng trước.',
        variant: 'destructive',
      });
      return;
    }

    const defaultPackage = packagesData.data[0];
    const defaultPackageId = defaultPackage.id;
    const defaultPackageTitle = defaultPackage.title;

    const payload = {
      word: {
        word: wordToSave.trim(),
        definition: `Lưu nhanh từ "${wordToSave}"`,
        example: sentenceToSave.trim() || null,
        partOfSpeech: 'noun',
        notes: 'Lưu nhanh 1-Click',
      },
    };

    try {
      await addWordMutation.mutateAsync({
        packageId: defaultPackageId,
        payload,
      });
      toast({
        title: 'Đã lưu từ vựng ⚡',
        description: `Đã thêm "${wordToSave}" vào bộ từ "${defaultPackageTitle}"`,
      });
    } catch (err) {
      console.error('Failed to quick save word', err);
      toast({
        title: 'Lỗi',
        description: 'Lưu từ vựng thất bại. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  }, [packagesData, addWordMutation, toast]);

  // Effect to handle click and double click events on .vocab-highlight elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      // 1-Click Save using Alt + Click
      if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        const result = getWordAndSentenceAtEvent(e);
        if (result) {
          handleQuickSave(result.word, result.sentence);
        }
        return;
      }

      const target = e.target as HTMLElement;
      const highlightEl = target.closest('.vocab-highlight') as HTMLElement | null;
      if (highlightEl) {
        e.preventDefault();
        e.stopPropagation();

        const word = highlightEl.textContent?.trim() || '';
        const definition = highlightEl.getAttribute('data-def') || '';
        const pronunciation = highlightEl.getAttribute('data-pron') || '';
        const level = highlightEl.getAttribute('data-level') || '';
        const ex = highlightEl.getAttribute('data-ex') || '';
        const exTrans = highlightEl.getAttribute('data-ex-trans') || '';

        // Get coordinates for popover relative to document
        const rect = highlightEl.getBoundingClientRect();
        
        const parentBlock = highlightEl.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div.flex-1');
        let sentence = '';
        if (parentBlock) {
          const blockText = parentBlock.textContent || '';
          const charOffset = getCharOffsetOfNode(parentBlock, highlightEl);
          sentence = getSurroundingSentence(blockText, charOffset);
        }

        setHighlightedWord(word);
        setInitialDefinition(definition);
        setInitialPronunciation(pronunciation);
        setInitialPartOfSpeech(level);
        setInitialExample(ex);
        setInitialExampleTrans(exTrans);
        setSentenceContext(sentence);
        setPopoverCoords({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY,
        });
      }
    };

    const handleContainerDblClick = (e: MouseEvent) => {
      // 1-Click Save using dblclick (double click)
      if (!isQuickSaveEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      const selection = window.getSelection();
      if (!selection) return;
      
      const text = selection.toString().trim();
      if (text && text.length > 1 && text.split(/\s+/).length === 1 && /^[a-zA-Z-]+$/.test(text)) {
        const range = selection.getRangeAt(0);
        const textContent = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const sentence = getSurroundingSentence(textContent, offset);
        
        handleQuickSave(text, sentence);
      }
    };

    container.addEventListener('click', handleContainerClick);
    container.addEventListener('dblclick', handleContainerDblClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
      container.removeEventListener('dblclick', handleContainerDblClick);
    };
  }, [activeText, selectedChapterIndex, getWordAndSentenceAtEvent, handleQuickSave, isQuickSaveEnabled]);

  // 3. Highlight Word Selector
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text && text.length > 1 && text.split(/\s+/).length === 1 && /^[a-zA-Z-]+$/.test(text)) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const textContent = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const sentence = getSurroundingSentence(textContent, offset);

        setHighlightedWord(text);
        setInitialDefinition('');
        setInitialPronunciation('');
        setInitialPartOfSpeech('');
        setInitialExample('');
        setInitialExampleTrans('');
        setSentenceContext(sentence);
        setPopoverCoords({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY,
        });
      } catch (err) {
        console.error('Error getting range rect', err);
      }
    }
  }, []);

  const getSurroundingSentence = (text: string, offset: number): string => {
    const sentenceEndings = /[.!?]/;
    let start = offset;
    let end = offset;

    while (start > 0 && !sentenceEndings.test(text[start - 1])) {
      start--;
    }

    while (end < text.length && !sentenceEndings.test(text[end])) {
      end++;
    }

    return text.substring(start, end + 1).trim();
  };

  // 4. Focus Mode mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseY(e.clientY);
  }, []);

  // 5. TTS controls
  const handleTogglePlayTts = useCallback(() => {
    if (!article || !activeText) return;

    if (isPlayingTts) {
      TextToSpeechPlayer.pause();
      setIsPlayingTts(false);
    } else {
      setIsPlayingTts(true);
      TextToSpeechPlayer.play(
        activeText,
        ttsRate,
        (charIndex, charLength) => {
          const activeWord = activeText.substring(charIndex, charIndex + charLength);
          setSpokenWord(activeWord);
        },
        () => {
          setIsPlayingTts(false);
          setSpokenWord('');
        }
      );
    }
  }, [article, activeText, isPlayingTts, ttsRate]);

  const handleStopTts = useCallback(() => {
    TextToSpeechPlayer.stop();
    setIsPlayingTts(false);
    setSpokenWord('');
  }, []);

  const handleChangeTtsRate = useCallback((rate: number) => {
    setTtsRate(rate);
    if (isPlayingTts && activeText) {
      TextToSpeechPlayer.play(
        activeText,
        rate,
        (charIndex, charLength) => {
          const activeWord = activeText.substring(charIndex, charIndex + charLength);
          setSpokenWord(activeWord);
        },
        () => {
          setIsPlayingTts(false);
          setSpokenWord('');
        }
      );
    }
  }, [isPlayingTts, activeText]);

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
        setHighlightedWord('');
        setIsFocusMode(false);
        if (isPlayingTts) {
          handleStopTts();
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
    handleStopTts,
    isPlayingTts,
    parsed.isBook,
    selectedChapterIndex,
  ]);

  // Calculate live WPM
  const rawWpm = Math.round((finalWordCount / (timeSpent || 1)) * 60);
  const activeWpm = rawWpm > 1000 ? 0 : rawWpm; // filter out initialization spikes

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
    scrollProgress,
    fixation,
    setFixation,
    saccade,
    setSaccade,
    isPlayingTts,
    ttsRate,
    spokenWord,
    mouseY,
    highlightedWord,
    setHighlightedWord,
    sentenceContext,
    popoverCoords,
    selectedChapterIndex,
    parsed,
    activeText,
    activeWordCount: finalWordCount,
    activeReadingMinutes,
    activeWpm,
    fontSizeClass,
    containerRef,
    handleSelectChapter,
    handleStartReading,
    handleResumeReading,
    handleMarkComplete,
    handleTextSelection,
    handleMouseMove,
    handleTogglePlayTts,
    handleStopTts,
    handleChangeTtsRate,
    initialDefinition,
    initialPronunciation,
    initialPartOfSpeech,
    initialExample,
    initialExampleTrans,
    isQuickSaveEnabled,
    setIsQuickSaveEnabled,
    isBilingualView,
    setIsBilingualView,
  };
}
