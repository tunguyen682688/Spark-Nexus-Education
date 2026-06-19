import React, { useEffect, useRef, useState } from 'react';
import {
  Clock, CheckCircle2, XCircle, SkipForward, ArrowRight,
  Type, ClipboardList, Link2, AlertTriangle, Volume2,
} from 'lucide-react';
import type { TestQuestion, TestSessionAnswer } from '../../../types';
import { VOCABULARY_UI_TEXT } from '../../../constants/vocabulary-ui-text';

export interface TestSessionProps {
  title: string;
  currentQuestion: TestQuestion;
  currentIndex: number;
  totalQuestions: number;
  elapsedTime: string;
  remainingTime: string | null;
  isTimeUp: boolean;
  isAnswered: boolean;
  selectedOption: number | null;
  fillInput: string;
  matchSelections: Record<string, string>;
  score: { correct: number; total: number };
  answers: Record<string, TestSessionAnswer>;

  onSelectMCQ: (index: number) => void;
  onUpdateFill: (value: string) => void;
  onSubmitFill: () => void;
  onSetMatch: (left: string, right: string) => void;
  onSubmitMatch: () => void;
  onSkip: () => void;
  onNext: () => void;
  onSubmitExam: () => void;
  onPlayAudio?: (e?: React.MouseEvent) => void;
}

const TYPE_ICON = {
  'mcq': <ClipboardList className="w-3.5 h-3.5" />,
  'fill-blank': <Type className="w-3.5 h-3.5" />,
  'matching': <Link2 className="w-3.5 h-3.5" />,
};
const TYPE_LABEL = { 'mcq': VOCABULARY_UI_TEXT.TEST_SESSION.MCQ, 'fill-blank': VOCABULARY_UI_TEXT.TEST_SESSION.FILL_BLANK, 'matching': VOCABULARY_UI_TEXT.TEST_SESSION.MATCHING };

export const TestSession: React.FC<TestSessionProps> = ({
  title,
  currentQuestion,
  currentIndex,
  totalQuestions,
  elapsedTime,
  remainingTime,
  isTimeUp,
  isAnswered,
  selectedOption,
  fillInput,
  matchSelections,
  score,
  answers,
  onSelectMCQ,
  onUpdateFill,
  onSubmitFill,
  onSetMatch,
  onSubmitMatch,
  onSkip,
  onNext,
  onSubmitExam,
  onPlayAudio,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [availableRights, setAvailableRights] = useState<string[]>([]);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Shuffle matching right column once per question
  useEffect(() => {
    if (currentQuestion.type === 'matching' && currentQuestion.matchPairs) {
      const rights = [...currentQuestion.matchPairs.map((p) => p.right)].sort(
        () => Math.random() - 0.5
      );
      setAvailableRights(rights);
    }
  }, [currentQuestion.id, currentQuestion.type, currentQuestion.matchPairs]);

  // Auto-focus fill-in input
  useEffect(() => {
    if (currentQuestion.type === 'fill-blank' && !isAnswered) {
      inputRef.current?.focus();
    }
  }, [currentQuestion.id, currentQuestion.type, isAnswered]);

  const word = currentQuestion.card.item.customWord || currentQuestion.card.item.wordMinimum?.word || '';
  const pronunciation = currentQuestion.card.item.wordMinimum?.pronunciation || currentQuestion.card.item.wordDetails?.pronunciation || '';

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  // Render section per question type
  const renderQuestionContent = () => {
    if (currentQuestion.type === 'mcq') {
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(currentQuestion.options ?? []).map((option, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300';
              if (isSelected) btnClass = 'bg-blue-950/30 border-blue-500 text-blue-300 font-bold shadow-[0_0_12px_rgba(59,130,246,0.1)]';
              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => onSelectMCQ(idx)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${btnClass} ${!isAnswered ? 'hover:-translate-y-[1px]' : 'cursor-default'}`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black shrink-0 ${
                    isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'
                  }`}>{String.fromCharCode(65 + idx)}</span>
                  <span className="truncate">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentQuestion.type === 'fill-blank') {
      return (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {VOCABULARY_UI_TEXT.TEST_SESSION.ENTER_ENGLISH}
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={fillInput}
                disabled={isAnswered}
                onChange={(e) => onUpdateFill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswered && fillInput.trim()) {
                    onSubmitFill();
                  }
                }}
                placeholder={VOCABULARY_UI_TEXT.TEST_SESSION.TYPE_ANSWER_PLACEHOLDER}
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700/60 rounded-xl text-white placeholder-slate-600 font-semibold text-base focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-60"
              />
              {!isAnswered && (
                <button
                  onClick={onSubmitFill}
                  disabled={!fillInput.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  {VOCABULARY_UI_TEXT.TEST_SESSION.CONFIRM}
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 italic">
            {VOCABULARY_UI_TEXT.TEST_SESSION.HINT_FIRST_LETTER} "<span className="text-slate-400 font-bold">{word.charAt(0).toUpperCase()}</span>"
            {pronunciation && <> &nbsp;·&nbsp; {VOCABULARY_UI_TEXT.TEST_SESSION.PRONUNCIATION_HINT} <span className="text-slate-400">/{pronunciation}/</span></>}
          </p>
        </div>
      );
    }

    if (currentQuestion.type === 'matching') {
      const pairs = currentQuestion.matchPairs ?? [];
      return (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-xs text-slate-500 font-semibold">
            {VOCABULARY_UI_TEXT.TEST_SESSION.CHOOSE_DEFINITION}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {pairs.map((pair) => {
              const selected = matchSelections[pair.left];
              return (
                <div key={pair.left} className="flex gap-3 items-center">
                  <div className="px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm font-bold text-blue-300 min-w-[120px] text-center shrink-0">
                    {pair.left}
                  </div>
                  <div className="text-slate-600 font-bold shrink-0">→</div>
                  <select
                    disabled={isAnswered}
                    value={selected ?? ''}
                    onChange={(e) => onSetMatch(pair.left, e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-900/50 border border-slate-700/60 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500/60 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <option value="" disabled>{VOCABULARY_UI_TEXT.TEST_SESSION.SELECT_MEANING}</option>
                    {availableRights.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          {!isAnswered && (
            <button
              onClick={onSubmitMatch}
              disabled={Object.keys(matchSelections).length < pairs.length}
              className="mt-1 w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              {VOCABULARY_UI_TEXT.TEST_SESSION.CONFIRM_MATCHING}
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  // Show result feedback only in answered state (exam mode: no correct reveal during session)
  const renderAnswerFeedback = () => {
    if (!isAnswered) return null;
    const ans = answers[currentQuestion.id];
    if (!ans) return null;
    const isCorrect = ans.isCorrect;
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl border animate-[fadeIn_0.2s_ease] text-sm font-semibold ${
        isCorrect
          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
          : 'bg-red-950/30 border-red-800/40 text-red-400'
      }`}>
        {isCorrect
          ? <CheckCircle2 className="w-5 h-5 shrink-0" />
          : <XCircle className="w-5 h-5 shrink-0" />}
        <span>{isCorrect ? VOCABULARY_UI_TEXT.TEST_SESSION.CORRECT_ANSWER : VOCABULARY_UI_TEXT.TEST_SESSION.INCORRECT_ANSWER}</span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white bg-[#070b15] p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden select-none">
      {/* Background glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Time Up Overlay */}
      {isTimeUp && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#070b15]/95 rounded-2xl gap-4">
          <AlertTriangle className="w-12 h-12 text-amber-400" />
          <h2 className="text-2xl font-extrabold text-white">{VOCABULARY_UI_TEXT.TEST_SESSION.TIME_UP}</h2>
          <p className="text-slate-400 text-sm">{VOCABULARY_UI_TEXT.TEST_SESSION.TEST_ENDED}</p>
          <button
            onClick={onSubmitExam}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl cursor-pointer transition-all"
          >
            {VOCABULARY_UI_TEXT.TEST_SESSION.VIEW_RESULTS}
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest truncate max-w-[200px]">{title}</span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
              {TYPE_ICON[currentQuestion.type]}
              {TYPE_LABEL[currentQuestion.type]}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {VOCABULARY_UI_TEXT.TEST_SESSION.QUESTION} {currentIndex + 1} / {totalQuestions}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-xs font-semibold text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{elapsedTime}</span>
          </div>
          {/* Countdown */}
          {remainingTime !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors ${
              parseInt(remainingTime.replace(':', '')) < 100
                ? 'bg-red-950/30 border-red-800/50 text-red-400 animate-pulse'
                : 'bg-amber-950/20 border-amber-800/40 text-amber-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{remainingTime}</span>
            </div>
          )}
          {/* Score badge */}
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            {score.correct}/{score.total} {VOCABULARY_UI_TEXT.TEST_SESSION.CORRECT_COUNT}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="w-full z-10 bg-[#0d1425] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-inner">
        {/* Question Prompt */}
        <div className="flex flex-col gap-3 items-center text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
            {currentQuestion.type === 'mcq' && VOCABULARY_UI_TEXT.TEST_SESSION.CHOOSE_WORD_FOR_DEF}
            {currentQuestion.type === 'fill-blank' && VOCABULARY_UI_TEXT.TEST_SESSION.DEFINITION}
            {currentQuestion.type === 'matching' && ''}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-relaxed max-w-2xl">
            {currentQuestion.question}
          </h2>
          {/* Audio button */}
          {onPlayAudio && (
            <button
              onClick={onPlayAudio}
              className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 transition-all duration-200 cursor-pointer"
              title={VOCABULARY_UI_TEXT.TEST_SESSION.HEAR_PRONUNCIATION}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Answer Area */}
        {renderQuestionContent()}

        {/* Feedback */}
        {renderAnswerFeedback()}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-4 z-10">
        <button
          onClick={onSkip}
          disabled={isAnswered}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 text-sm font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          {VOCABULARY_UI_TEXT.TEST_SESSION.SKIP}
        </button>

        {isAnswered && (
          isLastQuestion ? (
            <button
              onClick={onSubmitExam}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {VOCABULARY_UI_TEXT.TEST_SESSION.SUBMIT_AND_VIEW}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {VOCABULARY_UI_TEXT.TEST_SESSION.NEXT_QUESTION}
              <ArrowRight className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TestSession;
