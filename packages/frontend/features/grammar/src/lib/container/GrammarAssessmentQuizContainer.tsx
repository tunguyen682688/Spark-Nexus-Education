import { FC } from 'react';
import { ArrowLeft, Timer, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useGrammarAssessmentQuiz } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';
import { QuizCompletionStats } from '../components/practice';
import { AssessmentQuestionRenderer } from '../components/AssessmentQuestionRenderer';

interface GrammarAssessmentQuizContainerProps {
  lessonTitle: string;
  lessonId: string;
  onFinish: (proficiency: number, xpEarned: number) => void;
  onBack: () => void;
}

export const GrammarAssessmentQuizContainer: FC<GrammarAssessmentQuizContainerProps> = ({
  lessonTitle, lessonId, onFinish, onBack,
}) => {
  const {
    isLoading, questions, activeQuestions, currentIdx, currentQuestion, selectedOpt,
    selectedWords, selectedErrorWord, correctedText, isAnswered, isCorrect, score,
    isCompleted, wrongQuestionIds, timeLeft, showRecoveryModal, recoveryData, savedTrapIds,
    setCorrectedText, handleSelectOption, handleWordClick, handleRemoveWord, handleClearWords,
    handleCheckSentenceBuilder, handleSelectErrorWord, handleCheckErrorSpotlight, handleNext,
    resetQuiz, retryMistakes, handleSaveTrap, handleRecover, handleDiscard,
  } = useGrammarAssessmentQuiz({ lessonId });

  if (isLoading || activeQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground tracking-wider animate-pulse">{GRAMMAR_UI_TEXT.assessmentQuiz.loading}</p>
      </div>
    );
  }

  const proficiency = Math.round((score / activeQuestions.length) * 100) || 0;
  const xpEarned = score * 30;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  let medalIcon = '🥉';
  let medalName = GRAMMAR_UI_TEXT.assessmentQuiz.bronzeMedal;
  let medalColor = 'text-amber-700 bg-amber-500/10 border-amber-600/20';
  if (proficiency >= 90) { medalIcon = '💎'; medalName = GRAMMAR_UI_TEXT.assessmentQuiz.diamondMedal; medalColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20 shadow-cyan-500/10'; }
  else if (proficiency >= 80) { medalIcon = '🥇'; medalName = GRAMMAR_UI_TEXT.assessmentQuiz.goldMedal; medalColor = 'text-amber-400 bg-amber-500/10 border-amber-400/20'; }
  else if (proficiency >= 70) { medalIcon = '🥈'; medalName = GRAMMAR_UI_TEXT.assessmentQuiz.silverMedal; medalColor = 'text-slate-350 bg-slate-500/10 border-slate-400/20'; }

  const computeSkillFactors = (qs: typeof activeQuestions, wrongIds: string[]): { syntax: number; tenses: number; morphology: number; modality: number } => {
    const getFactor = (cat: string) => {
      const catQs = qs.filter((q) => q.category === cat);
      const correct = catQs.filter((q) => !wrongIds.includes(q.id)).length;
      return catQs.length > 0 ? Math.max(0.3, correct / catQs.length) : 0.8;
    };
    return { syntax: getFactor('syntax'), tenses: getFactor('tenses'), morphology: getFactor('morphology'), modality: getFactor('modality') };
  };

  const skillFactors = computeSkillFactors(activeQuestions, wrongQuestionIds);
  const weakSkills: string[] = [];
  if (skillFactors.syntax < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.syntax} (Syntax)`);
  if (skillFactors.tenses < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.tenses} (Tense & Aspect)`);
  if (skillFactors.morphology < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.morphology} (Morphology)`);
  if (skillFactors.modality < 0.8) weakSkills.push(`${GRAMMAR_UI_TEXT.lessonComponents.diagnosticChart.modality} (Modality)`);

  if (isCompleted) {
    return (
      <QuizCompletionStats proficiency={proficiency} xpEarned={xpEarned} medalIcon={medalIcon} medalName={medalName}
        medalColor={medalColor} weakSkills={weakSkills} wrongQuestionIds={wrongQuestionIds} questions={questions}
        savedTrapIds={savedTrapIds} onFinish={() => onFinish(proficiency, xpEarned)} onRetryMistakes={retryMistakes}
        onResetQuiz={resetQuiz} onSaveTrap={handleSaveTrap} skillFactors={skillFactors} />
    );
  }

  const progressPercent = (currentIdx / activeQuestions.length) * 100;
  const qType = currentQuestion.type || 'MULTIPLE_CHOICE';

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button onClick={onBack} className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">{GRAMMAR_UI_TEXT.assessmentQuiz.headerAssessment}</span>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border transition-colors ${timeLeft <= 60 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
          <Timer className="h-4 w-4" />
          <span className="w-9 text-center font-mono">{formattedTime}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground tracking-wider">
          <span>{wrongQuestionIds.length > 0 ? 'RETRY MISTAKES' : 'SUMMARY ASSESSMENT'}</span>
          <span className="text-blue-400">{GRAMMAR_UI_TEXT.assessmentQuiz.questionProgress.replace('{current}', (currentIdx + 1).toString()).replace('{total}', activeQuestions.length.toString())}</span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Question */}
      <AssessmentQuestionRenderer
        question={currentQuestion} qType={qType} selectedOpt={selectedOpt} selectedWords={selectedWords}
        selectedErrorWord={selectedErrorWord} correctedText={correctedText} isAnswered={isAnswered} isCorrect={isCorrect}
        onSelectOption={handleSelectOption} onWordClick={handleWordClick} onRemoveWord={handleRemoveWord}
        onClearWords={handleClearWords} onCheckSentenceBuilder={handleCheckSentenceBuilder}
        onSelectErrorWord={handleSelectErrorWord} onCorrectionChange={setCorrectedText} onCheckErrorSpotlight={handleCheckErrorSpotlight} />

      {/* Explanation */}
      {isAnswered && (
        <div className={`border rounded-2xl p-5 space-y-2 animate-fadeIn ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
          <span className={`text-xs font-bold flex items-center gap-1 ${isCorrect ? 'text-emerald-500' : 'text-destructive'}`}>
            {isCorrect ? '✓' : '✗'} {isCorrect ? GRAMMAR_UI_TEXT.assessmentQuiz.feedbackCorrect : GRAMMAR_UI_TEXT.assessmentQuiz.feedbackIncorrect}
          </span>
          <span className="text-[10px] font-black text-primary tracking-wider uppercase block pt-1.5">{GRAMMAR_UI_TEXT.assessmentQuiz.feedbackLabel}</span>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Action */}
      {isAnswered && (
        <div className="pt-2 flex justify-end">
          <Button onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md shadow-primary/15 text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all">
            {currentIdx < activeQuestions.length - 1 ? GRAMMAR_UI_TEXT.assessmentQuiz.btnNext : GRAMMAR_UI_TEXT.assessmentQuiz.btnResult}
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </Button>
        </div>
      )}

      {/* Shake keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 50% { transform: translateX(4px); } 75% { transform: translateX(-4px); } }` }} />

      {/* Recovery Modal */}
      {showRecoveryModal && recoveryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 text-center overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <Timer className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                State Recovery {GRAMMAR_UI_TEXT.assessmentQuiz.recoveryLabel} ⏳
              </span>
              <h3 className="text-xl font-extrabold text-foreground pt-1">{GRAMMAR_UI_TEXT.assessmentQuiz.recoveryTitle}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{GRAMMAR_UI_TEXT.assessmentQuiz.recoveryDesc.replace('{lessonTitle}', lessonTitle)}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleRecover}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-3 rounded-xl border-none shadow-lg shadow-primary/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98">
                <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnRecover}
              </Button>
              <Button onClick={handleDiscard}
                className="w-full bg-muted hover:bg-muted/80 text-destructive font-extrabold py-3 rounded-xl border border-border text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98">
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
