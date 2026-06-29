import { FC, ChangeEvent, KeyboardEvent } from 'react';
import {
  ArrowLeft,
  Timer,
  RefreshCw,
  CheckCircle,
  XCircle,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button, Input } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { useGrammarAssessmentQuiz } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';
import { QuizCompletionStats } from '../components/practice';

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
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground tracking-wider animate-pulse">
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
  if (skillFactors.syntax < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.syntax} (Syntax)`);
  if (skillFactors.tenses < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.tenses} (Tense & Aspect)`);
  if (skillFactors.morphology < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.morphology} (Morphology)`);
  if (skillFactors.modality < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.modality} (Modality)`);

  if (isCompleted) {
    return (
      <QuizCompletionStats
        proficiency={proficiency}
        xpEarned={xpEarned}
        medalIcon={medalIcon}
        medalName={medalName}
        medalColor={medalColor}
        weakSkills={weakSkills}
        wrongQuestionIds={wrongQuestionIds}
        questions={questions}
        savedTrapIds={savedTrapIds}
        onFinish={() => onFinish(proficiency, xpEarned)}
        onRetryMistakes={retryMistakes}
        onResetQuiz={resetQuiz}
        onSaveTrap={handleSaveTrap}
        skillFactors={skillFactors}
      />
    );
  }

  const progressPercent = (currentIdx / activeQuestions.length) * 100;
  const qType = currentQuestion.type || 'MULTIPLE_CHOICE';

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
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
        <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground tracking-wider">
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
        <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question panel */}
      <div className="space-y-5">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
            {qType === 'SENTENCE_BUILDER'
              ? 'Sentence Rebuilder 🧩'
              : qType === 'ERROR_SPOTLIGHT'
              ? 'Error Spotlight 🔍'
              : 'Multiple Choice 📝'}
          </span>
          <h3 className="text-base font-bold text-foreground leading-relaxed pt-2">
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
                'bg-card border-border hover:border-muted-foreground/30 text-foreground';
              let animationStyles = '';

              if (hasChecked) {
                if (isCorrectAnswer) {
                  cardStyles =
                    'bg-emerald-500/10 border-emerald-500/35 text-emerald-500';
                  if (isSelected)
                    animationStyles =
                      'shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.01]';
                } else if (isSelected) {
                  cardStyles =
                    'bg-destructive/10 border-destructive/35 text-destructive';
                  animationStyles = 'animate-[shake_0.4s_ease-in-out]';
                } else {
                  cardStyles =
                    'bg-card/20 border-border text-muted-foreground opacity-40';
                }
              } else if (isSelected) {
                cardStyles = 'bg-primary/10 border-primary/30 text-primary';
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
              className={`min-h-[64px] p-4 bg-muted/30 border rounded-2xl flex flex-wrap gap-2 items-center transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500/35 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'border-rose-500/35 bg-rose-500/5 animate-[shake_0.4s_ease-in-out]'
                  : 'border-border'
              }`}
            >
              {selectedWords.length === 0 ? (
                <span className="text-xs font-medium text-muted-foreground/60">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.clickWordToBuild}
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    disabled={isAnswered}
                    onClick={() => handleRemoveWord(idx)}
                    className={`bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      !isAnswered
                        ? 'cursor-pointer hover:scale-105 active:scale-95'
                        : 'cursor-default'
                    }`}
                  >
                    {word}{' '}
                    {!isAnswered && <X className="h-3 w-3 text-primary" />}
                  </button>
                ))
              )}
            </div>

            {/* Các công cụ Clear / Reset */}
            {!isAnswered && selectedWords.length > 0 && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClearWords}
                  className="bg-muted hover:bg-muted/80 text-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border flex items-center gap-1 cursor-pointer transition"
                >
                  <RefreshCw className="h-3 w-3" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnClearAll}
                </button>
              </div>
            )}

            {/* Khay hiển thị các từ sẵn có để chọn */}
            {!isAnswered && (
              <div className="bg-muted/20 p-4 border border-border rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase block">
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
                            ? 'bg-muted text-muted-foreground/40 border border-border opacity-25 cursor-default'
                            : 'bg-muted hover:bg-muted/80 border border-border text-foreground cursor-pointer hover:scale-105 active:scale-95'
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs px-6 py-2.5 rounded-xl border-none shadow-md shadow-primary/15 flex items-center gap-1.5 cursor-pointer transition active:scale-95 uppercase tracking-wider"
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
            <div className="bg-muted/20 border border-border rounded-2xl p-6 text-center space-y-4">
              <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase block">
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
                    'bg-muted hover:bg-muted/80 border border-border text-foreground';
                  if (isSelected) {
                    if (isAnswered) {
                      wordStyles = isCorrectTarget
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black'
                        : 'bg-destructive/10 border-destructive/40 text-destructive animate-[shake_0.4s_ease-in-out] font-black';
                    } else {
                      wordStyles =
                        'bg-primary/10 border-primary text-primary font-extrabold scale-105';
                    }
                  } else if (isAnswered && isCorrectTarget) {
                    // Highlight từ đúng nếu học viên chọn sai
                    wordStyles =
                      'bg-emerald-500/5 border-emerald-500/20 text-emerald-500';
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
                className={`p-5 bg-card border rounded-2xl space-y-3 transition-all ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-500/35 bg-emerald-500/5'
                      : 'border-rose-500/35 bg-rose-500/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">
                    {GRAMMAR_UI_TEXT.assessmentQuiz.wrongWordLabel}{' '}
                    <span className="text-primary font-extrabold">
                      {selectedErrorWord}
                    </span>
                  </span>
                  {isAnswered && (
                    <span className="text-xs font-bold text-muted-foreground">
                      {GRAMMAR_UI_TEXT.assessmentQuiz.correctWordLabel}{' '}
                      <span className="text-emerald-500">
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCorrectedText(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                      e.key === 'Enter' && handleCheckErrorSpotlight()
                    }
                    className="flex-1 bg-background border border-border focus-visible:ring-primary/50 rounded-xl px-4 py-2.5 h-10 text-xs font-bold text-foreground transition"
                  />
                  {!isAnswered && (
                    <Button
                      onClick={handleCheckErrorSpotlight}
                      disabled={!correctedText}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl border-none shadow-md shadow-primary/10 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.feedbackCorrect}
              </span>
            ) : (
              <span className="text-xs font-bold text-destructive flex items-center gap-1">
                <XCircle className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.feedbackIncorrect}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-primary tracking-wider uppercase block pt-1.5">
            {GRAMMAR_UI_TEXT.assessmentQuiz.feedbackLabel}
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action Footer */}
      {isAnswered && (
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md shadow-primary/15 text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 text-center overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <Timer className="h-7 w-7 text-primary" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                State Recovery{' '}
                {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryLabel}{' '}
                <span role="img" aria-label="timer">
                  ⏳
                </span>
              </span>
              <h3 className="text-xl font-extrabold text-foreground pt-1">
                {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryDesc.replace('{lessonTitle}', lessonTitle)}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleRecover}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-3 rounded-xl border-none shadow-lg shadow-primary/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98"
              >
                <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnRecover}
              </Button>
              <Button
                onClick={handleDiscard}
                className="w-full bg-muted hover:bg-muted/80 text-destructive font-extrabold py-3 rounded-xl border border-border text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98"
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
