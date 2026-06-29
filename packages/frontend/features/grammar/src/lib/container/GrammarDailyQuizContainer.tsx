import { FC } from 'react';
import {
  Flame,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { useGrammarDailyQuiz } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface GrammarDailyQuizContainerProps {
  questions?: Question[];
  onFinish: (score: number, xpEarned: number) => void;
  onBack: () => void;
}

export const GrammarDailyQuizContainer: FC<
  GrammarDailyQuizContainerProps
> = ({ questions = [], onFinish, onBack }) => {
  const {
    activeQuestions,
    currentIdx,
    currentQuestion,
    selectedOpt,
    isAnswered,
    score,
    streak,
    timeLeft,
    showXpPopup,
    isCompleted,
    slideDirection,
    xpEarned,
    strokeDashoffset,
    handleSelectOption,
    handleNext,
  } = useGrammarDailyQuiz({ questions });

  if (!activeQuestions || activeQuestions.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <h2 className="text-xl font-bold">{GRAMMAR_UI_TEXT.dailyQuiz.noQuestionsTitle}</h2>
        <p className="text-sm text-muted-foreground">{GRAMMAR_UI_TEXT.dailyQuiz.noQuestionsDesc}</p>
        <Button onClick={onBack} className="bg-primary border-none text-white">
          {GRAMMAR_UI_TEXT.dailyQuiz.btnBack}
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto h-20 w-20 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center text-4xl animate-bounce shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <span role="img" aria-label="trophy">🏆</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 uppercase tracking-wider">
            {GRAMMAR_UI_TEXT.dailyQuiz.completedTitle}
          </h2>
          <p className="text-xs text-muted-foreground">
            {GRAMMAR_UI_TEXT.dailyQuiz.completedDesc}
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3 bg-muted/40 border border-border rounded-2xl p-4 text-center">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase">
              {GRAMMAR_UI_TEXT.dailyQuiz.statCorrect}
            </span>
            <span className="text-lg font-black text-emerald-500">
              {score}/{activeQuestions.length}
            </span>
          </div>
          <div className="border-l border-border">
            <span className="text-[10px] font-bold text-muted-foreground block uppercase">
              {GRAMMAR_UI_TEXT.dailyQuiz.statStreak}
            </span>
            <span className="text-lg font-black text-amber-500 flex items-center justify-center gap-0.5">
              <span role="img" aria-label="fire" className="animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥</span> {streak + 1} {GRAMMAR_UI_TEXT.dailyQuiz.streakUnit}
            </span>
          </div>
          <div className="border-l border-border">
            <span className="text-[10px] font-bold text-muted-foreground block uppercase">
              {GRAMMAR_UI_TEXT.dailyQuiz.statXp}
            </span>
            <span className="text-lg font-black text-primary">
              +{xpEarned} XP
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => onFinish(score, xpEarned)}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold py-3.5 rounded-xl border-none shadow-lg active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
          >
            {GRAMMAR_UI_TEXT.dailyQuiz.btnReward}
          </Button>
        </div>
      </div>
    );
  }

  // Simple highlight logic: if the explanation contains the answer or common grammar terms, bold them.
  const renderHighlightedExplanation = (explanation: string, answer: string) => {
    if (!explanation) return null;
    const keywords = GRAMMAR_UI_TEXT.dailyQuiz.highlightKeywords || ['Quá khứ hoàn thành', 'Quá khứ đơn', 'câu điều kiện', 'Subjunctive Mood'];
    const keywordsPattern = [answer, ...keywords].map(k => k.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
    const parts = explanation.split(new RegExp(`(${keywordsPattern})`, 'gi'));
    
    return (
      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          if (lowerPart === answer.toLowerCase() || 
              keywords.some(k => k.toLowerCase() === lowerPart)) {
            return <span key={i} className="text-primary font-bold bg-primary/20 px-1 rounded mx-0.5">{part}</span>;
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Floating XP Animation Popup */}
      {showXpPopup && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-5 py-2.5 rounded-full animate-[ping_1s_ease-out_forwards] z-50 text-sm tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-1">
          <span role="img" aria-label="fire">🔥</span> {GRAMMAR_UI_TEXT.dailyQuiz.xpPopupText}
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-500 rounded-full font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse drop-shadow-[0_0_5px_rgba(245,158,11,1)]" />
          <span className="tracking-widest">{GRAMMAR_UI_TEXT.dailyQuiz.streakLabel}: {streak}</span>
        </div>

        {/* Circular Timer */}
        <div className="relative h-10 w-10 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="17"
              className="stroke-secondary fill-transparent"
              strokeWidth="3.5"
            />
            <circle
              cx="20"
              cy="20"
              r="17"
              className={`fill-transparent transition-all duration-1000 ${
                timeLeft > 10
                  ? 'stroke-primary'
                  : 'stroke-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(243,24,105,0.8)]'
              }`}
              strokeWidth="3.5"
              strokeDasharray="113"
              strokeDashoffset={113 - strokeDashoffset}
            />
          </svg>
          <span className={`absolute text-[11px] font-black ${timeLeft > 10 ? 'text-foreground' : 'text-rose-500'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground tracking-wider">
        <span>{GRAMMAR_UI_TEXT.dailyQuiz.missionLabel}</span>
        <span className="text-primary">
          {GRAMMAR_UI_TEXT.dailyQuiz.questionProgress.replace('{current}', String(currentIdx + 1)).replace('{total}', String(activeQuestions.length))}
        </span>
      </div>

      {/* Flashcard sliding wrapper */}
      <div className={`transition-all duration-300 ease-in-out ${slideDirection === 'left' ? '-translate-x-full opacity-0' : slideDirection === 'right' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground leading-relaxed">
            {currentQuestion.text}
          </h3>

          {/* Options list */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOpt === opt;
              const isCorrectAnswer = opt === currentQuestion.answer;
              const hasChecked = isAnswered;

              let cardStyles =
                'bg-muted/20 border-border hover:border-border/80 text-foreground';
              let animationStyles = '';
              
              if (hasChecked) {
                if (isCorrectAnswer) {
                  cardStyles =
                    'bg-emerald-500/10 border-emerald-500/40 text-emerald-500';
                  if (isSelected) animationStyles = 'shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02] border-emerald-500';
                } else if (isSelected) {
                  cardStyles = 'bg-destructive/10 border-destructive/40 text-destructive';
                  animationStyles = 'animate-[shake_0.4s_ease-in-out] border-destructive';
                } else {
                  cardStyles =
                    'bg-muted/10 border-border/40 text-muted-foreground/60 opacity-40';
                }
              } else if (isSelected) {
                cardStyles = 'bg-primary/20 border-primary/60 text-primary';
              }

              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 px-5 py-4 text-sm font-bold flex items-center justify-between transition-all group",
                    !isAnswered
                      ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:bg-secondary/40'
                      : 'cursor-default',
                    cardStyles,
                    animationStyles
                  )}
                >
                  <span className="text-base">{opt}</span>
                  {hasChecked && isCorrectAnswer && (
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                  {hasChecked && isSelected && !isCorrectAnswer && (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation panel */}
        {isAnswered && (
          <div className="mt-5 bg-primary/5 border-l-4 border-l-primary border-y border-r border-y-primary/10 border-r-primary/10 rounded-r-2xl p-4 space-y-2 animate-fadeIn shadow-[0_4px_20px_rgba(59,130,246,0.05)]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-wider">
                {GRAMMAR_UI_TEXT.dailyQuiz.explanationLabel}
              </span>
            </div>
            {renderHighlightedExplanation(currentQuestion.explanation, currentQuestion.answer)}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {isAnswered && (
        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold px-8 py-3 rounded-xl border-none shadow-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            {currentIdx < activeQuestions.length - 1
              ? GRAMMAR_UI_TEXT.dailyQuiz.btnNextQuestion
              : GRAMMAR_UI_TEXT.dailyQuiz.btnFinish}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Keyframes for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}} />
    </div>
  );
};

export default GrammarDailyQuizContainer;
