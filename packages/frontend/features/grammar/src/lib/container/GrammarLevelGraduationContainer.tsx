import { FC } from 'react';
import { Flag, ArrowLeft, ArrowRight, ShieldCheck, Download, Clock } from 'lucide-react';
import { Button, Card, Badge } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { useGrammarLevelGraduation } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';
import { Certificate3DCard } from '../components/Certificate3DCard';

interface GrammarLevelGraduationContainerProps {
  level: string;
  onFinish: (score: number, isPassed: boolean) => void;
  onBack: () => void;
}

export const GrammarLevelGraduationContainer: FC<GrammarLevelGraduationContainerProps> = ({
  level, onFinish, onBack,
}) => {
  const {
    questions, currentIdx, currentQuestion, answers, flags, timeLeft, isExamCompleted,
    isLoading, correctCount, percentage, isPassed, handleSelectOption, toggleFlag,
    handleNavigateQuestion, handleSubmit, resetExam, isSubmitting,
  } = useGrammarLevelGraduation(level, onFinish);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground font-semibold">{GRAMMAR_UI_TEXT.levelGraduation.loading}</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-lg font-bold">{GRAMMAR_UI_TEXT.levelGraduation.noQuestionsTitle}</p>
          <p className="text-sm text-muted-foreground">{GRAMMAR_UI_TEXT.levelGraduation.noQuestionsDesc.replace('{level}', level)}</p>
          <Button onClick={onBack} className="bg-primary border-none text-white font-bold">{GRAMMAR_UI_TEXT.levelGraduation.btnBackGeneral}</Button>
        </div>
      </div>
    );
  }

  if (isExamCompleted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {isPassed ? (
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="inline-flex items-center gap-1.5 px-3.5 py-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-full font-extrabold text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> {GRAMMAR_UI_TEXT.levelGraduation.passedBadge.replace('{level}', level)}
                  </Badge>
                </div>
                <h2 className="text-3xl font-black text-white leading-tight">{GRAMMAR_UI_TEXT.levelGraduation.passedTitle.replace('{level}', level)}</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {GRAMMAR_UI_TEXT.levelGraduation.passedDesc.split('{percentage}%')[0]}
                  <strong className="text-emerald-400">{percentage}%</strong>
                  {GRAMMAR_UI_TEXT.levelGraduation.passedDesc.split('{percentage}%')[1]?.replace('{correctCount}', correctCount.toString()).replace('{totalCount}', questions.length.toString())}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Card className="bg-card border-border rounded-2xl px-5 py-3 text-center min-w-[120px] shadow-lg">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">{GRAMMAR_UI_TEXT.levelGraduation.xpReward}</span>
                  <span className="text-base font-black text-blue-400">+500 XP</span>
                </Card>
                <Card className="bg-card border-border rounded-2xl px-5 py-3 text-center min-w-[120px] shadow-lg">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">{GRAMMAR_UI_TEXT.levelGraduation.certificate}</span>
                  <span className="text-base font-black text-amber-400">{GRAMMAR_UI_TEXT.levelGraduation.cefrApprovedLabel}</span>
                </Card>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={onBack} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.levelGraduation.btnContinue}
                </Button>
                <Button variant="outline" className="border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5">
                  <Download className="h-4 w-4" /> {GRAMMAR_UI_TEXT.levelGraduation.btnDownload}
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0"><Certificate3DCard level={level} percentage={percentage} /></div>
          </div>
        ) : (
          <Card className="max-w-xl mx-auto bg-card border-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto h-16 w-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center text-3xl"><span role="img" aria-label="X">❌</span></div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">{GRAMMAR_UI_TEXT.levelGraduation.failedTitle}</h2>
              <p className="text-xs text-slate-400">{GRAMMAR_UI_TEXT.levelGraduation.failedDesc.split('80%')[0]}<strong>80%</strong>{GRAMMAR_UI_TEXT.levelGraduation.failedDesc.split('80%')[1]}</p>
            </div>
            <div className="bg-muted/75 border border-border rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">{GRAMMAR_UI_TEXT.levelGraduation.failedResult}</span>
              <span className="text-lg font-black text-rose-500">{GRAMMAR_UI_TEXT.levelGraduation.failedResultText.replace('{percentage}', percentage.toString()).replace('{correctCount}', correctCount.toString()).replace('{totalCount}', questions.length.toString())}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={onBack} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider">{GRAMMAR_UI_TEXT.levelGraduation.btnBack}</Button>
              <Button onClick={resetExam} variant="outline" className="flex-1 border-border text-slate-450 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5">{GRAMMAR_UI_TEXT.levelGraduation.btnRetry}</Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-sm text-muted-foreground">{GRAMMAR_UI_TEXT.levelGraduation.noQuestions}</p>
        <Button onClick={onBack} className="mt-4">{GRAMMAR_UI_TEXT.levelGraduation.btnBackGeneral}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 py-4">
      <Card className="flex-1 bg-card border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between border-b border-border pb-4 gap-4">
          <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400 font-black px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            {GRAMMAR_UI_TEXT.levelGraduation.examTitle.replace('{level}', level)}
          </Badge>
          <button onClick={toggleFlag}
            className={cn("h-9 px-3.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-transparent",
              flags[currentQuestion.id] ? 'border-amber-500/55 text-amber-500 bg-amber-500/5 shadow-inner' : 'border-border text-slate-500 hover:text-slate-355 hover:border-slate-700')}>
            <Flag className={`h-3.5 w-3.5 ${flags[currentQuestion.id] ? 'fill-current' : ''}`} />
            <span>{GRAMMAR_UI_TEXT.levelGraduation.flagQuestion}</span>
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 tracking-wider">
          <span>{GRAMMAR_UI_TEXT.levelGraduation.examHall}</span>
          <span className="text-blue-400">{GRAMMAR_UI_TEXT.levelGraduation.questionIndex.replace('{current}', (currentIdx + 1).toString()).replace('{total}', questions.length.toString())}</span>
        </div>
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">{currentQuestion.text}</h3>
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt;
              return (
                <button key={opt} onClick={() => handleSelectOption(opt)}
                  className={cn("w-full text-left rounded-2xl border px-5 py-4 text-sm font-bold flex items-center justify-between transition-all group cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                    isSelected ? 'bg-blue-600/15 border-blue-500/50 text-blue-450 shadow-md' : 'bg-muted/45 border-border hover:border-slate-700 text-slate-200')}>
                  <span>{opt}</span>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <button onClick={() => handleNavigateQuestion(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
            className="px-4 py-2.5 rounded-xl border border-border hover:border-slate-750 text-slate-450 hover:text-slate-250 hover:bg-slate-900/40 text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer bg-transparent">
            <ArrowLeft className="h-3.5 w-3.5" /><span>{GRAMMAR_UI_TEXT.levelGraduation.btnPrev}</span>
          </button>
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => handleNavigateQuestion(currentIdx + 1)}
              className="px-4 py-2.5 rounded-xl border border-border hover:border-slate-750 text-slate-450 hover:text-slate-255 hover:bg-slate-900/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer bg-transparent">
              <span>{GRAMMAR_UI_TEXT.levelGraduation.btnNext}</span><ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md shadow-blue-500/20 text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all uppercase tracking-wider">
              {isSubmitting ? GRAMMAR_UI_TEXT.levelGraduation.btnSubmitting : GRAMMAR_UI_TEXT.levelGraduation.btnSubmit}
            </Button>
          )}
        </div>
      </Card>

      <div className="w-full lg:w-72 space-y-6">
        <Card className="bg-card border-border rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted border border-border text-blue-500"><Clock className="h-4.5 w-4.5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">{GRAMMAR_UI_TEXT.levelGraduation.timerLabel}</span>
              <span className={`text-base font-extrabold ${timeLeft > 60 ? 'text-white' : 'text-rose-500 animate-pulse'}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting}
            className="bg-muted hover:bg-secondary text-slate-300 font-bold border border-border py-2 rounded-xl text-[10px] uppercase tracking-wide cursor-pointer active:scale-95">
            {GRAMMAR_UI_TEXT.levelGraduation.timerSubmit}
          </Button>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-5 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block border-b border-border/60 pb-2.5">{GRAMMAR_UI_TEXT.levelGraduation.navTitle}</span>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = currentIdx === idx;
              const hasAnswered = answers[q.id] !== undefined;
              const isFlagged = flags[q.id] === true;
              let gridStyles = 'bg-muted border-border text-slate-500 hover:border-slate-700';
              if (isCurrent) gridStyles = 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/15';
              else if (isFlagged) gridStyles = 'bg-amber-500/10 border-amber-500/40 text-amber-500';
              else if (hasAnswered) gridStyles = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
              return (
                <button key={q.id} onClick={() => handleNavigateQuestion(idx)}
                  className={`h-9 w-full rounded-lg border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${gridStyles}`}>{idx + 1}</button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-muted border border-border" /><span>{GRAMMAR_UI_TEXT.levelGraduation.unanswered}</span></div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500/10 border border-blue-500/20" /><span>{GRAMMAR_UI_TEXT.levelGraduation.answered}</span></div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500/10 border border-amber-500/40" /><span>{GRAMMAR_UI_TEXT.levelGraduation.flagged}</span></div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-600" /><span>{GRAMMAR_UI_TEXT.levelGraduation.current}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GrammarLevelGraduationContainer;
