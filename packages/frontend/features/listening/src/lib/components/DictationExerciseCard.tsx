import React from 'react';
import { Volume2, Gauge, Languages, Keyboard, ArrowLeft, ArrowRight } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';

interface DictationExerciseCardProps {
  currentSub: ListeningSubtitle;
  selectedSubIndex: number;
  subtitles: ListeningSubtitle[];

  playbackSpeed: number;
  changeSpeed: () => void;
  playSentence: (start: number, end: number) => void;
  showTranslation: boolean;
  setShowTranslation: (val: boolean) => void;
  typedTexts: Record<string, string>;
  setTypedTexts: (val: Record<string, string>) => void;
  submittedDictations: Record<string, boolean>;
  setSubmittedDictations: (val: Record<string, boolean>) => void;
  handleResetCurrent: () => void;
  cleanWord: (word: string) => string;
  handleSubmitDictation: () => void;
  saveProgress: (submitted: Record<string, boolean>, allCompleted: boolean) => void;
  setSelectedSubIndex: (idx: number) => void;
  getDictationStats: (orig: string, typed: string) => { accuracy: number };
}

export const DictationExerciseCard: React.FC<DictationExerciseCardProps> = ({
  currentSub,
  selectedSubIndex,
  subtitles,
  playbackSpeed,
  changeSpeed,
  playSentence,
  showTranslation,
  setShowTranslation,
  typedTexts,
  setTypedTexts,
  submittedDictations,
  setSubmittedDictations,
  handleResetCurrent,
  cleanWord,
  handleSubmitDictation,
  saveProgress,
  setSelectedSubIndex,
  getDictationStats,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.DICTATION;
  const common = LISTENING_WORKSPACE_TEXT.COMMON;

  const isChecked = submittedDictations[currentSub.id] || false;
  const currentStats = getDictationStats(currentSub.text, typedTexts[currentSub.id] || '');

  return (
    <div className="bg-card/40 border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-xl backdrop-blur-md min-h-fit">
      {/* Timeline Header and Sentence controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            CURRENT FOCUS
          </span>
          <h2 className="text-lg font-extrabold text-foreground mt-0.5">
            {text.FOCUS_LABEL(selectedSubIndex + 1, subtitles.length)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={changeSpeed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-background border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
          >
            <Gauge className="w-3.5 h-3.5" />
            {common.SPEED_LABEL(playbackSpeed)}
          </button>
          <button
            onClick={() => playSentence(currentSub.startTime, currentSub.endTime)}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md shadow-primary/10"
          >
            <Volume2 className="w-4 h-4" />
            {text.REPEAT_BUTTON}
          </button>
        </div>
      </div>

      {/* Translation hint card toggled dynamically */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            {showTranslation ? text.HIDE_TRANSLATION : text.SHOW_TRANSLATION}
          </button>
        </div>

        {showTranslation && currentSub.translation && (
          <div className="p-4 bg-background/40 border border-border rounded-xl leading-relaxed">
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
              {text.TRANSLATION_TITLE}
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              {currentSub.translation}
            </p>
          </div>
        )}
      </div>

      {/* Workspace typing box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-primary" />
            {text.INPUT_TITLE}
          </span>
          {typedTexts[currentSub.id]?.length > 0 && (
            <button
              onClick={handleResetCurrent}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              {text.CLEAR_BUTTON}
            </button>
          )}
        </div>

        <textarea
          value={typedTexts[currentSub.id] || ''}
          onChange={(e) => {
            setTypedTexts({
              ...typedTexts,
              [currentSub.id]: e.target.value,
            });
            if (submittedDictations[currentSub.id]) {
              setSubmittedDictations({
                ...submittedDictations,
                [currentSub.id]: false,
              });
            }
          }}
          placeholder={text.INPUT_PLACEHOLDER}
          className="w-full min-h-[140px] bg-background border border-border rounded-xl p-4 text-sm text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none transition-all leading-relaxed resize-none"
        />
      </div>

      {/* Dynamic checking diffuser */}
      {isChecked && (
        <div className="space-y-3 p-4 bg-background/45 border border-border rounded-xl">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded border ${
                  currentStats.accuracy >= 90
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}
              >
                {text.ACCURACY_STAT(currentStats.accuracy)}
              </span>
            </div>
            <button
              onClick={() => {
                setTypedTexts({
                  ...typedTexts,
                  [currentSub.id]: currentSub.text,
                });
                setSubmittedDictations({
                  ...submittedDictations,
                  [currentSub.id]: true,
                });
              }}
              className="text-primary hover:text-primary/80"
            >
              {text.ORIGINAL_ANSWER}
            </button>
          </div>

          {/* Word matching comparison output */}
          <div className="flex flex-wrap gap-x-2 gap-y-1.5 p-3.5 bg-background border border-border rounded-xl mt-2 leading-relaxed">
            {currentSub.text
              .split(/\s+/)
              .filter(Boolean)
              .map((word, idx) => {
                const cleaned = cleanWord(word);
                const userTypedWords = (typedTexts[currentSub.id] || '')
                  .split(/\s+/)
                  .filter(Boolean)
                  .map(cleanWord);
                const userWord = userTypedWords[idx] || '';
                const isCorrect = cleaned === userWord;

                return (
                  <span
                    key={idx}
                    className={`text-sm px-1 rounded transition-all ${
                      !userTypedWords[idx]
                        ? 'text-muted-foreground line-through decoration-dotted'
                        : isCorrect
                        ? 'text-emerald-400 font-bold bg-emerald-500/5'
                        : 'text-red-400 font-semibold bg-red-500/5 border border-red-500/10'
                    }`}
                    title={
                      userTypedWords[idx]
                        ? text.TYPED_WORD_TITLE(userTypedWords[idx])
                        : text.MISSING_WORD_TITLE
                    }
                  >
                    {word}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Action and Navigator controls */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/80 mt-auto">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const prev = Math.max(0, selectedSubIndex - 1);
              setSelectedSubIndex(prev);
            }}
            disabled={selectedSubIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted hover:text-foreground rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {text.PREV_BUTTON}
          </button>
          <button
            onClick={() => {
              const next = Math.min(subtitles.length - 1, selectedSubIndex + 1);
              setSelectedSubIndex(next);
            }}
            disabled={selectedSubIndex === subtitles.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted hover:text-foreground rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {text.NEXT_BUTTON}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 animate-in fade-in duration-300">
          <button
            onClick={() => {
              const updatedTyped = {
                ...typedTexts,
                [currentSub.id]: currentSub.text,
              };
              setTypedTexts(updatedTyped);
              const updatedSubmitted = {
                ...submittedDictations,
                [currentSub.id]: true,
              };
              setSubmittedDictations(updatedSubmitted);
              const allCompleted = subtitles.length > 0 && subtitles.every((sub) => updatedSubmitted[sub.id]);
              saveProgress(updatedSubmitted, allCompleted);
            }}
            className="px-4 py-2 text-xs font-bold text-muted-foreground bg-background hover:bg-muted rounded-xl transition-all border border-border"
          >
            {text.ANSWERS_BUTTON}
          </button>
          <button
            onClick={handleSubmitDictation}
            disabled={!typedTexts[currentSub.id]?.trim()}
            className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
          >
            {text.CHECK_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictationExerciseCard;
