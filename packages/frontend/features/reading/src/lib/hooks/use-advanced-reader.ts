import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useArticle, useUpdateReadingProgress } from './use-reading';
import { TextToSpeechPlayer } from '../services/reading.service';
import { extractTextFromBlocks, parseReaderContent } from '../utils/reader-parser';

export function useAdvancedReader(articleId: string) {
  const { data: article, isLoading, isError } = useArticle(articleId);
  const { mutate: updateProgress } = useUpdateReadingProgress();

  const [isBionicMode, setIsBionicMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Bionic Reading Weights
  const [fixation, setFixation] = useState(0.4);
  const [saccade, setSaccade] = useState(1.0);

  // Text To Speech
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [spokenWord, setSpokenWord] = useState('');

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

  const containerRef = useRef<HTMLDivElement>(null);
  const timeSpentRef = useRef(0);
  const lastSavedProgressRef = useRef(0);

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
          window.scrollTo({
            top: (article.progress / 100) * docHeight,
            behavior: 'smooth',
          });
        }
      }, 500);
    }
  }, [article, parsed.isBook, hasInitializedChapter]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      TextToSpeechPlayer.stop();
    };
  }, []);

  // Effect to handle click events on .vocab-highlight elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const highlightEl = target.closest('.vocab-highlight') as HTMLElement | null;
      if (highlightEl) {
        e.preventDefault();
        e.stopPropagation();

        const word = highlightEl.textContent?.trim() || '';
        const definition = highlightEl.getAttribute('data-def') || '';
        const pronunciation = highlightEl.getAttribute('data-pron') || '';
        const level = highlightEl.getAttribute('data-level') || '';

        // Get coordinates for popover relative to document
        const rect = highlightEl.getBoundingClientRect();
        
        setHighlightedWord(word);
        setInitialDefinition(definition);
        setInitialPronunciation(pronunciation);
        setInitialPartOfSpeech(level);
        setSentenceContext(''); // No context translation needed
        setPopoverCoords({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY,
        });
      }
    };

    container.addEventListener('click', handleContainerClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
    };
  }, [activeText, selectedChapterIndex]);

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
    activeWpm,
    fontSizeClass,
    containerRef,
    handleSelectChapter,
    handleTextSelection,
    handleMouseMove,
    handleTogglePlayTts,
    handleStopTts,
    handleChangeTtsRate,
    initialDefinition,
    initialPronunciation,
    initialPartOfSpeech,
  };
}
