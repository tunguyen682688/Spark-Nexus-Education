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
import { Loader2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { ReaderBlocksRenderer } from '../components/reader/ReaderBlocksRenderer';
import { useAdvancedReader } from '../hooks/use-advanced-reader';

interface AdvancedReaderContainerProps {
  articleId: string;
}

export const AdvancedReaderContainer: React.FC<AdvancedReaderContainerProps> = ({
  articleId,
}) => {
  const {
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
    ttsRate,
    initialDefinition,
    initialPronunciation,
    initialPartOfSpeech,
  } = useAdvancedReader(articleId);

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

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center select-none"
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
        className="max-w-[750px] w-full px-5 py-8 md:py-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm mt-6 rounded-xl space-y-6 md:space-y-8 select-text"
        onMouseUp={handleTextSelection}
      >
        {/* Header Metadata */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest flex items-center gap-2">
            <span>{article.category} • {article.difficulty} Level</span>
            <span className="bg-blue-50 text-blue-600 font-mono font-bold px-2 py-0.5 rounded-full select-none text-[10px]">
              <span role="img" aria-label="thunderbolt">⚡</span> {activeWpm} WPM
            </span>
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {article.title}
          </h1>
          {article.author && (
            <p className="text-xs text-slate-400 font-medium">
              By {article.author} • Published on {new Date(article.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Book Chapter Selector Dropdown */}
        {parsed.isBook && parsed.chapters && parsed.chapters.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <BookOpen className="h-4 w-4" />
              </span>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reading Chapter</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {parsed.chapters[selectedChapterIndex]?.title || `Chapter ${selectedChapterIndex + 1}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedChapterIndex)}
                onValueChange={(val) => handleSelectChapter(Number(val))}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold h-9 rounded-lg shadow-sm">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] border-slate-200 dark:border-slate-800">
                  {parsed.chapters.map((ch, idx) => (
                    <SelectItem key={ch.id || idx} value={String(idx)} className="text-xs font-medium py-2">
                      {ch.title || `Chapter ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div
          className={cn("text-slate-705 dark:text-slate-300 font-serif space-y-5 md:space-y-6", fontSizeClass)}
        >
          {parsed.isBook ? (
            parsed.chapters && parsed.chapters.length > 0 ? (
              <ReaderBlocksRenderer
                content={parsed.chapters[selectedChapterIndex]?.content}
                isBionicMode={isBionicMode}
                fixation={fixation}
                saccade={saccade}
              />
            ) : (
              <p className="text-slate-400 italic">Quyển sách này chưa có chương nào.</p>
            )
          ) : (
            <ReaderBlocksRenderer
              content={parsed.editorData || parsed.plainText}
              isBionicMode={isBionicMode}
              fixation={fixation}
              saccade={saccade}
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
              onClick={() => handleSelectChapter(selectedChapterIndex - 1)}
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
              onClick={() => handleSelectChapter(selectedChapterIndex + 1)}
              className="gap-1.5 text-xs font-bold shadow-sm"
            >
              Next Chapter <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

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
          initialDefinition={initialDefinition}
          initialPronunciation={initialPronunciation}
          initialPartOfSpeech={initialPartOfSpeech}
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
