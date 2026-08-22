import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface ExamSessionHeaderProps {
  examTitle?: string;
  tabViolations: number;
  isSubmitting: boolean;
  remainingSeconds: number;
  currentQuestion: number;
  totalQuestions: number;
  onExit?: () => void;
  onSubmit: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ExamSessionHeader({
  examTitle,
  tabViolations,
  isSubmitting,
  remainingSeconds,
  currentQuestion,
  totalQuestions,
  onExit,
  onSubmit,
}: ExamSessionHeaderProps) {
  const isLowTime = remainingSeconds > 0 && remainingSeconds <= 300;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3">
        {onExit && (
          <Button
            onClick={onExit}
            variant="outline"
            size="sm"
            className="text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {CERTIFICATION_UI_TEXT.examSession.exit}
          </Button>
        )}
        <div className="space-y-0.5">
          <h2 className="text-sm font-black">
            {examTitle || CERTIFICATION_UI_TEXT.examSession.defaultTitle}
          </h2>
          <p className="text-[10px] text-muted-foreground font-semibold">
            Question {currentQuestion} of {totalQuestions}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {tabViolations > 0 && (
          <Badge variant="destructive" className="text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3 mr-1" /> {tabViolations} {CERTIFICATION_UI_TEXT.examSession.tabWarning}
          </Badge>
        )}

        <div className={`flex items-center gap-1.5 font-bold text-xs py-1.5 px-3 rounded-lg ${
          isLowTime
            ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 animate-pulse'
            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTime(remainingSeconds)}</span>
        </div>

        <Button
          disabled={isSubmitting}
          onClick={onSubmit}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
        >
          {CERTIFICATION_UI_TEXT.examSession.submitExam}
        </Button>
      </div>
    </div>
  );
}
