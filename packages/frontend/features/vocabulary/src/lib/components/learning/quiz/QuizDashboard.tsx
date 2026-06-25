import React from 'react';
import { Flame, Award, BookOpen, Sparkles } from 'lucide-react';
import { VOCABULARY_UI_TEXT } from '../../../constants/vocabulary-ui-text';

export interface QuizDashboardProps {
  title: string;
  statsDashboard: { total: number; mastered: number; learning: number; newCount: number; difficultCount: number };
  onStartStudyMode: (mode: 'all' | 'difficult' | 'new') => void;
  onGoHome: () => void;
}

export const QuizDashboard: React.FC<QuizDashboardProps> = ({
  title,
  statsDashboard,
  onStartStudyMode,
  onGoHome,
}) => {
  const masteredPercent = statsDashboard.total > 0 
    ? Math.round((statsDashboard.mastered / statsDashboard.total) * 100)
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 text-white bg-[#070b15] p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden select-none z-10">
      {/* Background blurs */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5 relative z-10">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Award className="w-6.5 h-6.5 text-blue-400 animate-pulse" /> {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.PROGRESS_TITLE}
          </h1>
          <p className="text-xs text-slate-400">
            {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.VOCAB_SET} <span className="font-semibold text-slate-200">{title}</span>
          </p>
        </div>
        <button
          onClick={onGoHome}
          className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700/50 transition-all cursor-pointer"
        >
          {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.BACK}
        </button>
      </div>

      {/* Real-time Statistics Dashboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        <div className="flex flex-col p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl justify-between text-left">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.TOTAL_WORDS}</span>
          <span className="text-2xl font-black mt-2 text-slate-100">{statsDashboard.total}</span>
        </div>

        <div className="flex flex-col p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl justify-between text-left">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.MASTERED}</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-400">{statsDashboard.mastered}</span>
            <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{masteredPercent}%</span>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl justify-between text-left">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.LEARNING}</span>
          <span className="text-2xl font-black mt-2 text-blue-400">{statsDashboard.learning}</span>
        </div>

        <div className="flex flex-col p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl justify-between text-left">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.NOT_STARTED}</span>
          <span className="text-2xl font-black mt-2 text-slate-400">{statsDashboard.newCount}</span>
        </div>
      </div>

      {/* Spaced Repetition Due message box */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center gap-3 relative z-10 text-left">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-300">
          {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.ALL_CAUGHT_UP}
        </p>
      </div>

      {/* Premium Study options list */}
      <div className="flex flex-col gap-3.5 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.SELECT_MODE}</span>

        <div className="grid grid-cols-1 gap-3">
          {/* Mode 1: Study All */}
          <button
            onClick={() => onStartStudyMode('all')}
            className="group p-4 bg-slate-900/25 hover:bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 hover:-translate-x-1 w-full text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-sm sm:text-base font-bold text-slate-200">
                  {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.PRACTICE_ALL(statsDashboard.total)}
                </span>
                <span className="text-[11px] text-slate-400">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.PRACTICE_ALL_DESC(statsDashboard.total)}</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Mode 2: Difficult Words */}
          <button
            disabled={statsDashboard.difficultCount === 0}
            onClick={() => onStartStudyMode('difficult')}
            className={`group p-4 rounded-2xl flex items-center justify-between transition-all duration-300 w-full text-white ${
              statsDashboard.difficultCount > 0
                ? 'bg-slate-900/25 hover:bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer hover:-translate-x-1'
                : 'bg-slate-950/20 border-slate-900/50 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border transition-all duration-300 ${
                statsDashboard.difficultCount > 0
                  ? 'bg-amber-600/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white group-hover:border-transparent'
                  : 'bg-slate-900/50 text-slate-650 border-slate-900'
              }`}>
                <Flame className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-sm sm:text-base font-bold text-slate-200">
                  {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.CHALLENGE_WEAK(statsDashboard.difficultCount)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {statsDashboard.difficultCount > 0
                    ? VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.CHALLENGE_WEAK_DESC_HAS
                    : VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.CHALLENGE_WEAK_DESC_EMPTY}
                </span>
              </div>
            </div>
            {statsDashboard.difficultCount > 0 ? (
              <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.CLEARED}</span>
            )}
          </button>

          {/* Mode 3: Learn New Words */}
          <button
            disabled={statsDashboard.newCount === 0}
            onClick={() => onStartStudyMode('new')}
            className={`group p-4 rounded-2xl flex items-center justify-between transition-all duration-300 w-full text-white ${
              statsDashboard.newCount > 0
                ? 'bg-slate-900/25 hover:bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer hover:-translate-x-1'
                : 'bg-slate-950/20 border-slate-900/50 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border transition-all duration-300 ${
                statsDashboard.newCount > 0
                  ? 'bg-purple-600/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white group-hover:border-transparent'
                  : 'bg-slate-900/50 text-slate-650 border-slate-900'
              }`}>
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-sm sm:text-base font-bold text-slate-200">
                  {VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.LEARN_NEW(statsDashboard.newCount)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {statsDashboard.newCount > 0
                    ? VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.LEARN_NEW_DESC_HAS(statsDashboard.newCount)
                    : VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.LEARN_NEW_DESC_EMPTY}
                </span>
              </div>
            </div>
            {statsDashboard.newCount > 0 ? (
              <svg className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{VOCABULARY_UI_TEXT.QUIZ_DASHBOARD.COMPLETED}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
