import { useListeningStudyDashboard } from '../hooks';
import {
  ArrowLeft,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { StudyDashboardMaterialInfo } from '../components/StudyDashboardMaterialInfo';
import { StudyDashboardProgress } from '../components/StudyDashboardProgress';
import { StudyDashboardWorkspaces } from '../components/StudyDashboardWorkspaces';
import { LISTENING_DASHBOARD_TEXT, LISTENING_ROUTES } from '../constants';

export default function ListeningStudyDashboardContainer() {
  const {
    navigate,
    material,
    isLoading,
    error,
    isBookmarked,
    handleToggleBookmark,
    handleVote,
    getCategoryLabel,
    getDifficultyColor,
    formatDuration,
  } = useListeningStudyDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-sm font-medium animate-pulse">
          {LISTENING_DASHBOARD_TEXT.LOADING_MATERIAL}
        </p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <Info className="w-12 h-12 text-red-500/80 mb-3" />
        <h2 className="text-lg font-bold">{LISTENING_DASHBOARD_TEXT.ERROR_NOT_FOUND_TITLE}</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          {LISTENING_DASHBOARD_TEXT.ERROR_NOT_FOUND_DESC}
        </p>
        <button
          onClick={() => navigate(LISTENING_ROUTES.HUB)}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-slate-200 rounded-xl text-xs font-bold transition-all"
        >
          {LISTENING_DASHBOARD_TEXT.BACK_TO_HOME}
        </button>
      </div>
    );
  }

  const hasQuestions = (material.questions?.length ?? 0) > 0;
  const progressPercent = material.userProgress?.progress || 0;

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col p-6 sm:p-8">
      <div className="max-w-full mx-auto w-full space-y-6">
        {/* Header Back Link */}
        <Button
          onClick={() => navigate(LISTENING_ROUTES.HUB)}
          className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-slate-250 transition-colors w-fit bg-slate-900/60 border border-slate-850 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          {LISTENING_DASHBOARD_TEXT.BACK_TO_LIST}
        </Button>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Material details */}
          <StudyDashboardMaterialInfo
            material={material}
            isBookmarked={isBookmarked}
            handleToggleBookmark={handleToggleBookmark}
            handleVote={handleVote}
            getCategoryLabel={getCategoryLabel}
            getDifficultyColor={getDifficultyColor}
            formatDuration={formatDuration}
          />

          {/* Right Column: Progress & Workspaces */}
          <div className="space-y-6">
            <StudyDashboardProgress
              progressPercent={progressPercent}
              timeSpent={material.userProgress?.timeSpent || 0}
              sentenceCount={material.subtitles?.length || 0}
            />

            <StudyDashboardWorkspaces
              materialId={material.id}
              hasQuestions={hasQuestions}
              questionCount={material.questions?.length || 0}
              onNavigate={navigate}
              vocabularySetId={material.vocabularySetId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
