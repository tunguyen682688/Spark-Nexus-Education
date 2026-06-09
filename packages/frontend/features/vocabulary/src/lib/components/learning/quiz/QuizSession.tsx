import React from 'react';
import { Volume2, Flame, Clock, HelpCircle, CheckCircle2, XCircle, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import type { LearningQuizQuestion } from '../../../types';

export interface QuizSessionProps {
  title: string;
  currentQuestion: LearningQuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  isAnswered: boolean;
  score: { correct: number; total: number };
  currentStreak: number;
  elapsedTime: string;
  avgResponseTime: number;
  sessionAnswers: { [questionIndex: number]: { selected: number; correct: number; isCorrect: boolean } };
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onPlayAudio: (e?: React.MouseEvent) => void;
  onChangeStudyMode?: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
  title,
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedOption,
  isAnswered,
  score,
  currentStreak,
  elapsedTime,
  avgResponseTime,
  sessionAnswers,
  onSelectOption,
  onNext,
  onPlayAudio,
  onChangeStudyMode,
}) => {
  const { question, options, correctIndex } = currentQuestion;
  const activeWord = currentQuestion.card.item;

  const totalAnswered = Object.keys(sessionAnswers).length;
  const accuracyRate = totalAnswered > 0
    ? Math.round((Object.values(sessionAnswers).filter(a => a.isCorrect).length / totalAnswered) * 100)
    : 100;

  return (
    <div className="w-full flex flex-col gap-6 text-white bg-[#070b15] p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden select-none">
      {/* BACKGROUND SHADOW BLURS */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HEADER NAVIGATION & PROGRESS */}
      <div className="w-full flex flex-col gap-4 z-10 px-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Luyện tập Trắc nghiệm
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 max-w-[200px] sm:max-w-xs truncate">
                {title}
              </span>
              {onChangeStudyMode && (
                <>
                  <span className="h-3 w-px bg-slate-800" />
                  <button
                    onClick={onChangeStudyMode}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Đổi chế độ
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Clock Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-xs font-semibold text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{elapsedTime}</span>
            </div>

            {/* Pagination count */}
            <div className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              Câu {currentIndex + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* PROGRESS FRACTION BARS */}
        <div className="w-full grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalQuestions}, minmax(0, 1fr))` }}>
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const answer = sessionAnswers[idx];
            let statusClass = 'bg-slate-700';

            if (idx === currentIndex) {
              statusClass = 'bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
            } else if (answer) {
              statusClass = answer.isCorrect 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-red-650';
            }

            return (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${statusClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID (LEFT: QUESTION/CHOICES, RIGHT: STATS SIDEBAR) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 z-10 items-start">
        
        {/* LEFT PANEL: MAIN QUESTION BLOCK & MULTIPLE CHOICE OPTIONS */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          
          {/* 🎴 CORE QUESTION CARD */}
          <div className="w-full shadow-2xl relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/30 to-purple-500/10 hover:from-blue-500/50 hover:to-purple-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

            <div className="relative p-6 sm:p-8 flex flex-col justify-center items-center text-center gap-6 min-h-[220px] bg-[#131a2e] rounded-[calc(1.5rem-1px)]">
              
              <div className="absolute top-4 left-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Định nghĩa
              </div>

              {/* TTS Sound Pronunciation button */}
              <button
                onClick={onPlayAudio}
                className="absolute top-4 right-6 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 flex items-center justify-center cursor-pointer"
                title="Nghe phát âm từ vựng"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Vietnamese definition prompt */}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-relaxed max-w-xl">
                {question}
              </h2>
            </div>
          </div>

          {/* 🔘 FOUR MULTIPLE CHOICE OPTION BUTTONS */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 px-1 text-left">
              Chọn đáp án đúng:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === correctIndex;
                
                let btnClass = 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300';
                let iconEl = null;

                if (isAnswered) {
                  if (isCorrectOption) {
                    btnClass = 'bg-emerald-950/20 border-emerald-500 text-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    iconEl = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
                  } else if (isSelected) {
                    btnClass = 'bg-red-950/20 border-red-500 text-red-400 font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.1)]';
                    iconEl = <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
                  } else {
                    btnClass = 'bg-slate-900/20 border-slate-800/50 text-slate-600 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => onSelectOption(idx)}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-xl border text-left font-semibold transition-all duration-200 group text-base select-none ${btnClass} ${!isAnswered ? 'cursor-pointer hover:bg-slate-900/80 hover:-translate-y-[1px]' : 'cursor-default'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={`flex items-center justify-center w-6.5 h-6.5 rounded-lg text-xs font-black transition-colors ${isAnswered ? (isCorrectOption ? 'bg-emerald-500/20 text-emerald-400' : isSelected ? 'bg-red-500/20 text-red-400' : 'bg-slate-900/50 text-slate-700') : 'bg-slate-800 text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-400'}`}>
                        {idx + 1}
                      </span>
                      <span className="truncate tracking-wide text-lg font-bold">{option}</span>
                    </div>
                    {iconEl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ℹ️ EXPLANATION ACCORDION */}
          {isAnswered && (
            <div className="w-full bg-slate-900/35 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4 animate-[fadeIn_0.3s_ease]">
              <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-200 text-left">Làm rõ Nhận thức Ngữ nghĩa</h3>
              </div>

              <div className="flex flex-col gap-3 text-left">
                <div>
                  <span className="text-lg font-extrabold text-blue-400 mr-2">
                    {options[correctIndex]}
                  </span>
                  {activeWord.wordDetails?.partOfSpeech && (
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      {activeWord.wordDetails.partOfSpeech}
                    </span>
                  )}
                  {activeWord.wordDetails?.pronunciation && (
                    <span className="text-xs font-medium text-slate-400 ml-2 italic">
                      /{activeWord.wordDetails.pronunciation}/
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  {activeWord.customDefinition || activeWord.wordMinimum?.definition || activeWord.wordDetails?.definition}
                </p>

                {(activeWord.customExample || activeWord.wordMinimum?.example || activeWord.wordDetails?.example) && (
                  <div className="mt-2 pl-3 border-l-2 border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ví dụ:</span>
                    <p className="text-slate-400 text-xs italic leading-relaxed">
                      "{activeWord.customExample || activeWord.wordMinimum?.example || activeWord.wordDetails?.example}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                    <span className="text-[10px] font-bold text-blue-400 tracking-wider block uppercase mb-1">
                      {options[correctIndex].toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Sử dụng khi nói về cam kết vững chắc, tuân thủ đúng luật lệ, nguyên tắc hoặc quyết định đã đưa ra.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                    <span className="text-[10px] font-bold text-purple-400 tracking-wider block uppercase mb-1">
                      COMPLY WITH
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Mang tính chất kỹ thuật hoặc hệ thống, thường đề cập tới việc đáp ứng các quy chuẩn công nghiệp, tiêu chuẩn ngành.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: SESSION STATS SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-4 w-full text-left">
          
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
            Thông tin phiên học
          </span>

          <div className="flex flex-col gap-3 bg-slate-900/20 border border-slate-850/80 rounded-xl p-4 w-full">
            {/* Accuracy card */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tỷ lệ chính xác</span>
                <span className="text-xl font-black text-slate-100 flex items-baseline gap-1 mt-0.5">
                  {accuracyRate}%
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +2%
                  </span>
                </span>
              </div>
            </div>

            {/* Average Response Time card */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tần suất TB</span>
                <span className="text-xl font-black text-slate-100 mt-0.5">
                  {avgResponseTime}s
                  <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded ml-1.5 uppercase font-sans">
                    Nhanh!
                  </span>
                </span>
              </div>
            </div>

            {/* Streak card */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đúng liên tiếp</span>
                <span className="text-xl font-black text-slate-100 mt-0.5 flex items-baseline gap-1">
                  {currentStreak}
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">câu</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOOTER FEEDBACK ACTION BAR */}
      {isAnswered && (
        <div className={`fixed bottom-0 left-0 w-full p-4 sm:p-5 flex items-center justify-between border-t z-50 animate-[slideUp_0.2s_ease-out] ${selectedOption === correctIndex ? 'bg-emerald-950/90 backdrop-blur border-emerald-900/50' : 'bg-red-950/90 backdrop-blur border-red-900/50'}`}>
          <div className="max-w-4xl mx-auto flex flex-row items-center justify-between w-full gap-4 px-2 sm:px-6">
            
            <div className="flex items-center gap-3">
              {selectedOption === correctIndex ? (
                <>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-emerald-400 font-bold text-sm sm:text-base">
                    Chính xác! Tiếp tục phát huy nhé.
                  </span>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <span className="text-red-400 font-bold text-sm sm:text-base">
                    Chưa chính xác! Hãy ôn tập lại kiến thức nhé.
                  </span>
                </>
              )}
            </div>

            {/* Next question trigger */}
            <button
              onClick={onNext}
              className={`flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl font-extrabold text-sm transition-all duration-200 cursor-pointer ${selectedOption === correctIndex ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'}`}
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
