import { RotateCcw, CheckCircle, PlayCircle, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import { useStudyPlanContainerLogic } from '../../hooks/container-logic/learning/use-study-plan-container-logic';
import { StudyPlanStatsGrid } from '../../components/learning/StudyPlanStatsGrid';
import { StudyPlanFocusCards } from '../../components/learning/StudyPlanFocusCards';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface CertificationStudyPlanContainerProps {
  onStartExam?: (examId: string) => void;
}

export const CertificationStudyPlanContainer = ({ onStartExam }: 
  CertificationStudyPlanContainerProps
) => {
  const {
    planDays,
    completedTasks,
    topStats,
    focusCards,
    isLoading,
    isError,
    error,
    refetch,
    isStartingExam,
    toggleTask,
    handleStartExam,
  } = useStudyPlanContainerLogic(onStartExam);

  if (isError) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <ErrorState
            onRetry={refetch}
            message={
              error instanceof Error
                ? error.message
                : CERTIFICATION_UI_TEXT.error.dashboard
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            {CERTIFICATION_UI_TEXT.studyPlan.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {CERTIFICATION_UI_TEXT.studyPlan.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-border text-xs flex items-center gap-1.5 py-2 px-3 rounded-xl bg-card cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {CERTIFICATION_UI_TEXT.studyPlan.refreshRoadmap}
          </Button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <StudyPlanStatsGrid stats={topStats} />

      {/* 3. FOCUS SKILLS CARDS */}
      <StudyPlanFocusCards cards={focusCards} />

      {/* 4. DYNAMIC STUDY PLAN ROADMAP SCHEDULE */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            {CERTIFICATION_UI_TEXT.studyPlan.weeklyRoadmapTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton />
          ) : planDays.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              {CERTIFICATION_UI_TEXT.studyPlan.emptyState}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {planDays.map((item, idx) => {
                const dayKey = item.day || `day-${idx}`;
                const isDone = completedTasks[dayKey] ?? item.completed;
                return (
                  <div
                    key={dayKey}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(dayKey)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-indigo-500'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-4 h-4 fill-current" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-600">
                            {item.day}
                          </span>
                          <span
                            className={`text-xs font-extrabold ${
                              isDone
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.topic} &bull; {item.duration}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        disabled={isStartingExam}
                        onClick={() => handleStartExam(`plan-exam-${idx}`)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {isStartingExam ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <PlayCircle className="w-3 h-3" />
                        )}
                        {CERTIFICATION_UI_TEXT.studyPlan.startTaskBtn}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
