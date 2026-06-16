import React, { useMemo } from 'react';
import { Award, Clock, Sparkles, BookOpen, TrendingUp, AlertCircle, RotateCcw, Home } from 'lucide-react';
import type { LearningQuizQuestion } from '../../../types';
import { VOCABULARY_UI_TEXT } from '../../../constants/vocabulary-ui-text';

export interface QuizCompletionProps {
  title: string;
  elapsedTime: string;
  avgResponseTime: number;
  score: { correct: number; total: number };
  sessionQuestions: LearningQuizQuestion[];
  sessionAnswers: { [questionIndex: number]: { selected: number; correct: number; isCorrect: boolean } };
  onRestart: () => void;
  onRestartFailedQuestions?: () => void;
  onGoHome: () => void;
  onNavigateToFlashcards?: () => void;
  onStartStudyMode: (mode: 'all' | 'difficult' | 'new') => void;
}

export const QuizCompletion: React.FC<QuizCompletionProps> = ({
  title,
  elapsedTime,
  avgResponseTime,
  score,
  sessionQuestions,
  sessionAnswers,
  onRestart,
  onRestartFailedQuestions,
  onGoHome,
  onNavigateToFlashcards,
  onStartStudyMode,
}) => {
  const totalCorrect = score.correct;
  const totalXP = totalCorrect * 10;

  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  const finalAccuracy = useMemo(() => {
    if (sessionQuestions.length === 0) return 0;
    return Math.round((totalCorrect / sessionQuestions.length) * 100);
  }, [sessionQuestions.length, totalCorrect]);

  const strokeDashoffset = circumference - (finalAccuracy / 100) * circumference;

  const failedQuestionsList = useMemo(() => {
    return sessionQuestions.filter((q, idx) => {
      const ans = sessionAnswers[idx];
      return ans && !ans.isCorrect;
    });
  }, [sessionQuestions, sessionAnswers]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[600px] text-white bg-[#070b15] p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center max-w-lg w-full text-center z-10 gap-8">
        {/* Trophy Header */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2 animate-bounce">
          <Award className="w-10 h-10" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.COMPLETED_TITLE}
          </h1>
          <p className="text-sm text-slate-400">
            {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.COMPLETED_DESC}
          </p>
        </div>

        <div className="relative flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="opacity-50"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#accuracyGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black tracking-tight text-white">{finalAccuracy}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{VOCABULARY_UI_TEXT.QUIZ_COMPLETION.ACCURACY}</span>
          </div>
        </div>

        {/* Detailed Statistics Grid */}
        <div className="grid grid-cols-4 gap-3 w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-left">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/50">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" /> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.TIME}
            </span>
            <span className="text-sm font-extrabold text-white">{elapsedTime}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/50">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-emerald-400" /> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.CORRECT}
            </span>
            <span className="text-sm font-extrabold text-white">{totalCorrect}/{sessionQuestions.length}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/50">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> XP
            </span>
            <span className="text-sm font-extrabold text-amber-400">+{totalXP}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/50">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-400" /> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.NEW_WORDS}
            </span>
            <span className="text-sm font-extrabold text-white">
              {sessionQuestions.filter(q => !q.card.progress || q.card.progress.status === 'NEW').length}
            </span>
          </div>
        </div>

        {/* Mastered Levels Breakdown */}
        <div className="w-full text-left bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
          <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.MASTERY_ANALYSIS}
          </span>
          <div className="flex flex-col gap-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{VOCABULARY_UI_TEXT.QUIZ_COMPLETION.SESSION_ACCURACY}</span>
                <span className="font-semibold text-slate-200">{finalAccuracy}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-880 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${finalAccuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed analysis and re-study wrong questions */}
        {failedQuestionsList.length > 0 && (
          <div className="w-full text-left bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.CORRECTED_WORDS(failedQuestionsList.length)}
            </span>
            
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {failedQuestionsList.map((q, idx) => {
                const correctWord = q.options[q.correctIndex];
                const definition = q.card.item.customDefinition || q.card.item.wordMinimum?.definition || q.card.item.wordDetails?.definition || '';
                return (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/45 border border-slate-900 rounded-lg text-xs gap-3">
                    <div className="flex flex-col gap-0.5 truncate text-left text-xs">
                      <span className="font-bold text-emerald-400 text-sm truncate">{correctWord}</span>
                      <span className="text-slate-400 truncate max-w-xs">{definition}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                        {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.CORRECTED}
                      </span>
                      {q.card.item.wordDetails?.partOfSpeech && q.card.item.wordDetails.partOfSpeech !== 'n/a' && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 uppercase">
                          {q.card.item.wordDetails.partOfSpeech}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {onRestartFailedQuestions && (
              <button
                onClick={onRestartFailedQuestions}
                className="mt-1 w-full py-2.5 bg-emerald-650/10 hover:bg-emerald-650/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.PRACTICE_AGAIN(failedQuestionsList.length)}
              </button>
            )}
          </div>
        )}

        {/* recommendations and suggestions */}
        <div className="w-full text-left flex flex-col gap-3">
          <span className="text-sm font-semibold text-slate-300"><span role="img" aria-label="Lightbulb">💡</span> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.STUDY_SUGGESTIONS}</span>
          <div className="grid grid-cols-2 gap-3">
            {onNavigateToFlashcards ? (
              <div
                onClick={onNavigateToFlashcards}
                className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200">Review Flashcards</span>
                  <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.QUIZ_COMPLETION.FOCUS_UNMEMORIZED}</span>
                </div>
              </div>
            ) : (
              <div
                onClick={onRestart}
                className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200">Review Flashcards</span>
                  <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.QUIZ_COMPLETION.FOCUS_UNMEMORIZED}</span>
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
                <span className="text-xs font-bold text-slate-200">Advanced Quiz</span>
                <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.QUIZ_COMPLETION.ADVANCED_QUIZ_DESC}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full pt-2">
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold transition-all duration-200 border border-slate-700/50 cursor-pointer"
          >
            <Home className="w-5 h-5" /> {VOCABULARY_UI_TEXT.TEST_COMPLETION.BACK_TO_OVERVIEW}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> {VOCABULARY_UI_TEXT.QUIZ_COMPLETION.CONTINUE_PRACTICE}
          </button>
        </div>
      </div>
    </div>
  );
};
