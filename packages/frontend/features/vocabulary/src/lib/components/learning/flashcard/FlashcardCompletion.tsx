import React from 'react';
import { Flame, RotateCcw, BookOpen, TrendingUp } from 'lucide-react';
import type { FlashcardWord } from '../../../types';
import { VOCABULARY_UI_TEXT } from '../../../constants/vocabulary-ui-text';

export interface FlashcardCompletionProps {
  totalCards: number;
  elapsedTime: string;
  stats: {
    accuracyRate: number;
    avgResponseTime: number;
  };
  userStreak: number;
  sessionCards: FlashcardWord[];
  sessionGrades: { [itemId: string]: number };
  onRestart: () => void;
  onRestartFailedCards: () => void;
  onGoHome: () => void;
  onNavigateToQuiz?: () => void;
  onStartStudyMode: (mode: 'all' | 'difficult' | 'new') => void;
}

export const FlashcardCompletion: React.FC<FlashcardCompletionProps> = ({
  totalCards,
  elapsedTime,
  stats,
  userStreak,
  sessionCards,
  sessionGrades,
  onRestart,
  onRestartFailedCards,
  onGoHome,
  onNavigateToQuiz,
  onStartStudyMode,
}) => {
  const failedCardsList = sessionCards.filter((card) => {
    const grade = sessionGrades[card.item.id];
    return grade === 1;
  });

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[500px] text-white bg-[#070b15] p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center max-w-md w-full text-center z-10 gap-6">
        {/* Trophy Icon with dynamic pulse */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 animate-bounce">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.COMPLETED_TITLE}
          </h1>
          <p className="text-sm text-slate-400">
            {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.COMPLETED_DESC}
          </p>
        </div>

        {/* Stats Box */}
        <div className="grid grid-cols-2 gap-4 w-full bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 my-2 text-left">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.CARD_COUNT}</span>
            <span className="text-2xl font-black text-white">{totalCards} {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.CARD_COUNT_UNIT}</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.STUDY_TIME}</span>
            <span className="text-2xl font-black text-blue-400 font-mono">{elapsedTime}</span>
          </div>
          <div className="flex flex-col gap-1 items-center border-t border-slate-800/50 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.ACCURACY_RATE}</span>
            <span className="text-2xl font-black text-emerald-400">{stats.accuracyRate}%</span>
          </div>
          <div className="flex flex-col gap-1 items-center border-t border-slate-800/50 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.AVG_RESPONSE}</span>
            <span className="text-2xl font-black text-purple-400">{stats.avgResponseTime}s</span>
          </div>
        </div>

        {/* Streak Boost */}
        <div className="flex items-center justify-between w-full p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-amber-500 fill-amber-500 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.CURRENT_STREAK}</p>
              <p className="text-base font-extrabold text-white">{userStreak} {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.STREAK_DAYS}</p>
            </div>
          </div>
        </div>

        {/* Detailed analysis and re-study wrong flashcards */}
        {failedCardsList.length > 0 && (
          <div className="w-full text-left bg-slate-900/40 border border-red-950/30 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.UNMEMORIZED_CARDS(failedCardsList.length)}
            </span>
            
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {failedCardsList.map((card, idx) => {
                const wordText = card.item.customWord || card.item.wordMinimum?.word || card.item.wordDetails?.word || '';
                const definition = card.item.customDefinition || card.item.wordMinimum?.definition || card.item.wordDetails?.definition || '';
                return (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/45 border border-slate-900 rounded-lg text-xs gap-3">
                    <div className="flex flex-col gap-0.5 truncate text-left text-xs">
                      <span className="font-bold text-red-400 text-sm truncate">{wordText}</span>
                      <span className="text-slate-400 truncate max-w-xs">{definition}</span>
                    </div>
                    {card.item.wordDetails?.partOfSpeech && card.item.wordDetails.partOfSpeech !== 'n/a' && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 shrink-0 uppercase">
                        {card.item.wordDetails.partOfSpeech}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={onRestartFailedCards}
              className="mt-1 w-full py-2.5 bg-red-650/10 hover:bg-red-650/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.PRACTICE_AGAIN(failedCardsList.length)}
            </button>
          </div>
        )}

        {/* Gợi ý học tập */}
        <div className="w-full text-left flex flex-col gap-3 mt-2">
          <span className="text-sm font-semibold text-slate-300"><span role="img" aria-label="Gợi ý">💡</span> {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.STUDY_SUGGESTIONS}</span>
          <div className="grid grid-cols-2 gap-3">
            {onNavigateToQuiz && (
              <div
                onClick={onNavigateToQuiz}
                className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.REVIEW_QUIZ}</span>
                  <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.REVIEW_QUIZ_DESC}</span>
                </div>
              </div>
            )}

            <div
              onClick={() => onStartStudyMode('difficult')}
              className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl cursor-pointer transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.ADVANCED_FLASHCARDS}</span>
                <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.ADVANCED_FLASHCARDS_DESC}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 w-full mt-4">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-slate-850 hover:bg-slate-800 text-white rounded-xl font-bold transition-all duration-200 border border-slate-700/50 hover:border-slate-650"
          >
            {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.STUDY_AGAIN}
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            {VOCABULARY_UI_TEXT.FLASHCARD_COMPLETION.BACK_TO_SET}
          </button>
        </div>
      </div>
    </div>
  );
};
