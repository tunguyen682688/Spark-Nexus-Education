import React, { useEffect, useState, useRef } from 'react';
import { useArticle, useUpdateReadingProgress } from '../hooks/use-reading';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { WordSelectionPopover } from '../components/reader/WordSelectionPopover';
import { bionicReadingTransform, TextToSpeechPlayer } from '../services/reading.service';
import { ArticleQuiz } from '../components/reader/ArticleQuiz';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { Loader2 } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface AdvancedReaderContainerProps {
  articleId: string;
}

export const AdvancedReaderContainer: React.FC<AdvancedReaderContainerProps> = ({
  articleId,
}) => {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const timeSpentRef = useRef(0);
  const lastSavedProgressRef = useRef(0);

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
          lastPosition: 1, 
          timeSpent: timeSpentRef.current,
        });
      }
    };
  }, [article, scrollProgress, articleId, updateProgress]);

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
        lastPosition: 1,
        timeSpent: timeSpentRef.current,
      });
    }
  }, [scrollProgress, article, articleId, updateProgress]);

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
    if (article && article.progress && lastSavedProgressRef.current === 0) {
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
  }, [article]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      TextToSpeechPlayer.stop();
    };
  }, []);

  // 3. Highlight Word Selector
  const handleTextSelection = () => {
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
        setSentenceContext(sentence);
        setPopoverCoords({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY,
        });
      } catch (err) {
        console.error('Error getting range rect', err);
      }
    }
  };

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
  const handleMouseMove = (e: React.MouseEvent) => {
    setMouseY(e.clientY);
  };

  // 5. TTS controls
  const handleTogglePlayTts = () => {
    if (!article) return;
    
    if (isPlayingTts) {
      TextToSpeechPlayer.pause();
      setIsPlayingTts(false);
    } else {
      setIsPlayingTts(true);
      TextToSpeechPlayer.play(
        article.content,
        ttsRate,
        (charIndex, charLength) => {
          const activeText = article.content.substring(charIndex, charIndex + charLength);
          setSpokenWord(activeText);
        },
        () => {
          setIsPlayingTts(false);
          setSpokenWord('');
        }
      );
    }
  };

  const handleStopTts = () => {
    TextToSpeechPlayer.stop();
    setIsPlayingTts(false);
    setSpokenWord('');
  };

  const handleChangeTtsRate = (rate: number) => {
    setTtsRate(rate);
    if (isPlayingTts && article) {
      TextToSpeechPlayer.play(
        article.content,
        rate,
        (charIndex, charLength) => {
          const activeText = article.content.substring(charIndex, charIndex + charLength);
          setSpokenWord(activeText);
        },
        () => {
          setIsPlayingTts(false);
          setSpokenWord('');
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-sm font-semibold text-slate-500">Loading Article...</span>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-red-600">Failed to load Article</h3>
        <p className="text-slate-500">The article might have been archived or is no longer published.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Calculate live WPM
  const wordCount = article.wordCount || 1;
  const rawWpm = Math.round((wordCount / (timeSpent || 1)) * 60);
  const activeWpm = rawWpm > 1000 ? 0 : rawWpm; // filter out initialization spikes

  const fontSizeClass = 
    fontSize === 'sm' 
      ? 'text-sm leading-relaxed' 
      : fontSize === 'lg' 
      ? 'text-lg md:text-xl leading-relaxed' 
      : 'text-base md:text-lg leading-relaxed';

  return (
    <div 
      className="min-h-screen bg-slate-50/30 flex flex-col items-center select-none"
      onMouseMove={isFocusMode ? handleMouseMove : undefined}
    >
      {/* Interactive sticky toolbar */}
      <ReaderToolbar
        scrollProgress={scrollProgress}
        isBionicMode={isBionicMode}
        onToggleBionicMode={() => setIsBionicMode(!isBionicMode)}
        fixation={fixation}
        onChangeFixation={setFixation}
        saccade={saccade}
        onChangeSaccade={setSaccade}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        isPlayingTts={isPlayingTts}
        onTogglePlayTts={handleTogglePlayTts}
        onStopTts={handleStopTts}
        ttsRate={ttsRate}
        onChangeTtsRate={handleChangeTtsRate}
      />

      {/* Focus Mode Overlay Curtain */}
      {isFocusMode && (
        <div
          className="fixed inset-0 pointer-events-none bg-black/60 z-30 mix-blend-multiply transition-all duration-150"
          style={{
            clipPath: `polygon(0% 0%, 100% 0%, 100% ${mouseY - 70}px, 0% ${mouseY - 70}px, 0% ${mouseY + 70}px, 100% ${mouseY + 70}px, 100% 100%, 0% 100%)`,
          }}
        />
      )}

      {/* Main text content container */}
      <div 
        ref={containerRef}
        className="max-w-[750px] w-full px-5 py-8 md:py-14 bg-white border border-slate-100 shadow-sm mt-6 rounded-xl space-y-6 md:space-y-8 select-text"
        onMouseUp={handleTextSelection}
      >
        {/* Header Metadata */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest flex items-center gap-2">
            <span>{article.category} • {article.difficulty} Level</span>
            <span className="bg-blue-50 text-blue-600 font-mono font-bold px-2 py-0.5 rounded-full select-none text-[10px]">
              <span role="img" aria-label="thunderbolt">⚡</span> {activeWpm} WPM
            </span>
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-extrabold text-slate-800 leading-tight">
            {article.title}
          </h1>
          {article.author && (
            <p className="text-xs text-slate-400 font-medium">
              By {article.author} • Published on {new Date(article.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Article Body Content */}
        <div 
          className={cn("text-slate-700 font-serif space-y-5 md:space-y-6", fontSizeClass)}
        >
          {isBionicMode ? (
            <div 
              dangerouslySetInnerHTML={{ __html: bionicReadingTransform(article.content, fixation, saccade) }} 
            />
          ) : (
            article.content.split(/\n+/).map((para, index) => (
              <p key={index} className="leading-relaxed">
                {para}
              </p>
            ))
          )}
        </div>

        {/* Quiz Area: rendered inline when user reaches near the bottom of page */}
        {scrollProgress >= 80 && (
          <div className="border-t border-slate-100 pt-8 mt-8 space-y-4">
            <ArticleQuiz articleId={articleId} />
          </div>
        )}
      </div>

      {/* Selection Popover */}
      {highlightedWord && (
        <WordSelectionPopover
          word={highlightedWord}
          sentenceContext={sentenceContext}
          x={popoverCoords.x}
          y={popoverCoords.y}
          onClose={() => setHighlightedWord('')}
        />
      )}

      {/* Floating Subtitle Teleprompter during Speech Synthesis */}
      {isPlayingTts && spokenWord && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white font-sans text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2.5 border border-slate-800/80 backdrop-blur-sm z-50 transition-all duration-200">
          <div className="flex gap-1.5 items-center select-none">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Speaking:</span>
          </div>
          <span className="font-extrabold text-blue-400 tracking-wide text-xs select-all bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700/50">
            {spokenWord}
          </span>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
};
export default AdvancedReaderContainer;
