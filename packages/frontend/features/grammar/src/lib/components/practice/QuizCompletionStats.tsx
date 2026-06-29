import { FC } from 'react';
import { Home, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../../constants';
import { DiagnosticRadarChart } from '../DiagnosticRadarChart';
import type { ExamQuestion } from '../../types';
import { WrongAnswersList } from './WrongAnswersList';

interface QuizCompletionStatsProps {
  proficiency: number;
  xpEarned: number;
  medalIcon: string;
  medalName: string;
  medalColor: string;
  weakSkills: string[];
  wrongQuestionIds: string[];
  questions: ExamQuestion[];
  savedTrapIds: string[];
  onFinish: () => void;
  onRetryMistakes: () => void;
  onResetQuiz: () => void;
  onSaveTrap: (q: ExamQuestion) => void;
  skillFactors: {
    syntax: number;
    tenses: number;
    morphology: number;
    modality: number;
  };
}

export const QuizCompletionStats: FC<QuizCompletionStatsProps> = ({
  proficiency,
  xpEarned,
  medalIcon,
  medalName,
  medalColor,
  weakSkills,
  wrongQuestionIds,
  questions,
  savedTrapIds,
  onFinish,
  onRetryMistakes,
  onResetQuiz,
  onSaveTrap,
  skillFactors,
}) => {
  return (
    <div className="max-w h-full mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left panel: Stats & Reward Card */}
        <div className="flex-1 space-y-6 text-center lg:text-left w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                {GRAMMAR_UI_TEXT.assessmentQuiz.quizTitle}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">
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
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                {GRAMMAR_UI_TEXT.assessmentQuiz.awardLabel}
              </span>
              <h4 className="text-base font-extrabold text-foreground">
                {medalName}
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {GRAMMAR_UI_TEXT.assessmentQuiz.awardDesc.split('**{proficiency}%**')[0]}
                <strong>{proficiency}%</strong>
                {GRAMMAR_UI_TEXT.assessmentQuiz.awardDesc.split('**{proficiency}%**')[1]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-muted/30 border border-border rounded-xl p-3">
              <span className="text-[10px] font-bold text-muted-foreground block uppercase">
                {GRAMMAR_UI_TEXT.assessmentQuiz.xpBonus}
              </span>
              <span className="text-base font-black text-primary">
                +{xpEarned} XP
              </span>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl p-3">
              <span className="text-[10px] font-bold text-muted-foreground block uppercase">
                {GRAMMAR_UI_TEXT.assessmentQuiz.lessonState}
              </span>
              <span className="text-base font-black text-emerald-500 flex items-center justify-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {proficiency >= 80 ? GRAMMAR_UI_TEXT.assessmentQuiz.masteredState : GRAMMAR_UI_TEXT.assessmentQuiz.needsReviewState}
              </span>
            </div>
          </div>

          {/* Diagnostic Card */}
          {weakSkills.length > 0 ? (
            <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 text-left space-y-2 animate-fadeIn">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                {GRAMMAR_UI_TEXT.assessmentQuiz.diagnosticLabel}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {GRAMMAR_UI_TEXT.assessmentQuiz.diagnosticDesc.split('{skills}')[0]}
                <span className="text-primary font-extrabold">
                  {weakSkills.join(', ')}
                </span>
                {GRAMMAR_UI_TEXT.assessmentQuiz.diagnosticDesc.split('{skills}')[1]}
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-left space-y-2 animate-fadeIn">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">
                {GRAMMAR_UI_TEXT.assessmentQuiz.perfectLabel}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {GRAMMAR_UI_TEXT.assessmentQuiz.perfectDesc}
              </p>
            </div>
          )}

          {/* Actions panel */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onFinish}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 text-primary-foreground font-extrabold py-3.5 rounded-xl border-none shadow-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
            >
              <Home className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnBackToRoadmap}
            </Button>
            {wrongQuestionIds.length > 0 ? (
              <Button
                onClick={onRetryMistakes}
                className="bg-destructive hover:bg-destructive/90 text-white font-extrabold py-3.5 px-6 rounded-xl border-none shadow-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
              >
                <AlertTriangle className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnRetryMistakes}
              </Button>
            ) : (
              <Button
                onClick={onResetQuiz}
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 text-xs py-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnPracticeMore}
              </Button>
            )}
          </div>

          {/* Detailed Wrong Answers */}
          <WrongAnswersList
            wrongQuestionIds={wrongQuestionIds}
            questions={questions}
            savedTrapIds={savedTrapIds}
            onSaveTrap={onSaveTrap}
          />
        </div>

        {/* Right panel: Custom SVG Radar Chart */}
        <div className="w-64 h-64 bg-muted/30 border border-border rounded-3xl p-5 flex flex-col items-center justify-center gap-3 relative shadow-inner lg:sticky lg:top-6">
          <span className="text-[9px] font-extrabold text-muted-foreground tracking-wider uppercase block">
            {GRAMMAR_UI_TEXT.assessmentQuiz.abilityChart}
          </span>
          <div className="relative h-44 w-44">
            <DiagnosticRadarChart skillFactors={skillFactors} />
          </div>
        </div>
      </div>
    </div>
  );
};
