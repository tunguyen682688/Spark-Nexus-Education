import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface ExamResultScoreHeroProps {
  examTitle?: string;
  score?: string | number;
  maxScore?: string;
  onRetake?: () => void;
  onBackToDashboard?: () => void;
}

export function ExamResultScoreHero({
  examTitle,
  score,
  maxScore = '9.0',
  onRetake,
  onBackToDashboard,
}: ExamResultScoreHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-700 text-white p-8 text-center shadow-xl space-y-4">
      <Badge className="bg-white/20 text-white border-none text-xs font-bold py-1 px-3">
        <Trophy className="w-4 h-4 mr-1 text-amber-300" /> {CERTIFICATION_UI_TEXT.examResult.scorecardBadge}
      </Badge>

      <h1 className="text-3xl font-extrabold tracking-tight">
        {examTitle || CERTIFICATION_UI_TEXT.examResult.defaultTitle}
      </h1>

      <div className="flex justify-center items-baseline gap-2 pt-2">
        <span className="text-5xl font-black text-amber-300">
          {score ?? '—'}
        </span>
        <span className="text-sm font-semibold text-emerald-100">
          / {maxScore} {CERTIFICATION_UI_TEXT.examResult.bandScoreLabel}
        </span>
      </div>

      <p className="text-xs text-emerald-100 font-medium max-w-md mx-auto">
        {CERTIFICATION_UI_TEXT.examResult.congratulations}
      </p>

      <div className="pt-4 flex items-center justify-center gap-3">
        {onRetake && (
          <Button
            onClick={onRetake}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> {CERTIFICATION_UI_TEXT.examResult.retakeExam}
          </Button>
        )}
        {onBackToDashboard && (
          <Button
            onClick={onBackToDashboard}
            className="bg-white text-indigo-700 hover:bg-blue-50 text-xs font-bold py-2.5 px-5 rounded-xl shadow-md cursor-pointer"
          >
            {CERTIFICATION_UI_TEXT.examResult.backToDashboard} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
