import React, { useMemo } from 'react';
import {
  Award, Clock, CheckCircle2, XCircle, RotateCcw, Home,
  Sparkles, TrendingUp, ClipboardList, Type, Link2, BookOpen,
} from 'lucide-react';
import type { TestQuestion, TestSessionAnswer, TestCompletionStats, TestQuestionType } from '../../../types';
import { VOCABULARY_UI_TEXT } from '../../../constants/vocabulary-ui-text';

export interface TestCompletionProps {
  title: string;
  completionStats: TestCompletionStats;
  sessionQuestions: TestQuestion[];
  answers: Record<string, TestSessionAnswer>;
  onRestart: () => void;
  onRestartWrong: () => void;
  onGoHome: () => void;
  onNavigateToFlashcards?: () => void;
}

const TYPE_LABEL: Record<TestQuestionType, string> = {
  mcq: VOCABULARY_UI_TEXT.TEST_SESSION.MCQ,
  'fill-blank': VOCABULARY_UI_TEXT.TEST_SESSION.FILL_BLANK,
  matching: VOCABULARY_UI_TEXT.TEST_SESSION.MATCHING,
};
const TYPE_ICON: Record<TestQuestionType, React.ReactNode> = {
  mcq: <ClipboardList className="w-4 h-4" />,
  'fill-blank': <Type className="w-4 h-4" />,
  matching: <Link2 className="w-4 h-4" />,
};
const TYPE_COLOR: Record<TestQuestionType, string> = {
  mcq: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'fill-blank': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  matching: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

function gradeLabel(accuracy: number): { label: string; color: string; emoji: string } {
  if (accuracy >= 90) return { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.EXCELLENT, color: 'text-emerald-400', emoji: '🏆' };
  if (accuracy >= 75) return { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.GOOD, color: 'text-blue-400', emoji: '⭐' };
  if (accuracy >= 60) return { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.FAIR, color: 'text-amber-400', emoji: '💪' };
  return { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.NEEDS_WORK, color: 'text-red-400', emoji: '📚' };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const TestCompletion: React.FC<TestCompletionProps> = ({
  title,
  completionStats,
  sessionQuestions,
  answers,
  onRestart,
  onRestartWrong,
  onGoHome,
  onNavigateToFlashcards,
}) => {
  const grade = gradeLabel(completionStats.accuracy);

  const radius = 44;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionStats.accuracy / 100) * circumference;

  const wrongQuestions = useMemo(
    () => sessionQuestions.filter((q) => {
      const ans = answers[q.id];
      return !ans || !ans.isCorrect;
    }),
    [sessionQuestions, answers]
  );

  const typesUsed = useMemo(() => {
    const types = new Set(sessionQuestions.map((q) => q.type));
    return Array.from(types) as TestQuestionType[];
  }, [sessionQuestions]);

  return (
    <div className="w-full flex flex-col items-center text-white bg-[#070b15] p-6 sm:p-10 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center gap-8 max-w-2xl w-full z-10">

        {/* Trophy */}
        <div className="relative">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 animate-bounce">
            <Award className="w-10 h-10 text-blue-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500" />
          </span>
        </div>

        {/* Grade Headline */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">{grade.emoji}</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {grade.label}
          </h1>
          <p className="text-slate-400 text-sm max-w-xs">
            {VOCABULARY_UI_TEXT.TEST_COMPLETION.COMPLETED_TITLE} <strong className="text-slate-200">{title}</strong>. {VOCABULARY_UI_TEXT.TEST_COMPLETION.VIEW_ANALYSIS}
          </p>
        </div>

        {/* SVG Circular Accuracy */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle cx="80" cy="80" r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="transparent" />
            <circle
              cx="80" cy="80" r={radius}
              stroke="url(#testGrad)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="testGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-4xl font-black ${grade.color}`}>{completionStats.accuracy}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{VOCABULARY_UI_TEXT.TEST_COMPLETION.ACCURACY}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          {[
            { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.TOTAL_QUESTIONS, value: completionStats.totalQuestions, icon: <ClipboardList className="w-3 h-3 text-slate-500" />, color: 'text-white' },
            { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.CORRECT, value: completionStats.correctCount, icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />, color: 'text-emerald-400' },
            { label: 'Sai', value: completionStats.wrongCount, icon: <XCircle className="w-3 h-3 text-red-400" />, color: 'text-red-400' },
            { label: VOCABULARY_UI_TEXT.TEST_COMPLETION.TIME, value: formatTime(completionStats.totalTimeSeconds), icon: <Clock className="w-3 h-3 text-blue-400" />, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900/50 gap-1">
              <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {s.icon} {s.label}
              </span>
              <span className={`text-lg font-extrabold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Per-type breakdown */}
        {typesUsed.length > 1 && (
          <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> {VOCABULARY_UI_TEXT.TEST_COMPLETION.RESULTS_BY_TYPE}
            </span>
            <div className="flex flex-col gap-2">
              {typesUsed.map((type) => {
                const stat = completionStats.byType[type];
                if (stat.total === 0) return null;
                const acc = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={type} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-bold ${TYPE_COLOR[type]}`}>
                        {TYPE_ICON[type]}
                        {TYPE_LABEL[type]}
                      </span>
                      <span className="text-slate-300 font-bold">{stat.correct}/{stat.total} ({acc}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wrong Questions List */}
        {wrongQuestions.length > 0 && (
          <div className="w-full bg-slate-900/40 border border-red-900/30 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> {VOCABULARY_UI_TEXT.TEST_COMPLETION.NEEDS_REVIEW} ({wrongQuestions.length} {VOCABULARY_UI_TEXT.TEST_COMPLETION.QUESTIONS})
            </span>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {wrongQuestions.map((q) => {
                const word = q.card.item.customWord || q.card.item.wordMinimum?.word || '';
                return (
                  <div key={q.id} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg text-xs gap-3">
                    <div className="flex flex-col gap-0.5 truncate">
                      <span className="font-bold text-red-300 truncate">{word}</span>
                      <span className="text-slate-500 truncate">{q.question}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${TYPE_COLOR[q.type]}`}>
                      {TYPE_LABEL[q.type]}
                    </span>
                  </div>
                );
              })}
            </div>
            {wrongQuestions.length > 0 && (
              <button
                onClick={onRestartWrong}
                className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {VOCABULARY_UI_TEXT.TEST_COMPLETION.PRACTICE_AGAIN_WRONG(wrongQuestions.length)}
              </button>
            )}
          </div>
        )}

        {/* XP & Suggestions */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">
              +{completionStats.correctCount * 15} {VOCABULARY_UI_TEXT.TEST_COMPLETION.XP_EARNED}
            </span>
          </div>

          <span className="text-sm font-semibold text-slate-300"><span role="img" aria-label="idea">💡</span> {VOCABULARY_UI_TEXT.TEST_COMPLETION.NEXT_SUGGESTIONS}</span>
          <div className="grid grid-cols-2 gap-3">
            {onNavigateToFlashcards ? (
              <div
                onClick={onNavigateToFlashcards}
                className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><BookOpen className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">{VOCABULARY_UI_TEXT.TEST_COMPLETION.SUGGESTION_FLASHCARDS}</span>
                  <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.TEST_COMPLETION.SUGGESTION_FLASHCARDS_DESC}</span>
                </div>
              </div>
            ) : (
              <div
                onClick={onRestart}
                className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><RotateCcw className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">{VOCABULARY_UI_TEXT.TEST_COMPLETION.SUGGESTION_RETRY}</span>
                  <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.TEST_COMPLETION.SUGGESTION_RETRY_DESC}</span>
                </div>
              </div>
            )}
            <div
              onClick={onRestart}
              className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><TrendingUp className="w-4 h-4" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">{VOCABULARY_UI_TEXT.TEST_COMPLETION.SUGGESTION_ADVANCED}</span>
                <span className="text-[10px] text-slate-500">{VOCABULARY_UI_TEXT.TEST_COMPLETION.SUGGESTION_ADVANCED_DESC}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold transition-all border border-slate-700/50 cursor-pointer"
          >
            <Home className="w-5 h-5" /> {VOCABULARY_UI_TEXT.TEST_COMPLETION.BACK_TO_OVERVIEW}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> {VOCABULARY_UI_TEXT.TEST_COMPLETION.NEW_TEST}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCompletion;
