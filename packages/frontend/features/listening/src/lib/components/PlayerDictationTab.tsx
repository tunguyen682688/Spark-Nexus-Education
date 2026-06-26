import React from 'react';
import { BookOpen, Volume2, Keyboard, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { ListeningSubtitle } from '../types';
import { LISTENING_WORKSPACE_TEXT } from '../constants';

interface PlayerDictationTabProps {
  subtitles?: ListeningSubtitle[];
  selectedSubIndex: number;
  onSelectSubIndex: (index: number) => void;
  typedTexts: Record<string, string>;
  onTypedTextChange: (id: string, text: string) => void;
  submittedDictations: Record<string, boolean>;
  onSubmittedDictationChange: (id: string, submitted: boolean) => void;
  playSentence: (startTime: number, endTime: number) => void;
  showTranslation: boolean;
}

export const PlayerDictationTab: React.FC<PlayerDictationTabProps> = ({
  subtitles = [],
  selectedSubIndex,
  onSelectSubIndex,
  typedTexts,
  onTypedTextChange,
  submittedDictations,
  onSubmittedDictationChange,
  playSentence,
  showTranslation,
}) => {
  const currentSub = subtitles[selectedSubIndex];

  const cleanWord = (w: string) => w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();

  const renderComparison = (original: string, typed: string) => {
    const originalWords = original.split(/\s+/).filter(Boolean);
    const typedWords = (typed || '').split(/\s+/).filter(Boolean).map(cleanWord);

    return (
      <div className="flex flex-wrap gap-x-2 gap-y-1.5 p-4 bg-background border border-border rounded-xl mt-2 leading-relaxed">
        {originalWords.map((word, idx) => {
          const cleaned = cleanWord(word);
          const typedCleaned = typedWords[idx] || '';
          const isCorrect = cleaned === typedCleaned;

          return (
            <span
              key={idx}
              className={`text-sm px-1 rounded transition-colors ${
                !typedWords[idx]
                  ? 'text-muted-foreground line-through decoration-dotted'
                  : isCorrect
                  ? 'text-emerald-400 font-bold bg-emerald-505/5'
                  : 'text-red-400 font-semibold bg-red-505/5 border border-red-505/10'
              }`}
              title={typedWords[idx] ? LISTENING_WORKSPACE_TEXT.PLAYER.TYPED_WORD_TITLE(typedWords[idx]) : LISTENING_WORKSPACE_TEXT.PLAYER.MISSING_WORD_TITLE}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  if (subtitles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-20 bg-muted/10 border border-border rounded-2xl">
        <Info className="w-12 h-12 text-muted-foreground/60 mb-3" />
        <p className="text-sm font-medium">{LISTENING_WORKSPACE_TEXT.PLAYER.NO_DICTATION}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      {/* Left side: Sentences selector list */}
      <div className="w-full md:w-5/12 bg-card/40 border border-border rounded-2xl p-4 flex flex-col h-[300px] md:h-full overflow-hidden">
        <div className="flex items-center gap-2 mb-3 px-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {LISTENING_WORKSPACE_TEXT.PLAYER.SELECT_SENTENCE}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {subtitles.map((sub, idx) => {
            const isCurrent = selectedSubIndex === idx;
            const isChecked = submittedDictations[sub.id];
            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubIndex(idx)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'bg-primary/10 border-primary/50 text-foreground shadow-sm'
                    : 'bg-muted/20 border-transparent hover:bg-muted/40 hover:border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {LISTENING_WORKSPACE_TEXT.PLAYER.SENTENCE_INDEX(idx + 1)}
                  </span>
                  {isChecked && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-505/10 px-2 py-0.5 rounded-full border border-emerald-555/10">
                      {LISTENING_WORKSPACE_TEXT.PLAYER.CHECKED}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium truncate mt-2 leading-relaxed">
                  {sub.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Dictation workspace */}
      <div className="flex-1 flex flex-col gap-5 justify-between">
        {currentSub && (
          <div className="bg-card/40 border border-border rounded-2xl p-6 flex flex-col justify-between flex-1 gap-4 shadow-sm">
            {/* Top info and Audio replay */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {LISTENING_WORKSPACE_TEXT.PLAYER.WORKSPACE}
                </span>
                <h2 className="text-base font-extrabold text-foreground mt-0.5">
                  {LISTENING_WORKSPACE_TEXT.PLAYER.WORKSPACE_INDEX(selectedSubIndex + 1, subtitles.length)}
                </h2>
              </div>
              
              <button
                onClick={() => playSentence(currentSub.startTime, currentSub.endTime)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md shadow-primary/10 self-start"
              >
                <Volume2 className="w-4 h-4" />
                {LISTENING_WORKSPACE_TEXT.PLAYER.PLAY_SENTENCE}
              </button>
            </div>

            {/* Typing area */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <Keyboard className="w-4 h-4 text-primary" />
                {LISTENING_WORKSPACE_TEXT.PLAYER.HEAR_AND_TYPE}
              </div>
              <textarea
                value={typedTexts[currentSub.id] || ''}
                onChange={(e) => {
                  onTypedTextChange(currentSub.id, e.target.value);
                }}
                placeholder="Type what you hear..."
                className="w-full flex-1 min-h-[120px] bg-background border border-border rounded-xl p-4 text-sm text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none transition-all leading-relaxed resize-none"
              />
            </div>

            {/* Answer Checking & Diffs */}
            {submittedDictations[currentSub.id] && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground uppercase tracking-wide">
                    {LISTENING_WORKSPACE_TEXT.PLAYER.RESULT_ANALYSIS}
                  </span>
                  <button
                    onClick={() => {
                      onTypedTextChange(currentSub.id, currentSub.text);
                      onSubmittedDictationChange(currentSub.id, true);
                    }}
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    {LISTENING_WORKSPACE_TEXT.PLAYER.FILL_ORIGINAL}
                  </button>
                </div>
                
                {/* Subtitle diff render */}
                {renderComparison(currentSub.text, typedTexts[currentSub.id])}

                {/* Display Vietnamese Translation */}
                {showTranslation && currentSub.translation && (
                  <div className="p-3 bg-background/40 border border-border rounded-xl">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                      {LISTENING_WORKSPACE_TEXT.PLAYER.TRANSLATION}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {currentSub.translation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/65 mt-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectSubIndex(Math.max(0, selectedSubIndex - 1));
                  }}
                  disabled={selectedSubIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted hover:text-foreground rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {LISTENING_WORKSPACE_TEXT.PLAYER.PREV_SENTENCE}
                </button>
                <button
                  onClick={() => {
                    onSelectSubIndex(Math.min(subtitles.length - 1, selectedSubIndex + 1));
                  }}
                  disabled={selectedSubIndex === subtitles.length - 1}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted hover:text-foreground rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {LISTENING_WORKSPACE_TEXT.PLAYER.NEXT_SENTENCE}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onTypedTextChange(currentSub.id, currentSub.text);
                    onSubmittedDictationChange(currentSub.id, true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-muted-foreground bg-background hover:bg-muted rounded-xl transition-all border border-border"
                >
                  {LISTENING_WORKSPACE_TEXT.PLAYER.SHOW_ANSWER}
                </button>
                <button
                  onClick={() => {
                    onSubmittedDictationChange(currentSub.id, true);
                  }}
                  disabled={!(typedTexts[currentSub.id]?.trim())}
                  className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/10"
                >
                  {LISTENING_WORKSPACE_TEXT.PLAYER.CHECK_ANSWER}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDictationTab;
