import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, Trophy, Target, ShieldCheck } from 'lucide-react';
import {
  useCertificationDashboard,
  useFeaturedCollections,
  useStudyPlan,
  useTopContributors,
} from '../../use-certification';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { DashboardStatCard } from '../../../types/container-logic-dashboard.types';

export type { DashboardStatCard } from '../../../types/container-logic-dashboard.types';

export function useDashboardContainerLogic() {
  const navigate = useNavigate();
  const [selectedExamType, setSelectedExamType] = useState<string>('TOEIC');

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
    error: errorDashboard,
    refetch: refetchDashboard,
  } = useCertificationDashboard();

  const {
    data: featuredCollections = [],
    isLoading: isLoadingFeatured,
  } = useFeaturedCollections(selectedExamType);

  const {
    data: studyPlan = [],
    isLoading: isLoadingStudyPlan,
  } = useStudyPlan();

  const {
    data: topContributors = [],
  } = useTopContributors();

  const stats: DashboardStatCard[] = [
    {
      title: CERTIFICATION_UI_TEXT.dashboard.statsTitles.estimatedScore,
      value: dashboardData?.scorePrediction || '--',
      subtitle: dashboardData?.targetExam || selectedExamType,
      change: dashboardData?.targetScore
        ? `${CERTIFICATION_UI_TEXT.dashboard.statsBadges.targetLabel}: ${dashboardData.targetScore}`
        : CERTIFICATION_UI_TEXT.common.noData,
      trend: 'up',
      icon: Trophy,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.dashboard.statsTitles.accuracy,
      value: dashboardData?.accuracy || '--',
      subtitle: CERTIFICATION_UI_TEXT.dashboard.statsSubtitles.recentTests,
      change: CERTIFICATION_UI_TEXT.dashboard.statsBadges.active,
      trend: 'up',
      icon: Target,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.dashboard.statsTitles.studyTime,
      value: dashboardData?.timeSpent || '--',
      subtitle: CERTIFICATION_UI_TEXT.dashboard.statsSubtitles.accumulated,
      change: CERTIFICATION_UI_TEXT.dashboard.statsBadges.updated,
      trend: 'up',
      icon: Clock,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.dashboard.statsTitles.testsCompleted,
      value: dashboardData?.completedMocks || '--',
      subtitle: CERTIFICATION_UI_TEXT.dashboard.statsSubtitles.totalMocks,
      change: CERTIFICATION_UI_TEXT.dashboard.statsBadges.completed,
      trend: 'up',
      icon: ShieldCheck,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.dashboard.statsTitles.daysRemaining,
      value: dashboardData?.daysRemaining
        ? `${dashboardData.daysRemaining} ${CERTIFICATION_UI_TEXT.dashboard.statsBadges.daysSuffix}`
        : '--',
      subtitle: CERTIFICATION_UI_TEXT.dashboard.statsSubtitles.countdown,
      change: CERTIFICATION_UI_TEXT.dashboard.statsBadges.schedule,
      trend: 'neutral',
      icon: Award,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  const handleExploreCollection = () => {
    if (featuredCollections.length > 0 && featuredCollections[0].id) {
      navigate(`/certification/collections/${featuredCollections[0].id}`);
    } else {
      navigate('/certification/exams');
    }
  };

  const handleExploreLibrary = () => {
    navigate('/certification/exams');
  };

  const handleSelectCollection = (collectionId: string) => {
    navigate(`/certification/collections/${collectionId}`);
  };

  return {
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
  };
}
