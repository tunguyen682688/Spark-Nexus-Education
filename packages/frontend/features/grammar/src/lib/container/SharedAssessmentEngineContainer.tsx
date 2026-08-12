import { FC } from 'react';
import { ArrowLeft, Timer, Flag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import type { ExamQuestion } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';
import { useAssessmentSession } from '../hooks/container-logic/use-assessment-session';
import { AssessmentResultsScreen } from '../components/AssessmentResultsScreen';
import { AssessmentRecoveryModal } from '../components/AssessmentRecoveryModal';

interface SharedAssessmentEngineContainerProps {
  questions: ExamQuestion[];
  timeLimit: number;
  examType: 'CEFR' | 'TOEIC' | 'IELTS' | 'VSTEP';
  examTitle: string;
  onFinish: (correctCount: number, totalCount: number) => Promise<unknown>;
  onBack: () => void;
  newCertificate?: unknown;
}

export const SharedAssessmentEngineContainer: FC<SharedAssessmentEngineContainerProps> = ({
  questions,
  timeLimit,
  examType,
  examTitle,
  onFinish,
  onBack,
}) => {
  const { state, actions } = useAssessmentSession({ questions, timeLimit, examType, examTitle, onFinish });
  const { currentIdx, answers, flaggedIds, timeLeft, isCompleted, isSubmitting, examResult,
    selectedOpt, selectedWords, selectedErrorWord, correctedText, savedTrapIds,
    showRecoveryModal, currentQuestion, formattedTime, progressPercent } = state;
  const { setCurrentIdx, toggleFlag, handleSelectOption, handleWordClick,
    handleRemoveWord, handleClearWords, handleSelectErrorWord, handleCorrectionChange,
    submitExam, handleRecover, handleDiscard, handleSaveTrap, retryExam } = actions;

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <h2 className="text-xl font-bold">{GRAMMAR_UI_TEXT.assessmentEngine.noQuestionsTitle}</h2>
        <p className="text-sm text-muted-foreground">{GRAMMAR_UI_TEXT.assessmentEngine.noQuestionsDesc}</p>
        <Button onClick={onBack} className="bg-primary border-none text-white font-bold">{GRAMMAR_UI_TEXT.assessmentEngine.btnBack}</Button>
      </div>
    );
  }

  if (isCompleted && examResult) {
    return (
      <AssessmentResultsScreen
        examResult={examResult}
        examType={examType}
        examTitle={examTitle}
        questions={questions}
        answers={answers}
        savedTrapIds={savedTrapIds}
        onSaveTrap={handleSaveTrap}
        onBack={onBack}
        onRetry={retryExam}
      />
    );
  }

  const qType = currentQuestion?.type || 'MULTIPLE_CHOICE';

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button type="button" onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest hidden sm:block">
          {GRAMMAR_UI_TEXT.assessmentEngine.timerLabel.replace('{examType}', examType)}
        </span>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border transition-colors ${timeLeft <= 60 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
          <Timer className="h-4 w-4" />
          <span className="w-9 text-center font-mono">{formattedTime}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            {GRAMMAR_UI_TEXT.assessmentEngine.assessmentEngineLabel}
          </span>
          <span className="text-blue-400">
            {GRAMMAR_UI_TEXT.levelGraduation.questionIndex.replace('{current}', (currentIdx + 1).toString()).replace('{total}', questions.length.toString())}
          </span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex justify-between items-center bg-muted/30 border border-border rounded-xl p-3">
        <span className="text-xs text-muted-foreground font-medium">{GRAMMAR_UI_TEXT.assessmentEngine.reviewQuestionPrompt}</span>
        <button onClick={() => toggleFlag(currentQuestion.id)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${flaggedIds.includes(currentQuestion.id) ? 'bg-amber-500/10 border-amber-500/30 text-amber-450' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
          <Flag className="h-3.5 w-3.5" />
          {flaggedIds.includes(currentQuestion.id) ? GRAMMAR_UI_TEXT.assessmentEngine.flaggedBadge : GRAMMAR_UI_TEXT.assessmentEngine.flagQuestion}
        </button>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-950/40 rounded border border-indigo-950">
            {qType === 'SENTENCE_BUILDER' ? GRAMMAR_UI_TEXT.assessmentEngine.sentenceRebuilder : qType === 'ERROR_SPOTLIGHT' ? GRAMMAR_UI_TEXT.assessmentEngine.errorSpotlight : GRAMMAR_UI_TEXT.assessmentEngine.multipleChoice}
          </span>
          <h3 className="text-base font-bold text-foreground leading-relaxed pt-2">{currentQuestion?.text}</h3>
        </div>

        {qType === 'MULTIPLE_CHOICE' && currentQuestion?.options && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt: string) => {
              const isSelected = selectedOpt === opt;
              return (
                <button key={opt} onClick={() => handleSelectOption(opt)}
                  className={cn("w-full text-left p-4 rounded-xl border text-xs font-semibold cursor-pointer active:scale-99 transition-all flex items-center justify-between",
                    isSelected ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-muted/45 border-border hover:border-border/80 text-foreground')}>
                  <span>{opt}</span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        )}

        {qType === 'SENTENCE_BUILDER' && currentQuestion?.words && (
          <div className="space-y-4">
            <div className="min-h-16 p-4 rounded-2xl bg-muted/30 border border-border flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-muted-foreground/60 font-medium italic">{GRAMMAR_UI_TEXT.assessmentEngine.sentenceBuilderInstruction}</span>
              ) : selectedWords.map((word, wIdx) => (
                <button key={`${word}-${wIdx}`} onClick={() => handleRemoveWord(wIdx)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all cursor-pointer">
                  {word}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center py-2">
              {currentQuestion.words.filter((w: string) => {
                const countInSource = currentQuestion.words?.filter((x: string) => x === w).length || 0;
                const countInSelected = selectedWords.filter((x) => x === w).length;
                return countInSelected < countInSource;
              }).map((word: string, wIdx: number) => (
                <button key={`${word}-${wIdx}`} onClick={() => handleWordClick(word)}
                  className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-border/80 text-foreground text-xs font-bold transition-all cursor-pointer">
                  {word}
                </button>
              ))}
            </div>
            {selectedWords.length > 0 && (
              <button onClick={handleClearWords} className="text-[10px] font-black text-rose-400 hover:text-rose-350 uppercase cursor-pointer">
                {GRAMMAR_UI_TEXT.assessmentEngine.btnClearAllWords}
              </button>
            )}
          </div>
        )}

        {qType === 'ERROR_SPOTLIGHT' && currentQuestion?.sentence && (
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-500 block uppercase">{GRAMMAR_UI_TEXT.assessmentEngine.errorSpotlightStep1}</span>
            <div className="flex flex-wrap gap-x-1 gap-y-2 bg-muted/20 border border-border p-4 rounded-2xl justify-center">
              {currentQuestion.sentence.split(/\s+/).map((word: string, wIdx: number) => {
                const cleanWord = word.replace(/[.,!?;]/g, '');
                const isSelected = selectedErrorWord === cleanWord;
                return (
                  <button key={`${word}-${wIdx}`} onClick={() => handleSelectErrorWord(word)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected ? 'bg-rose-500/15 border border-rose-500/30 text-rose-450 scale-102 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-transparent border border-transparent text-muted-foreground hover:bg-secondary/60'}`}>
                    {word}
                  </button>
                );
              })}
            </div>
            {selectedErrorWord && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <span className="text-[10px] font-black text-slate-500 block uppercase">
                  {GRAMMAR_UI_TEXT.assessmentEngine.errorSpotlightStep2.replace('{word}', selectedErrorWord)}
                </span>
                <input type="text" value={correctedText} onChange={(e) => handleCorrectionChange(e.target.value)}
                  placeholder={GRAMMAR_UI_TEXT.assessmentEngine.errorSpotlightPlaceholder}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-blue-500/50" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-5 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">
            {GRAMMAR_UI_TEXT.assessmentEngine.navigationTitle.replace('{count}', questions.length.toString())}
          </span>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> {GRAMMAR_UI_TEXT.assessmentEngine.statusAnswered}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500" /> {GRAMMAR_UI_TEXT.assessmentEngine.statusFlagged}</span>
          </div>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {questions.map((q, idx) => {
            const isActive = currentIdx === idx;
            const isFlagged = flaggedIds.includes(q.id);
            const isAnswered = answers[q.id]?.isAnswered;
            let indicatorStyle = 'bg-muted/30 border-border text-muted-foreground hover:border-border/80';
            if (isAnswered) indicatorStyle = 'bg-blue-500/10 border-blue-500/25 text-blue-400 hover:border-blue-500/40';
            if (isFlagged) indicatorStyle = 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:border-amber-500/40';
            if (isActive) indicatorStyle = 'bg-primary border-primary text-primary-foreground shadow-sm ring-1 ring-primary/30 scale-102';
            return (
              <button key={q.id} onClick={() => setCurrentIdx(idx)}
                className={`py-2 rounded-lg border text-xs font-extrabold cursor-pointer transition-all ${indicatorStyle}`}>
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))} disabled={currentIdx === 0}
            className="flex-1 border-border text-muted-foreground hover:text-foreground text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none">
            {GRAMMAR_UI_TEXT.assessmentEngine.btnPrev}
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx((prev) => prev + 1)}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer">
              {GRAMMAR_UI_TEXT.assessmentEngine.btnNext} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submitExam} disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50">
              {isSubmitting ? GRAMMAR_UI_TEXT.assessmentEngine.btnSubmitting : <span>{GRAMMAR_UI_TEXT.assessmentEngine.btnSubmit}</span>}
            </Button>
          )}
        </div>
      </div>

      {showRecoveryModal && <AssessmentRecoveryModal onRecover={handleRecover} onDiscard={handleDiscard} />}
    </div>
  );
};
