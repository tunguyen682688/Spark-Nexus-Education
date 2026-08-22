import { Clock, HelpCircle, Trophy, ArrowRight, PlayCircle, RefreshCw } from 'lucide-react';
import { Badge, Button } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface ExamDetailBannerProps {
  code?: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  isStarting: boolean;
  onStartExam: () => void;
}

export function ExamDetailBanner({
  code,
  title,
  description,
  durationMinutes = 120,
  passingScore,
  isStarting,
  onStartExam,
}: ExamDetailBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 md:p-10 shadow-xl">
      <div className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-xs font-bold">
            {code || 'EXAM'}
          </Badge>
          <Badge className="bg-emerald-500 text-white border-none text-xs font-bold">
            Official Pattern
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>

        <p className="text-sm text-blue-100 font-light max-w-2xl">
          {description ||
            'Full-length official mock test with instant AI scoring, section analytics, and detailed corrections.'}
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-blue-100 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {durationMinutes} Minutes
          </span>
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            {passingScore ? `Pass score: ${passingScore}` : 'Full Practice'}
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-300" />
            Target Score: {passingScore || 'Band 7.0+'}
          </span>
        </div>

        <div className="pt-4">
          <Button
            disabled={isStarting}
            onClick={onStartExam}
            className="bg-white text-indigo-700 hover:bg-blue-50 font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-base"
          >
            {isStarting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {CERTIFICATION_UI_TEXT.loading.session}
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" />
                Start Full Mock Exam Now
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
