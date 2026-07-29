import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  HelpCircle,
  Trophy,
  ArrowRight,
  PlayCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import {
  useExamDetail,
  useStartExamSession,
} from '../../hooks/use-certification';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface CertificationExamDetailContainerProps {
  examId?: string;
  onSessionStarted?: (sessionId: string) => void;
}

export const CertificationExamDetailContainer = ({ examId = 'default-exam', onSessionStarted }: 
  CertificationExamDetailContainerProps
) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/certification');
    }
  };

  const {
    data: exam,
    isLoading,
    isError,
    error,
    refetch,
  } = useExamDetail(examId);
  const { mutate: startExam, isPending: isStarting } = useStartExamSession();

  const handleStartExam = () => {
    startExam(examId, {
      onSuccess: (session) => {
        if (onSessionStarted) {
          onSessionStarted(session.id);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="w-full py-12 flex flex-col items-center gap-4 max-w-xl mx-auto">
        <button
          onClick={handleBack}
          className="self-start inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
        <ErrorState
          onRetry={refetch}
          message={
            error instanceof Error
              ? error.message
              : CERTIFICATION_UI_TEXT.error.exam
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* 1. EXAM BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 md:p-10 shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-xs font-bold">
              {exam.code || 'EXAM'}
            </Badge>
            <Badge className="bg-emerald-500 text-white border-none text-xs font-bold">
              Official Pattern
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            {exam.title}
          </h1>

          <p className="text-sm text-blue-100 font-light max-w-2xl">
            {exam.description ||
              'Full-length official mock test with instant AI scoring, section analytics, and detailed corrections.'}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-blue-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {exam.durationMinutes || 120} Minutes
            </span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              {exam.passingScore
                ? `Pass score: ${exam.passingScore}`
                : 'Full Practice'}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-300" />
              Target Score: {exam.passingScore || 'Band 7.0+'}
            </span>
          </div>

          <div className="pt-4">
            <Button
              disabled={isStarting}
              onClick={handleStartExam}
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

      {/* 2. EXAM SECTIONS BREAKDOWN */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Exam Sections Breakdown
          </CardTitle>
          <CardDescription>
            Review the structure and question count before starting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exam.sections && exam.sections.length > 0 ? (
            <div className="divide-y divide-border">
              {exam.sections.map((section, idx) => (
                <div
                  key={section.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-sm text-foreground">
                        {section.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground pl-8">
                      {section.instructions ||
                        section.description ||
                        'Answer all questions carefully within the allocated section time.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pl-8 sm:pl-0">
                    <Badge variant="outline" className="text-xs font-semibold">
                      <Clock className="w-3 h-3 mr-1" />
                      {section.durationMinutes || 30} mins
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      {section.questions?.length || 10} Questions
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              Standard exam structure with 4 full sections (Listening, Reading,
              Writing, Speaking).
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. RULES & PROCTORING NOTICE */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h5 className="font-extrabold text-amber-900 dark:text-amber-300">
              Exam Proctoring & Anti-Cheat Rules
            </h5>
            <p className="text-amber-800 dark:text-amber-400">
              Do not switch browser tabs or leave full screen mode during the
              session. Unsaved answers will be autosaved in real time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
