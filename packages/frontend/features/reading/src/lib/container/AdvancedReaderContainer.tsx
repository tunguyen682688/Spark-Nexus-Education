import React from 'react';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { WordSelectionPopover } from '../components/reader/WordSelectionPopover';
import { ArticleQuiz } from '../components/reader/ArticleQuiz';
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@spark-nest-ed/frontend-shared-components';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  CalendarDays,
  Clock3,
  FileText,
  ListTree,
  Library,
  CheckCircle2,
  Volume2,
  Search,
} from 'lucide-react';
import { extractVocabFromBlocks } from '../utils/reader-vocab-extractor';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { ReaderBlocksRenderer } from '../components/reader/ReaderBlocksRenderer';
import { useAdvancedReader } from '../hooks/use-advanced-reader';
import type { Article } from '../types';
import type { ParsedContent, ReaderSection } from '../utils/reader-parser';
import { extractSectionsFromBlocks } from '../utils/reader-parser';
import {
  estimateReadingMinutes,
  formatReaderDate,
  getReaderContentProfile,
  type ReaderContentProfile,
} from '../utils/reader-content-profile';

interface AdvancedReaderContainerProps {
  articleId: string;
}

export const AdvancedReaderContainer: React.FC<
  AdvancedReaderContainerProps
> = ({ articleId }) => {
  const {
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
    spokenWord,
    mouseY,
    highlightedWord,
    setHighlightedWord,
    sentenceContext,
    popoverCoords,
    selectedChapterIndex,
    parsed,
    activeWordCount,
    activeReadingMinutes,
    activeWpm,
    fontSizeClass,
    containerRef,
    handleStartReading,
    handleResumeReading,
    handleMarkComplete,
    handleTextSelection,
    handleMouseMove,
    handleTogglePlayTts,
    handleStopTts,
    handleChangeTtsRate,
    ttsRate,
    initialDefinition,
    initialPronunciation,
    initialPartOfSpeech,
    initialExample,
    initialExampleTrans,
    isQuickSaveEnabled,
    setIsQuickSaveEnabled,
    isBilingualView,
    setIsBilingualView,
  } = useAdvancedReader(articleId);

  const [showOverview, setShowOverview] = React.useState(false);
  const initializedOverviewArticleIdRef = React.useRef<string | null>(null);

  const vocabItems = React.useMemo(() => {
    if (!article) return [];
    if (parsed.isBook && parsed.chapters) {
      const activeChapter = parsed.chapters[selectedChapterIndex];
      return extractVocabFromBlocks(activeChapter?.content ?? null);
    }
    return extractVocabFromBlocks(parsed.editorData ?? null);
  }, [article, parsed, selectedChapterIndex]);

  const scrollToWord = React.useCallback((word: string) => {
    const elements = document.querySelectorAll('.vocab-highlight');
    for (const el of Array.from(elements)) {
      if (el.textContent?.trim().toLowerCase() === word.toLowerCase()) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-blue-500/50', 'transition-all');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-blue-500/50');
        }, 2000);
        break;
      }
    }
  }, []);

  const playAudio = React.useCallback((url: string, fallbackWord: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => {
        const utterance = new SpeechSynthesisUtterance(fallbackWord);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      });
    } else {
      const utterance = new SpeechSynthesisUtterance(fallbackWord);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const profile = React.useMemo(
    () => (article ? getReaderContentProfile(article, parsed) : null),
    [article, parsed]
  );

  const activeSections = React.useMemo<ReaderSection[]>(() => {
    if (parsed.isBook) {
      return extractSectionsFromBlocks(
        parsed.chapters?.[selectedChapterIndex]?.content ?? null
      );
    }

    return parsed.sections ?? [];
  }, [parsed, selectedChapterIndex]);

  const remainingReadingMinutes = React.useMemo(
    () =>
      Math.max(
        0,
        Math.ceil(activeReadingMinutes * ((100 - scrollProgress) / 100))
      ),
    [activeReadingMinutes, scrollProgress]
  );

  React.useEffect(() => {
    if (
      article &&
      profile &&
      initializedOverviewArticleIdRef.current !== article.id
    ) {
      setShowOverview(profile.overviewFirst);
      initializedOverviewArticleIdRef.current = article.id;
    }
  }, [article, profile]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-sm font-semibold text-slate-500">
          Loading Article...
        </span>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-red-600">
          Failed to load Article
        </h3>
        <p className="text-slate-500">
          The article might have been archived or is no longer published.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (showOverview && profile) {
    return (
      <ReaderOverview
        article={article}
        parsed={parsed}
        profile={profile}
        activeWordCount={activeWordCount}
        activeSections={activeSections}
        selectedChapterIndex={selectedChapterIndex}
        onBack={() => window.history.back()}
        onStart={(index, mode) => {
          setShowOverview(false);
          if (mode === 'resume') {
            handleResumeReading(index);
            return;
          }

          handleStartReading(index);
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-900 selection:bg-blue-200/70 selection:text-slate-950 dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-blue-500/30 dark:selection:text-white"
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
        focusHeightLines={focusHeightLines}
        onChangeFocusHeightLines={setFocusHeightLines}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        isPlayingTts={isPlayingTts}
        onTogglePlayTts={handleTogglePlayTts}
        onStopTts={handleStopTts}
        ttsRate={ttsRate}
        onChangeTtsRate={handleChangeTtsRate}
        isQuickSaveEnabled={isQuickSaveEnabled}
        onToggleQuickSave={() => setIsQuickSaveEnabled(!isQuickSaveEnabled)}
        isBilingualView={isBilingualView}
        onToggleBilingualView={() => setIsBilingualView(!isBilingualView)}
      />

      {/* Focus Mode Overlay Curtain */}
      {isFocusMode && (
        <div
          className="fixed inset-0 pointer-events-none bg-slate-950/70 z-30 transition-all duration-150 backdrop-blur-[2px]"
          style={{
            clipPath: `polygon(0% 0%, 100% 0%, 100% ${
              mouseY - (focusHeightLines === 1 ? 25 : 65)
            }px, 0% ${mouseY - (focusHeightLines === 1 ? 25 : 65)}px, 0% ${
              mouseY + (focusHeightLines === 1 ? 25 : 65)
            }px, 100% ${
              mouseY + (focusHeightLines === 1 ? 25 : 65)
            }px, 100% 100%, 0% 100%)`,
          }}
        />
      )}

      <main className="w-full px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[240px_minmax(0,820px)_240px]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              {profile?.overviewFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOverview(true)}
                  className="h-9 w-full justify-start gap-2 rounded-lg border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Overview
                </Button>
              )}

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <ListTree className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Outline
                </div>
                {activeSections.length > 0 ? (
                  <div className="max-h-[52vh] space-y-1 overflow-y-auto pr-1">
                    {activeSections.map((section) => (
                      <button
                        key={section.id}
                        className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold leading-snug text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                        onClick={() =>
                          document
                            .getElementById(section.id)
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            })
                        }
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-slate-400">
                    This content has no headings yet.
                  </p>
                )}
              </div>
            </div>
          </aside>

          <article
            ref={containerRef}
            className="w-full space-y-7 rounded-2xl border border-slate-200 bg-white px-5 py-8 shadow-sm select-text dark:border-slate-800 dark:bg-slate-900 md:px-10 md:py-12"
            onMouseUp={handleTextSelection}
          >
        {/* Back to content overview */}
        {profile?.overviewFirst && (
          <div className="-mt-2 border-b border-slate-100 pb-2 dark:border-slate-800 xl:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverview(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-100/50 dark:border-blue-800/50 rounded-lg flex items-center gap-1.5 px-3 py-1.5 h-auto transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {profile.backLabel}
            </Button>
          </div>
        )}

        {/* Header Metadata */}
        <header className="space-y-4 border-b border-slate-100 pb-7 dark:border-slate-800">
          <span className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <span>
              {profile?.label || article.category} | {article.difficulty} Level
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              {activeWpm} WPM
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {activeWordCount.toLocaleString()} words
            </span>
          </span>
          <h1 className="font-serif text-3xl font-extrabold leading-[1.08] text-slate-950 dark:text-slate-50 md:text-5xl">
            {article.title}
          </h1>
          {article.author && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              By {article.author} | Published on {formatReaderDate(article.publishedAt || article.createdAt)}
            </p>
          )}
        </header>

        {/* Book Chapter Selector Dropdown */}
        {parsed.isBook && parsed.chapters && parsed.chapters.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <BookOpen className="h-4 w-4" />
              </span>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Reading Chapter
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {parsed.chapters[selectedChapterIndex]?.title ||
                    `Chapter ${selectedChapterIndex + 1}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedChapterIndex)}
                onValueChange={(val) => handleStartReading(Number(val))}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold h-9 rounded-lg shadow-sm">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] border-slate-200 dark:border-slate-800">
                  {parsed.chapters.map((ch, idx) => (
                    <SelectItem
                      key={ch.id || idx}
                      value={String(idx)}
                      className="text-xs font-medium py-2"
                    >
                      {ch.title || `Chapter ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeSections.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 xl:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <ListTree className="h-4 w-4 text-blue-600" />
                {profile?.tocTitle || 'Content sections'}
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-slate-900">
                {activeSections.length}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeSections.map((section) => (
                <button
                  key={section.id}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800"
                  onClick={() =>
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div
            className={cn(
            'space-y-5 font-serif text-slate-750 dark:text-slate-200 md:space-y-6',
            fontSizeClass
          )}
        >
          {parsed.isBook ? (
            parsed.chapters && parsed.chapters.length > 0 ? (
              <ReaderBlocksRenderer
                content={parsed.chapters[selectedChapterIndex]?.content}
                isBionicMode={isBionicMode}
                fixation={fixation}
                saccade={saccade}
                isBilingualView={isBilingualView}
                vocabularyHighlights={article?.vocabularyHighlights}
              />
            ) : (
              <p className="text-slate-400 italic">
                Quyển sách này chưa có chương nào.
              </p>
            )
          ) : (
            <ReaderBlocksRenderer
              content={parsed.editorData || parsed.plainText}
              isBionicMode={isBionicMode}
              fixation={fixation}
              saccade={saccade}
              isBilingualView={isBilingualView}
              vocabularyHighlights={article?.vocabularyHighlights}
            />
          )}
        </div>

        {/* Next/Prev Chapter Navigation */}
        {parsed.isBook && parsed.chapters && parsed.chapters.length > 0 && (
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedChapterIndex === 0}
              onClick={() => handleStartReading(selectedChapterIndex - 1)}
              className="gap-1.5 text-xs font-bold shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Chapter
            </Button>

            <span className="text-xs font-bold text-slate-450">
              Chapter {selectedChapterIndex + 1} of {parsed.chapters.length}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={selectedChapterIndex === parsed.chapters.length - 1}
              onClick={() => handleStartReading(selectedChapterIndex + 1)}
              className="gap-1.5 text-xs font-bold shadow-sm"
            >
              Next Chapter <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Reading session
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {Math.round(scrollProgress)}% done
              {remainingReadingMinutes > 0
                ? ` | about ${remainingReadingMinutes} min left`
                : ' | ready to complete'}
            </p>
          </div>
          <Button
            variant={scrollProgress >= 100 ? 'outline' : 'default'}
            size="sm"
            className="gap-2 text-xs font-bold"
            disabled={scrollProgress >= 100}
            onClick={handleMarkComplete}
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark complete
          </Button>
        </div>

        {/* Quiz Area: rendered inline when user reaches near the bottom of page */}
        {scrollProgress >= 80 && (
          <div className="border-t border-slate-100 pt-8 mt-8 space-y-4">
            <ArticleQuiz articleId={articleId} />
          </div>
        )}
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Session
                </p>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{Math.round(scrollProgress)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-400"
                        style={{ width: `${scrollProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <ReaderSideMetric
                      label="Words"
                      value={activeWordCount.toLocaleString()}
                    />
                    <ReaderSideMetric
                      label="Left"
                      value={
                        remainingReadingMinutes > 0
                          ? `${remainingReadingMinutes}m`
                          : 'Done'
                      }
                    />
                    <ReaderSideMetric
                      label="WPM"
                      value={String(activeWpm)}
                    />
                    <ReaderSideMetric
                      label="Read"
                      value={`${activeReadingMinutes}m`}
                    />
                  </div>

                  <Button
                    variant={scrollProgress >= 100 ? 'outline' : 'default'}
                    size="sm"
                    className="w-full gap-2 text-xs font-bold"
                    disabled={scrollProgress >= 100}
                    onClick={handleMarkComplete}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark complete
                  </Button>
                </div>
              </div>

              {/* Key Vocabulary Sidebar Section */}
              {vocabItems.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[380px] overflow-hidden">
                  <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-505 dark:text-slate-400 select-none">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Key Vocabulary ({vocabItems.length})
                  </div>
                  <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                    {vocabItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-805 transition-all text-xs"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <button
                            onClick={() => scrollToWord(item.word)}
                            className="font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 text-left"
                            title="Cuộn tới ngữ cảnh trong bài"
                          >
                            <Search className="h-3 w-3 text-slate-400 shrink-0" />
                            {item.word}
                          </button>
                          <button
                            onClick={() => playAudio('', item.word)}
                            className="p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors shrink-0"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                        </div>
                        {item.pronunciation && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            /{item.pronunciation}/
                          </div>
                        )}
                        {item.definition && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-1 bg-white dark:bg-slate-900 border border-slate-100/70 dark:border-slate-800/40 p-1.5 rounded">
                            {item.definition}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Selection Popover */}
      {highlightedWord && (
        <WordSelectionPopover
          word={highlightedWord}
          sentenceContext={sentenceContext}
          x={popoverCoords.x}
          y={popoverCoords.y}
          onClose={() => setHighlightedWord('')}
          initialDefinition={initialDefinition}
          initialPronunciation={initialPronunciation}
          initialPartOfSpeech={initialPartOfSpeech}
          initialExample={initialExample}
          initialExampleTrans={initialExampleTrans}
        />
      )}

      {/* Floating Subtitle Teleprompter during Speech Synthesis */}
      {isPlayingTts && spokenWord && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white font-sans text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2.5 border border-slate-800/80 backdrop-blur-sm z-50 transition-all duration-200">
          <div className="flex gap-1.5 items-center select-none">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
              Speaking:
            </span>
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

interface ReaderOverviewProps {
  article: Article;
  parsed: ParsedContent;
  profile: ReaderContentProfile;
  activeWordCount: number;
  activeSections: ReaderSection[];
  selectedChapterIndex: number;
  onBack: () => void;
  onStart: (chapterIndex: number, mode?: 'start' | 'resume') => void;
}

const ReaderOverview: React.FC<ReaderOverviewProps> = ({
  article,
  parsed,
  profile,
  activeWordCount,
  activeSections,
  selectedChapterIndex,
  onBack,
  onStart,
}) => {
  const chapters = parsed.chapters ?? [];
  const hasChapters = parsed.isBook && chapters.length > 0;
  const progress = Math.min(100, Math.max(0, article.progress || 0));
  const totalWords = article.wordCount || activeWordCount || 1;
  const readingMinutes = estimateReadingMinutes(totalWords, profile.readingRate);
  const publishedDate = formatReaderDate(article.publishedAt || article.createdAt);
  const overviewItems = hasChapters
    ? chapters.map((chapter, index) => ({
        id: chapter.id || String(index),
        title: chapter.title || `${profile.sectionLabel} ${index + 1}`,
        subtitle: chapter.isDraft ? 'Draft' : profile.sectionLabel,
        index,
      }))
    : activeSections.map((section, index) => ({
        id: section.id,
        title: section.title,
        subtitle: `Level H${section.level}`,
        index,
      }));

  const openSection = (section: ReaderSection) => {
    onStart(0, 'start');
    window.setTimeout(() => {
      document
        .getElementById(section.id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/40 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 pl-0 text-xs font-bold text-slate-500 hover:bg-transparent hover:text-slate-800 dark:hover:text-slate-200"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {profile.sourceLabel}
          </Button>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest',
              profile.accent.badge
            )}
          >
            {profile.label}
          </span>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {article.thumbnailUrl ? (
                <img
                  src={article.thumbnailUrl}
                  alt={article.title}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    'flex h-[420px] flex-col justify-between p-6',
                    profile.accent.bg,
                    profile.accent.border
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded border border-current/20 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest">
                      {article.difficulty}
                    </span>
                    <BookOpen className="h-5 w-5 opacity-70" />
                  </div>
                  <h2 className="font-serif text-2xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
                    {article.title}
                  </h2>
                  <div className="border-t border-current/10 pt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {article.author || 'Spark Nexus Ed'}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricTile
                icon={<FileText className="h-4 w-4" />}
                label="Words"
                value={totalWords.toLocaleString()}
              />
              <MetricTile
                icon={<Clock3 className="h-4 w-4" />}
                label="Read time"
                value={`${readingMinutes} min`}
              />
              <MetricTile
                icon={<CalendarDays className="h-4 w-4" />}
                label="Published"
                value={publishedDate}
              />
              <MetricTile
                icon={<Library className="h-4 w-4" />}
                label="Level"
                value={article.difficulty || 'N/A'}
              />
            </div>
          </aside>

          <main className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    'rounded border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                    profile.accent.badge
                  )}
                >
                  {article.category || profile.label}
                </span>
                {article.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <h1 className="font-serif text-3xl font-extrabold leading-tight text-slate-950 dark:text-slate-50 md:text-5xl">
                  {article.title}
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {article.author ? `By ${article.author}` : 'Curated reading'}
                  {' | '}
                  {profile.noun}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-xs font-bold">
                <span className="text-slate-500 dark:text-slate-400">
                  Reading progress
                </span>
                <span className={profile.accent.text}>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn('h-full rounded-full transition-all', profile.accent.button)}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {hasChapters && progress > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last position:{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {chapters[article.lastPosition ?? selectedChapterIndex]?.title ||
                      `${profile.sectionLabel} ${(article.lastPosition ?? selectedChapterIndex) + 1}`}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {profile.summaryTitle}
              </h2>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-650 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-350">
                {article.summary ? (
                  <p className="whitespace-pre-line">{article.summary}</p>
                ) : (
                  <p className="italic text-slate-400">{profile.summaryFallback}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className={cn(
                  'h-11 w-full gap-2 rounded-lg px-6 text-sm font-bold sm:w-auto',
                  profile.accent.button,
                  profile.accent.buttonHover
                )}
                onClick={() =>
                  onStart(
                    progress > 0 ? article.lastPosition ?? 0 : 0,
                    progress > 0 ? 'resume' : 'start'
                  )
                }
              >
                <BookOpen className="h-4 w-4" />
                {progress > 0 ? profile.continueLabel : profile.startLabel}
              </Button>
              {progress > 0 && (
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-lg px-6 text-sm font-bold sm:w-auto"
                  onClick={() => onStart(0, 'start')}
                >
                  <RotateCcw className="h-4 w-4" />
                  {profile.restartLabel}
                </Button>
              )}
            </div>
          </main>
        </section>

        {overviewItems.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-slate-100">
                <ListTree className={cn('h-4 w-4', profile.accent.text)} />
                {profile.tocTitle}
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {overviewItems.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {overviewItems.map((item, itemIndex) => {
                const isCurrent = hasChapters && item.index === (article.lastPosition ?? 0);
                const isDone =
                  hasChapters &&
                  (item.index < (article.lastPosition ?? 0) ||
                    (item.index === (article.lastPosition ?? 0) && progress === 100));

                return (
                  <button
                    key={item.id}
                    className={cn(
                      'flex min-h-[74px] w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors',
                      isCurrent
                        ? cn(profile.accent.bg, profile.accent.border)
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850'
                    )}
                    onClick={() => {
                      if (hasChapters) {
                        onStart(item.index, 'start');
                        return;
                      }

                      const section = activeSections[itemIndex];
                      if (section) openSection(section);
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold',
                          isCurrent
                            ? cn(profile.accent.button)
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        {item.index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {item.title}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {isCurrent && progress > 0 && progress < 100 && (
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', profile.accent.badge)}>
                          {profile.currentLabel}
                        </span>
                      )}
                      {isDone && (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          {profile.completedLabel}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-350" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const MetricTile: React.FC<MetricTileProps> = ({ icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-2 flex items-center gap-2 text-slate-400">
      {icon}
      <span className="text-[10px] font-extrabold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">
      {value}
    </div>
  </div>
);

interface ReaderSideMetricProps {
  label: string;
  value: string;
}

const ReaderSideMetric: React.FC<ReaderSideMetricProps> = ({
  label,
  value,
}) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/50">
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </div>
    <div className="mt-1 truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">
      {value}
    </div>
  </div>
);

export default AdvancedReaderContainer;
