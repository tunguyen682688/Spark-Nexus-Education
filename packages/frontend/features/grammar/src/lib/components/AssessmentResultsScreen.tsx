import { FC } from 'react';
import { RotateCcw, Home, Award, BookOpen, Bookmark, Printer } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import type { ExamQuestion } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';
import type { AssessmentAnswer, ExamAttemptResult } from '../types/assessment-engine.types';

interface AssessmentResultsScreenProps {
  examResult: ExamAttemptResult;
  examType: string;
  examTitle: string;
  questions: ExamQuestion[];
  answers: Record<string, AssessmentAnswer>;
  savedTrapIds: string[];
  onSaveTrap: (q: ExamQuestion, userAnswer: string) => Promise<void>;
  onBack: () => void;
  onRetry: () => void;
}

export const AssessmentResultsScreen: FC<AssessmentResultsScreenProps> = ({
  examResult,
  examType,
  examTitle,
  questions,
  answers,
  savedTrapIds,
  onSaveTrap,
  onBack,
  onRetry,
}) => {
  const proficiency = examResult.proficiency ?? 0;
  const xpEarned = examResult.xpEarned ?? 0;
  const isPassed = examResult.isPassed ?? false;
  const certificate = examResult.certificate;

  let scaleTitle = GRAMMAR_UI_TEXT.assessmentEngine.resultsTitle;
  let scaleVal = `${proficiency}%`;
  let scaleDesc = GRAMMAR_UI_TEXT.assessmentEngine.scaleGeneralDesc
    .replace('{correct}', Math.round((proficiency / 100) * questions.length).toString())
    .replace('{total}', questions.length.toString());

  if (examType === 'TOEIC') {
    scaleTitle = GRAMMAR_UI_TEXT.assessmentEngine.scaleToeicTitle;
    const points = Math.round((proficiency / 100) * 250) + 150;
    scaleVal = GRAMMAR_UI_TEXT.assessmentEngine.pointsLabel.replace('{points}', points.toString());
    scaleDesc = GRAMMAR_UI_TEXT.assessmentEngine.scaleToeicDesc;
  } else if (examType === 'IELTS') {
    scaleTitle = GRAMMAR_UI_TEXT.assessmentEngine.scaleIeltsTitle;
    const band = (5.0 + (proficiency / 100) * 4.0).toFixed(1);
    scaleVal = GRAMMAR_UI_TEXT.assessmentEngine.bandLabel.replace('{band}', band);
    scaleDesc = GRAMMAR_UI_TEXT.assessmentEngine.scaleIeltsDesc;
  } else if (examType === 'VSTEP') {
    scaleTitle = GRAMMAR_UI_TEXT.assessmentEngine.scaleVstepTitle;
    scaleVal = proficiency >= 85
      ? GRAMMAR_UI_TEXT.assessmentEngine.vstepLevel1
      : proficiency >= 70
      ? GRAMMAR_UI_TEXT.assessmentEngine.vstepLevel2
      : proficiency >= 50
      ? GRAMMAR_UI_TEXT.assessmentEngine.vstepLevel3
      : GRAMMAR_UI_TEXT.assessmentEngine.vstepFailed;
    scaleDesc = GRAMMAR_UI_TEXT.assessmentEngine.vstepDesc;
  }

  return (
    <div className="max-w-full mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6 w-full">
          <div className="space-y-1">
            <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {examType} PRACTICE arena
            </span>
            <h2 className="text-2xl font-extrabold text-white pt-2">{examTitle}</h2>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-muted/40 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{scaleTitle}</span>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{scaleVal}</div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{scaleDesc}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isPassed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
                <span className="text-sm font-extrabold text-white">
                  {isPassed ? GRAMMAR_UI_TEXT.assessmentEngine.passedLabel : GRAMMAR_UI_TEXT.assessmentEngine.failedLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{GRAMMAR_UI_TEXT.assessmentEngine.passRequirementDesc}</p>
              <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg p-2 text-center text-xs font-black">
                {GRAMMAR_UI_TEXT.assessmentEngine.xpAccumulated.replace('{xp}', xpEarned.toString())}
              </div>
            </div>
          </div>

          {examResult.newCertificateIssued && certificate && (
            <div className="p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/10 to-amber-950/20 text-center space-y-4 shadow-xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
              <Award className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{GRAMMAR_UI_TEXT.assessmentEngine.certCongrats}</span>
                <h4 className="text-lg font-black text-white">{GRAMMAR_UI_TEXT.assessmentEngine.certIssuedTitle}</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                  {GRAMMAR_UI_TEXT.assessmentEngine.certIssuedDesc.replace('{examType}', examType).replace('{level}', certificate.level || '')}
                </p>
              </div>
              <div className="perspective-1000 my-6 flex justify-center">
                <div className="relative w-80 h-48 bg-gradient-to-br from-card/90 to-card border border-amber-500/30 rounded-2xl p-5 shadow-2xl flex flex-col justify-between text-left transition-all duration-300 hover:border-amber-400/60"
                  style={{ transform: 'rotateX(8deg) rotateY(-5deg)', transformStyle: 'preserve-3d' }}>
                  <Award className="absolute right-4 bottom-4 h-24 w-24 text-amber-500/5 pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] font-black text-amber-500 tracking-wider">{GRAMMAR_UI_TEXT.examHub.dialogCertBadge}</div>
                      <div className="text-[10px] font-bold text-muted-foreground">{GRAMMAR_UI_TEXT.examHub.dialogCertDesc}</div>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">{examType} {certificate.level}</span>
                  </div>
                  <div className="space-y-1 py-3" style={{ transform: 'translateZ(20px)' }}>
                    <span className="text-[8px] text-muted-foreground block uppercase tracking-wider">{GRAMMAR_UI_TEXT.examHub.dialogCertUserLabel}</span>
                    <div className="text-base font-black text-foreground bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">{GRAMMAR_UI_TEXT.examHub.dialogCertUserVal}</div>
                  </div>
                  <div className="flex justify-between items-end border-t border-border pt-2">
                    <div>
                      <span className="text-[7px] text-muted-foreground block uppercase">{GRAMMAR_UI_TEXT.assessmentEngine.certSerialNumber}</span>
                      <span className="text-[9px] font-mono text-foreground/80">{certificate.serialNumber}</span>
                    </div>
                    <span className="text-[8px] text-muted-foreground font-mono">
                      {GRAMMAR_UI_TEXT.assessmentEngine.certDateIssued.replace('{date}', new Date(certificate.issuedAt || '').toLocaleDateString())}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button onClick={() => window.print()}
                  className="bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-bold border border-border py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer">
                  <Printer className="h-3.5 w-3.5" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnPrintCert}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={onBack}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider">
              <Home className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnHome}
            </Button>
            {!isPassed && (
              <Button onClick={onRetry}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-xl border-none shadow-lg shadow-rose-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider">
                <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnRetryExam}
              </Button>
            )}
          </div>

          <div className="mt-8 space-y-4 text-left w-full">
            <h3 className="text-base font-extrabold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              {GRAMMAR_UI_TEXT.assessmentEngine.detailedExplanations.replace('{count}', questions.length.toString())}
            </h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const saved = answers[q.id];
                let isAnsCorrect = false;
                if (saved) {
                  if (q.type === 'MULTIPLE_CHOICE') isAnsCorrect = saved.userAnswer === q.answer;
                  else if (q.type === 'SENTENCE_BUILDER') isAnsCorrect = saved.userAnswer?.toLowerCase() === q.answer.toLowerCase();
                  else if (q.type === 'ERROR_SPOTLIGHT') {
                    isAnsCorrect = saved.incorrectWord?.toLowerCase() === q.incorrectWord?.toLowerCase() &&
                      saved.correctedText?.trim().toLowerCase() === q.correctWord?.toLowerCase();
                  }
                }
                return (
                  <div key={q.id} className={cn("bg-muted/80 border rounded-xl p-4 space-y-2", isAnsCorrect ? 'border-emerald-500/10' : 'border-rose-500/10')}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500">
                        {GRAMMAR_UI_TEXT.assessmentEngine.questionNumberLabel.replace('{number}', (idx + 1).toString()).replace('{category}', q.category.toUpperCase())}
                      </span>
                      <div className="flex items-center gap-2">
                        {!isAnsCorrect && (
                          <Button onClick={() => onSaveTrap(q, saved?.userAnswer || '')} disabled={savedTrapIds.includes(q.id)}
                            className="bg-card border border-border hover:border-border/80 text-[9px] font-black text-rose-400 hover:text-rose-350 px-2 py-1 rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 disabled:text-slate-500 disabled:border-border disabled:cursor-default">
                            <Bookmark className="h-3 w-3" />
                            {savedTrapIds.includes(q.id) ? GRAMMAR_UI_TEXT.assessmentEngine.btnSavedTrap : `💾 ${GRAMMAR_UI_TEXT.assessmentEngine.btnSaveTrap}`}
                          </Button>
                        )}
                        <span className={`text-[10px] font-black ${isAnsCorrect ? 'text-emerald-450' : 'text-rose-400'}`}>
                          {isAnsCorrect ? GRAMMAR_UI_TEXT.assessmentEngine.correctBadge : GRAMMAR_UI_TEXT.assessmentEngine.wrongBadge}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-foreground leading-relaxed">{q.type === 'ERROR_SPOTLIGHT' ? q.sentence : q.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/40 p-2 rounded-lg border border-border">
                        <span className="text-[8px] font-black text-muted-foreground uppercase block mb-0.5">{GRAMMAR_UI_TEXT.assessmentEngine.answerUser}</span>
                        <span className={isAnsCorrect ? 'text-emerald-400 font-bold' : 'text-rose-450 font-bold'}>
                          {saved?.userAnswer || GRAMMAR_UI_TEXT.assessmentEngine.unanswered}
                        </span>
                      </div>
                      <div className="bg-muted/40 p-2 rounded-lg border border-border">
                        <span className="text-[8px] font-black text-muted-foreground uppercase block mb-0.5">{GRAMMAR_UI_TEXT.assessmentEngine.answerCorrect}</span>
                        <span className="text-emerald-400 font-bold">
                          {q.type === 'ERROR_SPOTLIGHT' ? `${q.incorrectWord} -> ${q.correctWord}` : q.answer}
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-500/5 p-3.5 rounded-lg border border-blue-500/10 mt-2">
                      <span className="text-[9px] font-black text-blue-400 uppercase block mb-1">{GRAMMAR_UI_TEXT.assessmentEngine.pedagogicalExplanation}</span>
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
