import { Volume2, ArrowLeft } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';


interface GapFillExerciseCardProps {
  currentSub: ListeningSubtitle;

  wordsList: string[];
  blankedIndices: number[];
  userAnswers: Record<number, string>;
  setUserAnswers: (val: Record<number, string>) => void;
  isSubmitted: boolean;
  setIsSubmitted: (val: boolean) => void;
  showHints: boolean;
  setShowHints: (val: boolean) => void;
  scoreStats: { accuracy: number; correct: number; total: number };
  playSentence: (start: number, end: number) => void;
  cleanWord: (word: string) => string;
  handleSubmitGapFill: () => void;
  selectedSubIndex: number;
  setSelectedSubIndex: (val: number) => void;
  subtitleCount: number;
}

export const GapFillExerciseCard: React.FC<GapFillExerciseCardProps> = ({
  currentSub,
  wordsList,
  blankedIndices,
  userAnswers,
  setUserAnswers,
  isSubmitted,
  setIsSubmitted,
  showHints,
  setShowHints,
  scoreStats,
  playSentence,
  cleanWord,
  handleSubmitGapFill,
  selectedSubIndex,
  setSelectedSubIndex,
  subtitleCount,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.GAPFILL;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between flex-1 shadow-xl backdrop-blur-md min-h-fit gap-6">
      <div className="space-y-6">
        {/* Mode header */}
        <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-505 uppercase tracking-widest">
            {text.EXERCISE_TITLE}
          </span>
          <button
            onClick={() => playSentence(currentSub.startTime, currentSub.endTime)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-purple-650 hover:bg-purple-500 rounded-xl transition-all shadow-md shadow-purple-650/15"
          >
            <Volume2 className="w-4 h-4" />
            {text.REPEAT_BUTTON}
          </button>
        </div>

        {/* Sentence with Inputs */}
        <div className="p-6 bg-slate-955/50 border border-slate-850 rounded-2xl leading-loose flex flex-wrap items-center gap-x-2 gap-y-3">
          {wordsList.map((word, idx) => {
            const isBlanked = blankedIndices.includes(idx);
            if (isBlanked) {
              const userVal = userAnswers[idx] || '';
              const originalClean = cleanWord(word);
              const userClean = cleanWord(userVal);
              const isCorrect = originalClean === userClean;

              let inputStyle = 'border-slate-800 text-slate-202 focus:border-purple-500';
              if (isSubmitted) {
                inputStyle = isCorrect
                  ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold'
                  : 'border-red-500 bg-red-500/5 text-red-400 font-bold';
              }

              return (
                <span key={idx} className="relative inline-flex flex-col items-center">
                  <input
                    type="text"
                    value={userVal}
                    onChange={(e) => {
                      setUserAnswers({
                        ...userAnswers,
                        [idx]: e.target.value,
                      });
                      if (isSubmitted) setIsSubmitted(false);
                    }}
                    disabled={isSubmitted}
                    placeholder={
                      showHints
                        ? `${originalClean[0]}...`
                        : `(${originalClean.length})`
                    }
                    style={{
                      width: `${Math.max(originalClean.length, 4) * 11 + 24}px`,
                    }}
                    className={`h-9 px-3 text-center text-sm font-semibold bg-slate-955 border rounded-lg focus:outline-none transition-all placeholder-slate-700 ${inputStyle}`}
                  />
                  {isSubmitted && !isCorrect && (
                    <span className="absolute -top-6 text-[10px] text-emerald-400 font-bold bg-slate-955 px-1 py-0.5 rounded border border-slate-850 truncate max-w-fit">
                      {originalClean}
                    </span>
                  )}
                </span>
              );
            } else {
              return (
                <span key={idx} className="text-base sm:text-lg font-semibold text-slate-300">
                  {word}
                </span>
              );
            }
          })}
        </div>

        {/* Translation & Score blocks */}
        <div className="space-y-4">
          {isSubmitted && (
            <div className="p-4 bg-slate-955 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-bold transition-all">
              <span
                className={`px-2.5 py-1 rounded border ${
                  scoreStats.accuracy >= 90
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}
              >
                {text.ACCURACY_LABEL(scoreStats.accuracy)}
              </span>
              <span className="text-slate-400">
                {text.ACCURACY_STATS(scoreStats.correct, scoreStats.total)}
              </span>
            </div>
          )}

          {currentSub.translation && (
            <div className="p-4 bg-slate-955/40 border border-slate-850 rounded-xl space-y-1">
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                {text.TRANSLATION_TITLE}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {currentSub.translation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800/80 mt-auto">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const prev = Math.max(0, selectedSubIndex - 1);
              setSelectedSubIndex(prev);
            }}
            disabled={selectedSubIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-855 hover:bg-slate-800/60 hover:text-slate-202 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {text.PREV_BUTTON}
          </button>
          <button
            onClick={() => {
              const next = Math.min(subtitleCount - 1, selectedSubIndex + 1);
              setSelectedSubIndex(next);
            }}
            disabled={selectedSubIndex === subtitleCount - 1}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-855 hover:bg-slate-800/60 hover:text-slate-202 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {text.NEXT_BUTTON}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-4 py-2 text-xs font-bold text-slate-350 bg-slate-950 hover:bg-slate-900 rounded-xl transition-all border border-slate-850"
          >
            {showHints ? text.HIDE_HINT : text.SHOW_HINT}
          </button>
          <button
            onClick={() => {
              const answers: Record<number, string> = {};
              blankedIndices.forEach((idx) => {
                answers[idx] = cleanWord(wordsList[idx]);
              });
              setUserAnswers(answers);
              handleSubmitGapFill();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-850 hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
          >
            {text.ANSWERS_BUTTON}
          </button>
          <button
            onClick={handleSubmitGapFill}
            disabled={blankedIndices.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-purple-650 hover:bg-purple-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-650/15"
          >
            {text.CHECK_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GapFillExerciseCard;
