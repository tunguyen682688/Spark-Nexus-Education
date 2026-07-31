import { Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useDashboardContainerLogic } from '../../hooks/container-logic/dashboard/use-dashboard-container-logic';
import { DashboardHeroBanner } from '../../components/dashboard/DashboardHeroBanner';
import { DashboardStatsGrid } from '../../components/dashboard/DashboardStatsGrid';
import { DashboardPopularExamsPills } from '../../components/dashboard/DashboardPopularExamsPills';
import { DashboardStudyPlanCard } from '../../components/dashboard/DashboardStudyPlanCard';
import { CardSkeleton, ListSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationDashboardContainer = () => {
  const {
    selectedExamType,
    setSelectedExamType,
    dashboardData,
    featuredCollections,
    studyPlan,
    topContributors,
    stats,
    isLoadingDashboard,
    isErrorDashboard,
    errorDashboard,
    refetchDashboard,
    isLoadingFeatured,
    isLoadingStudyPlan,
    handleExploreCollection,
    handleExploreLibrary,
    handleSelectCollection,
  } = useDashboardContainerLogic();

  // Error State Handler
  if (isErrorDashboard) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <ErrorState
            onRetry={refetchDashboard}
            message={
              errorDashboard instanceof Error
                ? errorDashboard.message
                : CERTIFICATION_UI_TEXT.error.dashboard
            }
          />
        </div>
      </div>
    );
  }

  // Full Page Skeleton Loading State
  if (isLoadingDashboard && !dashboardData) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <ListSkeleton />
            <ListSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12">
      {/* 1. HERO BANNER */}
      <DashboardHeroBanner
        dashboardData={dashboardData}
        selectedExamType={selectedExamType}
        topStudentName={topContributors[0]?.name}
        onExploreCollection={handleExploreCollection}
        onExploreLibrary={handleExploreLibrary}
      />

      {/* 2. STATS ROW */}
      <DashboardStatsGrid stats={stats} />

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Popular Exams & Featured Practice Collections */}
        <div className="xl:col-span-2 space-y-6">
          {/* POPULAR EXAMS SELECTOR */}
          <DashboardPopularExamsPills
            selectedExamType={selectedExamType}
            onSelectExamType={setSelectedExamType}
          />

          {/* DYNAMIC FEATURED PRACTICE COLLECTIONS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                {CERTIFICATION_UI_TEXT.dashboard.featuredCollectionsTitle} (
                {selectedExamType})
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </h3>
            </div>

            {isLoadingFeatured ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : featuredCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredCollections.slice(0, 4).map((collection) => (
                  <Card
                    key={collection.id}
                    onClick={() => handleSelectCollection(collection.id)}
                    className="hover:shadow-md transition-all duration-300 border-border group relative overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-none font-bold">
                          {collection.exam || selectedExamType}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <span role="img" aria-label="rating star">
                            ⭐
                          </span>{' '}
                          {collection.rating || '4.9'} (
                          {collection.reviews || '1.2k'})
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {collection.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {collection.desc ||
                            collection.subtitle ||
                            CERTIFICATION_UI_TEXT.dashboard.defaultCollectionDesc}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{' '}
                          {collection.duration || CERTIFICATION_UI_TEXT.dashboard.defaultDuration}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 p-0 h-auto"
                        >
                          {CERTIFICATION_UI_TEXT.common.viewCollection} &rarr;
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                {CERTIFICATION_UI_TEXT.dashboard.noFeaturedMatch}
              </div>
            )}
          </div>

          {/* DYNAMIC STUDY PLAN SCHEDULE */}
          <DashboardStudyPlanCard
            studyPlan={studyPlan}
            isLoading={isLoadingStudyPlan}
          />
        </div>

        {/* RIGHT COLUMN: Top Contributors & Leaderboard */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-base font-bold">
                  {CERTIFICATION_UI_TEXT.dashboard.topContributorsTitle}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {CERTIFICATION_UI_TEXT.dashboard.topContributorsDesc}
                </p>
              </div>

              {topContributors.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  {CERTIFICATION_UI_TEXT.dashboard.emptyState.noTopContributors}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {topContributors.slice(0, 5).map((contributor) => (
                    <div
                      key={contributor.rank}
                      className="flex justify-between items-center py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                          #{contributor.rank}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {contributor.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {contributor.details}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {contributor.points} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
