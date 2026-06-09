import { FC } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  Timer,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Bookmark,
} from 'lucide-react';
import { Button, Input } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { useGrammarAssessmentQuiz } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';
import { DiagnosticRadarChart } from '../components';

interface GrammarAssessmentQuizContainerProps {
  lessonTitle: string;
  lessonId: string;
  onFinish: (proficiency: number, xpEarned: number) => void;
  onBack: () => void;
}

export const GrammarAssessmentQuizContainer: FC<
  GrammarAssessmentQuizContainerProps
> = ({ lessonTitle, lessonId, onFinish, onBack }) => {
  const {
    isLoading,
    questions,
    activeQuestions,
    currentIdx,
    currentQuestion,
    selectedOpt,
    selectedWords,
    selectedErrorWord,
    correctedText,
    isAnswered,
    isCorrect,
    score,
    isCompleted,
    wrongQuestionIds,
    timeLeft,
    showRecoveryModal,
    recoveryData,
    savedTrapIds,
    setCorrectedText,
    handleSelectOption,
    handleWordClick,
    handleRemoveWord,
    handleClearWords,
    handleCheckSentenceBuilder,
    handleSelectErrorWord,
    handleCheckErrorSpotlight,
    handleNext,
    resetQuiz,
    retryMistakes,
    handleSaveTrap,
    handleRecover,
    handleDiscard,
  } = useGrammarAssessmentQuiz({ lessonId });

  if (isLoading || activeQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-[#070a14] border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wider animate-pulse">
          {GRAMMAR_UI_TEXT.assessmentQuiz.loading}
        </p>
      </div>
    );
  }

  const proficiency = Math.round((score / activeQuestions.length) * 100) || 0;
  const xpEarned = score * 30;

  // Format time
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  let medalIcon = '🥉';
  let medalName = GRAMMAR_UI_TEXT.assessmentQuiz.bronzeMedal;
  let medalColor = 'text-amber-700 bg-amber-500/10 border-amber-600/20';

  if (proficiency >= 90) {
    medalIcon = '💎';
    medalName = GRAMMAR_UI_TEXT.assessmentQuiz.diamondMedal;
    medalColor =
      'text-cyan-400 bg-cyan-500/10 border-cyan-400/20 shadow-cyan-500/10';
  } else if (proficiency >= 80) {
    medalIcon = '🥇';
    medalName = GRAMMAR_UI_TEXT.assessmentQuiz.goldMedal;
    medalColor = 'text-amber-400 bg-amber-500/10 border-amber-400/20';
  } else if (proficiency >= 70) {
    medalIcon = '🥈';
    medalName = GRAMMAR_UI_TEXT.assessmentQuiz.silverMedal;
    medalColor = 'text-slate-350 bg-slate-500/10 border-slate-400/20';
  }

  const syntaxQuestions = activeQuestions.filter(
    (q) => q.category === 'syntax'
  );
  const tensesQuestions = activeQuestions.filter(
    (q) => q.category === 'tenses'
  );
  const morphologyQuestions = activeQuestions.filter(
    (q) => q.category === 'morphology'
  );
  const modalityQuestions = activeQuestions.filter(
    (q) => q.category === 'modality'
  );

  const correctSyntax = syntaxQuestions.filter(
    (q) => !wrongQuestionIds.includes(q.id)
  ).length;
  const correctTenses = tensesQuestions.filter(
    (q) => !wrongQuestionIds.includes(q.id)
  ).length;
  const correctMorphology = morphologyQuestions.filter(
    (q) => !wrongQuestionIds.includes(q.id)
  ).length;
  const correctModality = modalityQuestions.filter(
    (q) => !wrongQuestionIds.includes(q.id)
  ).length;

  const skillFactors = {
    syntax:
      syntaxQuestions.length > 0
        ? Math.max(0.3, correctSyntax / syntaxQuestions.length)
        : 0.8,
    tenses:
      tensesQuestions.length > 0
        ? Math.max(0.3, correctTenses / tensesQuestions.length)
        : 0.8,
    morphology:
      morphologyQuestions.length > 0
        ? Math.max(0.3, correctMorphology / morphologyQuestions.length)
        : 0.8,
    modality:
      modalityQuestions.length > 0
        ? Math.max(0.3, correctModality / modalityQuestions.length)
        : 0.8,
  };

  // Xác định các kỹ năng bị yếu (< 80%)
  const weakSkills: string[] = [];
  if (skillFactors.syntax < 0.8) weakSkills.push('Cú pháp (Syntax)');
  if (skillFactors.tenses < 0.8) weakSkills.push('Thì & Thể (Tense & Aspect)');
  if (skillFactors.morphology < 0.8) weakSkills.push('Hình thái (Morphology)');
  if (skillFactors.modality < 0.8) weakSkills.push('Sắc thái (Modality)');

  if (isCompleted) {
    return (
      <div className="max-w h-full mx-auto bg-[#070a14] border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left panel: Stats & Reward Card */}
          <div className="flex-1 space-y-6 text-center lg:text-left w-full">
            <div className="space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.quizTitle}
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  • {lessonTitle}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {GRAMMAR_UI_TEXT.assessmentQuiz.completedTitle}
              </h2>
            </div>

            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${medalColor} shadow-lg transition-all`}
            >
              <div className="text-4xl sm:text-5xl animate-bounce">
                {medalIcon}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.awardLabel}
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {medalName}
                </h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.awardDesc.split('**{proficiency}%**')[0]}
                  <strong>{proficiency}%</strong>
                  {GRAMMAR_UI_TEXT.assessmentQuiz.awardDesc.split('**{proficiency}%**')[1]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#0c1020]/45 border border-slate-900 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.xpBonus}
                </span>
                <span className="text-base font-black text-blue-400">
                  +{xpEarned} XP
                </span>
              </div>
              <div className="bg-[#0c1020]/45 border border-slate-900 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.lessonState}
                </span>
                <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {proficiency >= 80 ? 'MASTERED' : 'NEEDS REVIEW'}
                </span>
              </div>
            </div>

            {/* Diagnostic Card */}
            {weakSkills.length > 0 ? (
              <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-950/20 text-left space-y-2 animate-fadeIn">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                  <span role="img" aria-label="idea">
                    💡
                  </span>{' '}
                  Phân Tích Năng Lực & Đề Xuất Ôn Tập
                </span>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  Hệ thống phân tích bạn cần củng cố thêm về:{' '}
                  <span className="text-blue-300 font-extrabold">
                    {weakSkills.join(', ')}
                  </span>
                  . Hãy xem lại lý thuyết của các bài liên quan trên lộ trình!
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 text-left space-y-2 animate-fadeIn">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                  <span role="img" aria-label="sparkles">
                    ✨
                  </span>{' '}
                  Làm Chủ Ngữ Pháp Tuyệt Đối!
                </span>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  Tuyệt hảo! Bạn đã nắm vững toàn bộ các cấu trúc ngữ pháp và
                  sắc thái trong bài học này!
                </p>
              </div>
            )}

            {/* Actions panel */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => onFinish(proficiency, xpEarned)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
              >
                <Home className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnBackToRoadmap}
              </Button>
              {wrongQuestionIds.length > 0 ? (
                <Button
                  onClick={retryMistakes}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-xl border-none shadow-lg shadow-rose-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
                >
                  <AlertTriangle className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnRetryMistakes}
                </Button>
              ) : (
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  className="border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnPracticeMore}
                </Button>
              )}
            </div>

            {/* Detailed Wrong Answers */}
            {wrongQuestionIds.length > 0 && (
              <div className="mt-8 space-y-4 text-left w-full animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.detailedMistakes.replace('{count}', wrongQuestionIds.length.toString())}
                </h3>
                <div className="space-y-4">
                  {wrongQuestionIds.map((qId) => {
                    const q = questions.find(
                      (x) => x.id === qId
                    );
                    if (!q) return null;
                    return (
                      <div
                        key={q.id}
                        className="bg-[#0b1022]/80 border border-rose-500/20 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm font-bold text-white leading-relaxed">
                            {q.type === 'ERROR_SPOTLIGHT' ? q.sentence : q.text}
                          </p>
                          <Button
                            onClick={() => handleSaveTrap(q)}
                            disabled={savedTrapIds.includes(q.id)}
                            className="bg-[#0f1428] border border-slate-850 hover:border-slate-750 text-[9px] font-black text-rose-400 hover:text-rose-350 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer transition active:scale-95 flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 disabled:text-slate-500 disabled:border-slate-900 disabled:cursor-default"
                          >
                            <Bookmark className="h-3 w-3" />
                            {savedTrapIds.includes(q.id)
                              ? GRAMMAR_UI_TEXT.assessmentQuiz.btnSaved
                              : GRAMMAR_UI_TEXT.assessmentQuiz.btnSave}
                          </Button>
                        </div>
                        <p className="text-xs text-emerald-400 font-bold">
                          {GRAMMAR_UI_TEXT.assessmentQuiz.correctAnswerLabel}{' '}
                          <span className="text-emerald-300">{q.answer}</span>
                        </p>
                        <div className="bg-blue-500/10 p-3 rounded-lg mt-2 border border-blue-500/20">
                          <span className="text-[10px] font-black text-blue-400 uppercase block mb-1">
                            {GRAMMAR_UI_TEXT.assessmentQuiz.explanationLabel}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Custom SVG Radar Chart */}
          <div className="w-64 h-64 bg-[#0c1020]/30 border border-slate-900/80 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 relative shadow-inner lg:sticky lg:top-6">
            <span className="text-[9px] font-extrabold text-slate-500 tracking-wider uppercase block">
              {GRAMMAR_UI_TEXT.assessmentQuiz.abilityChart}
            </span>
            <div className="relative h-44 w-44">
              <DiagnosticRadarChart skillFactors={skillFactors} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (currentIdx / activeQuestions.length) * 100;
  const qType = currentQuestion.type || 'MULTIPLE_CHOICE';

  return (
    <div className="max-w-2xl mx-auto bg-[#070a14] border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0c1020] border border-slate-850 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border-none"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
          {GRAMMAR_UI_TEXT.assessmentQuiz.headerAssessment}
        </span>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border transition-colors ${
            timeLeft <= 60
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          <Timer className="h-4 w-4" />
          <span className="w-9 text-center font-mono">{formattedTime}</span>
        </div>
      </div>

      {/* Quest HUD & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 tracking-wider">
          <span>
            {wrongQuestionIds.length > 0
              ? 'RETRY MISTAKES'
              : 'SUMMARY ASSESSMENT'}
          </span>
          <span className="text-blue-400">
            {GRAMMAR_UI_TEXT.assessmentQuiz.questionProgress
              .replace('{current}', (currentIdx + 1).toString())
              .replace('{total}', activeQuestions.length.toString())}
          </span>
        </div>
        <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question panel */}
      <div className="space-y-5">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-950/40 rounded border border-indigo-950">
            {qType === 'SENTENCE_BUILDER'
              ? 'Sentence Rebuilder 🧩'
              : qType === 'ERROR_SPOTLIGHT'
              ? 'Error Spotlight 🔍'
              : 'Multiple Choice 📝'}
          </span>
          <h3 className="text-base font-bold text-white leading-relaxed pt-2">
            {currentQuestion.text}
          </h3>
        </div>

        {/* 1. RENDER TRẮC NGHIỆM TRUYỀN THỐNG */}
        {qType === 'MULTIPLE_CHOICE' && currentQuestion.options && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOpt === opt;
              const isCorrectAnswer = opt === currentQuestion.answer;
              const hasChecked = isAnswered;

              let cardStyles =
                'bg-card/45 border-border hover:border-slate-700 text-slate-200';
              let animationStyles = '';

              if (hasChecked) {
                if (isCorrectAnswer) {
                  cardStyles =
                    'bg-emerald-500/10 border-emerald-500/35 text-emerald-450';
                  if (isSelected)
                    animationStyles =
                      'shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.01]';
                } else if (isSelected) {
                  cardStyles =
                    'bg-rose-500/10 border-rose-500/35 text-rose-450';
                  animationStyles = 'animate-[shake_0.4s_ease-in-out]';
                } else {
                  cardStyles =
                    'bg-card/20 border-border text-slate-550 opacity-40';
                }
              } else if (isSelected) {
                cardStyles = 'bg-blue-600/15 border-blue-500/50 text-blue-450';
              }

              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "w-full text-left rounded-2xl border px-5 py-4 text-sm font-bold flex items-center justify-between transition-all group",
                    !isAnswered
                      ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                      : 'cursor-default',
                    cardStyles,
                    animationStyles
                  )}
                >
                  <span>{opt}</span>
                  {hasChecked && isCorrectAnswer && (
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                  )}
                  {hasChecked && isSelected && !isCorrectAnswer && (
                    <XCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. RENDER SẮP XẾP CÂU (SENTENCE REBUILDER) */}
        {qType === 'SENTENCE_BUILDER' && currentQuestion.words && (
          <div className="space-y-4">
            {/* Khay hiển thị từ đã chọn */}
            <div
              className={`min-h-[64px] p-4 bg-[#0c1020]/45 border rounded-2xl flex flex-wrap gap-2 items-center transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500/35 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'border-rose-500/35 bg-rose-500/5 animate-[shake_0.4s_ease-in-out]'
                  : 'border-slate-850'
              }`}
            >
              {selectedWords.length === 0 ? (
                <span className="text-xs font-medium text-slate-500">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.clickWordToBuild}
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    disabled={isAnswered}
                    onClick={() => handleRemoveWord(idx)}
                    className={`bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-950 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      !isAnswered
                        ? 'cursor-pointer hover:scale-105 active:scale-95'
                        : 'cursor-default'
                    }`}
                  >
                    {word}{' '}
                    {!isAnswered && <X className="h-3 w-3 text-indigo-400" />}
                  </button>
                ))
              )}
            </div>

            {/* Các công cụ Clear / Reset */}
            {!isAnswered && selectedWords.length > 0 && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClearWords}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-850 flex items-center gap-1 cursor-pointer transition"
                >
                  <RefreshCw className="h-3 w-3" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnClearAll}
                </button>
              </div>
            )}

            {/* Khay hiển thị các từ sẵn có để chọn */}
            {!isAnswered && (
              <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.wordPool}
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.words.map((word, idx) => {
                    // Đếm số lần từ này xuất hiện trong câu để cho phép chọn từ trùng lặp
                    const countInSelected = selectedWords.filter(
                      (w) => w === word
                    ).length;
                    const countInOriginal =
                      currentQuestion.words?.filter((w) => w === word).length ||
                      0;
                    const isUsedUp = countInSelected >= countInOriginal;

                    return (
                      <button
                        key={`${word}-avail-${idx}`}
                        disabled={isUsedUp}
                        onClick={() => handleWordClick(word)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl transition ${
                          isUsedUp
                            ? 'bg-slate-950 text-slate-700 border border-slate-900 opacity-25 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-slate-200 cursor-pointer hover:scale-105 active:scale-95'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nút check câu ghép */}
            {!isAnswered && selectedWords.length > 0 && (
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleCheckSentenceBuilder}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-550 hover:to-indigo-550 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl border-none shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer transition active:scale-95 uppercase tracking-wider"
                >
                  <Check className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnCheckSentence}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 3. RENDER TÌM LỖI SAI (ERROR SPOTLIGHT) */}
        {qType === 'ERROR_SPOTLIGHT' && currentQuestion.sentence && (
          <div className="space-y-4">
            {/* Câu hiển thị dạng các từ click được */}
            <div className="bg-[#0c1020]/45 border border-slate-850 rounded-2xl p-6 text-center space-y-4">
              <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">
                {GRAMMAR_UI_TEXT.assessmentQuiz.clickErrorWord}
              </span>

              <div className="flex flex-wrap justify-center gap-2.5">
                {currentQuestion.sentence.split(' ').map((word, idx) => {
                  const cleanWord = word.replace(/[.,!?;]/g, '');
                  const isSelected = selectedErrorWord === cleanWord;
                  const isCorrectTarget =
                    cleanWord.toLowerCase() ===
                    currentQuestion.incorrectWord?.toLowerCase();

                  let wordStyles =
                    'bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200';
                  if (isSelected) {
                    if (isAnswered) {
                      wordStyles = isCorrectTarget
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-450 animate-[shake_0.4s_ease-in-out] font-black';
                    } else {
                      wordStyles =
                        'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-extrabold scale-105';
                    }
                  } else if (isAnswered && isCorrectTarget) {
                    // Highlight từ đúng nếu học viên chọn sai
                    wordStyles =
                      'bg-emerald-500/5 border-emerald-500/20 text-emerald-450';
                  }

                  return (
                    <button
                      key={`${word}-${idx}`}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectErrorWord(word)}
                      className={`text-sm font-bold px-3 py-2 rounded-xl transition ${
                        !isAnswered
                          ? 'cursor-pointer hover:scale-110 active:scale-90'
                          : 'cursor-default'
                      } ${wordStyles}`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khay điền từ sửa lại */}
            {selectedErrorWord && (
              <div
                className={`p-5 bg-slate-950/40 border rounded-2xl space-y-3 transition-all ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-500/35 bg-emerald-500/5'
                      : 'border-rose-500/35 bg-rose-500/5'
                    : 'border-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">
                    {GRAMMAR_UI_TEXT.assessmentQuiz.wrongWordLabel}{' '}
                    <span className="text-indigo-400 font-extrabold">
                      {selectedErrorWord}
                    </span>
                  </span>
                  {isAnswered && (
                    <span className="text-xs font-bold text-slate-400">
                      {GRAMMAR_UI_TEXT.assessmentQuiz.correctWordLabel}{' '}
                      <span className="text-emerald-400">
                        {currentQuestion.correctWord}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Input
                    type="text"
                    disabled={isAnswered}
                    placeholder={GRAMMAR_UI_TEXT.assessmentQuiz.placeholderCorrection}
                    value={correctedText}
                    onChange={(e) => setCorrectedText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleCheckErrorSpotlight()
                    }
                    className="flex-1 bg-muted/40 border-border focus-visible:ring-indigo-500/50 rounded-xl px-4 py-2.5 h-10 text-xs font-bold text-slate-200 transition"
                  />
                  {!isAnswered && (
                    <Button
                      onClick={handleCheckErrorSpotlight}
                      disabled={!correctedText}
                      className="bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold px-4 py-2.5 rounded-xl border-none shadow-md shadow-indigo-600/10 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnCheck}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation panel */}
      {isAnswered && (
        <div
          className={`border rounded-2xl p-5 space-y-2 animate-fadeIn ${
            isCorrect
              ? 'bg-emerald-500/5 border-emerald-500/10'
              : 'bg-rose-500/5 border-rose-500/10'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isCorrect ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.feedbackCorrect}
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.feedbackIncorrect}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-blue-400 tracking-wider uppercase block pt-1.5">
            {GRAMMAR_UI_TEXT.assessmentQuiz.feedbackLabel}
          </span>
          <p className="text-xs text-slate-350 leading-relaxed font-medium">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action Footer */}
      {isAnswered && (
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md shadow-blue-500/15 text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            {currentIdx < activeQuestions.length - 1 ? GRAMMAR_UI_TEXT.assessmentQuiz.btnNext : GRAMMAR_UI_TEXT.assessmentQuiz.btnResult}
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </Button>
        </div>
      )}

      {/* Keyframes for shake animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
      `,
        }}
      />

      {/* Modal Khôi Phục Trạng Thái Làm Bài Dở Dang */}
      {showRecoveryModal && recoveryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#070a14] border border-blue-500/25 rounded-3xl p-6 shadow-2xl shadow-blue-500/5 space-y-6 text-center overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />

            <div className="mx-auto h-14 w-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
              <Timer className="h-7 w-7 text-blue-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                State Recovery{' '}
                {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryLabel}{' '}
                <span role="img" aria-label="timer">
                  ⏳
                </span>
              </span>
              <h3 className="text-xl font-extrabold text-white pt-1">
                {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryDesc.replace('{lessonTitle}', lessonTitle)}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleRecover}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl border-none shadow-lg shadow-blue-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98"
              >
                <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnRecover}
              </Button>
              <Button
                onClick={handleDiscard}
                className="w-full bg-[#0d1020] hover:bg-[#131930] text-rose-450 hover:text-rose-450 font-extrabold py-3 rounded-xl border border-rose-500/10 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98"
              >
                {GRAMMAR_UI_TEXT.assessmentQuiz.btnDiscard}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarAssessmentQuizContainer;
