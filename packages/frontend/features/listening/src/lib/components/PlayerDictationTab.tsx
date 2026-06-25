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
      <div className="flex flex-wrap gap-x-2 gap-y-1.5 p-4 bg-slate-950 border border-slate-850 rounded-xl mt-2 leading-relaxed">
        {originalWords.map((word, idx) => {
          const cleaned = cleanWord(word);
          const typedCleaned = typedWords[idx] || '';
          const isCorrect = cleaned === typedCleaned;

          return (
            <span
              key={idx}
              className={`text-sm px-1 rounded transition-colors ${
                !typedWords[idx]
                  ? 'text-slate-500 line-through decoration-dotted'
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
      <div className="flex-1 flex flex-col items-center justify-center text-slate-505 py-20 bg-slate-900/20 border border-slate-800 rounded-2xl">
        <Info className="w-12 h-12 text-slate-700 mb-3" />
        <p className="text-sm font-medium">{LISTENING_WORKSPACE_TEXT.PLAYER.NO_DICTATION}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      {/* Left side: Sentences selector list */}
      <div className="w-full md:w-5/12 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[300px] md:h-full overflow-hidden">
        <div className="flex items-center gap-2 mb-3 px-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-405">
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
                    ? 'bg-purple-600/10 border-purple-500/50 text-slate-105 shadow-sm'
                    : 'bg-slate-955/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800 text-slate-405 hover:text-slate-205'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-505'
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
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between flex-1 gap-4 shadow-sm">
            {/* Top info and Audio replay */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-505 uppercase tracking-wider">
                  {LISTENING_WORKSPACE_TEXT.PLAYER.WORKSPACE}
                </span>
                <h2 className="text-base font-extrabold text-slate-200 mt-0.5">
                  {LISTENING_WORKSPACE_TEXT.PLAYER.WORKSPACE_INDEX(selectedSubIndex + 1, subtitles.length)}
                </h2>
              </div>
              
              <button
                onClick={() => playSentence(currentSub.startTime, currentSub.endTime)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-md shadow-purple-655/10 self-start"
              >
                <Volume2 className="w-4 h-4" />
                {LISTENING_WORKSPACE_TEXT.PLAYER.PLAY_SENTENCE}
              </button>
            </div>

            {/* Typing area */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <Keyboard className="w-4 h-4 text-purple-400" />
                {LISTENING_WORKSPACE_TEXT.PLAYER.HEAR_AND_TYPE}
              </div>
              <textarea
                value={typedTexts[currentSub.id] || ''}
                onChange={(e) => {
                  onTypedTextChange(currentSub.id, e.target.value);
                }}
                placeholder="Type what you hear..."
                className="w-full flex-1 min-h-[120px] bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-purple-505 focus:outline-none transition-all leading-relaxed resize-none"
              />
            </div>

            {/* Answer Checking & Diffs */}
            {submittedDictations[currentSub.id] && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-405 uppercase tracking-wide">
                    {LISTENING_WORKSPACE_TEXT.PLAYER.RESULT_ANALYSIS}
                  </span>
                  <button
                    onClick={() => {
                      onTypedTextChange(currentSub.id, currentSub.text);
                      onSubmittedDictationChange(currentSub.id, true);
                    }}
                    className="text-purple-400 hover:text-purple-305 font-semibold"
                  >
                    {LISTENING_WORKSPACE_TEXT.PLAYER.FILL_ORIGINAL}
                  </button>
                </div>
                
                {/* Subtitle diff render */}
                {renderComparison(currentSub.text, typedTexts[currentSub.id])}

                {/* Display Vietnamese Translation */}
                {showTranslation && currentSub.translation && (
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <p className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">
                      {LISTENING_WORKSPACE_TEXT.PLAYER.TRANSLATION}
                    </p>
                    <p className="text-xs text-slate-405 leading-relaxed font-medium">
                      {currentSub.translation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800/60 mt-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectSubIndex(Math.max(0, selectedSubIndex - 1));
                  }}
                  disabled={selectedSubIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-405 bg-slate-900 border border-slate-855 hover:bg-slate-800/60 hover:text-slate-205 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {LISTENING_WORKSPACE_TEXT.PLAYER.PREV_SENTENCE}
                </button>
                <button
                  onClick={() => {
                    onSelectSubIndex(Math.min(subtitles.length - 1, selectedSubIndex + 1));
                  }}
                  disabled={selectedSubIndex === subtitles.length - 1}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-405 bg-slate-900 border border-slate-855 hover:bg-slate-800/60 hover:text-slate-205 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                  className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-850 hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
                >
                  {LISTENING_WORKSPACE_TEXT.PLAYER.SHOW_ANSWER}
                </button>
                <button
                  onClick={() => {
                    onSubmittedDictationChange(currentSub.id, true);
                  }}
                  disabled={!(typedTexts[currentSub.id]?.trim())}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/10"
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
