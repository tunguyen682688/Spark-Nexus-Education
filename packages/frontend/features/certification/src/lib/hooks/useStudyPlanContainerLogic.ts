import { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Headphones,
  GraduationCap,
  LucideIcon,
} from 'lucide-react';
import {
  useStudyPlan,
  useStartExamSession,
  useCertificationDashboard,
} from './use-certification';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

export interface StudyPlanTopStat {
  label: string;
  val: string;
  sub: string;
  color: string;
}

export interface StudyPlanFocusCard {
  label: string;
  title: string;
  desc: string;
  val: string;
  color: string;
  icon: LucideIcon;
  iconBg: string;
}

export function useStudyPlanContainerLogic(
  onStartExam?: (examId: string) => void
) {
  const {
    data: planDays = [],
    isLoading: isLoadingPlan,
    isError: isErrorPlan,
    error: errorPlan,
    refetch: refetchPlan,
  } = useStudyPlan();

  const { data: dashboardData } = useCertificationDashboard();

  const { mutate: startExam, isPending: isStartingExam } = useStartExamSession();

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (dayKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const handleStartExam = (examId: string) => {
    if (onStartExam) {
      onStartExam(examId);
    } else {
      startExam(examId);
    }
  };

  const topStats: StudyPlanTopStat[] = [
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.stats.currentScore,
      val: dashboardData?.scorePrediction || '--',
      sub: dashboardData?.targetExam || CERTIFICATION_UI_TEXT.studyPlan.stats.subtitles.ieltsOverall,
      color: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.stats.targetScore,
      val: dashboardData?.targetScore || '--',
      sub: CERTIFICATION_UI_TEXT.studyPlan.stats.subtitles.targetBand,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.stats.confidence,
      val: dashboardData?.accuracy || '--',
      sub: CERTIFICATION_UI_TEXT.studyPlan.stats.subtitles.highMatch,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.stats.estimatedTime,
      val: dashboardData?.daysRemaining ? `${dashboardData.daysRemaining} days` : '--',
      sub: CERTIFICATION_UI_TEXT.studyPlan.stats.subtitles.reachTarget,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.stats.dailyStudyTime,
      val: dashboardData?.timeSpent || '--',
      sub: CERTIFICATION_UI_TEXT.studyPlan.stats.subtitles.recommended,
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const focusCards: StudyPlanFocusCard[] = [
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.focusCards.weakestSkill,
      title: CERTIFICATION_UI_TEXT.studyPlan.skills.reading,
      desc: CERTIFICATION_UI_TEXT.studyPlan.focusCards.weakestDesc,
      val: dashboardData?.accuracy ? `${dashboardData.accuracy}` : '--',
      color: 'bg-rose-500',
      icon: BookOpen,
      iconBg: 'bg-rose-50 text-rose-500 dark:bg-rose-950/20',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.focusCards.strongestSkill,
      title: CERTIFICATION_UI_TEXT.studyPlan.skills.listening,
      desc: CERTIFICATION_UI_TEXT.studyPlan.focusCards.strongestDesc,
      val: dashboardData?.accuracy ? `${dashboardData.accuracy}` : '--',
      color: 'bg-emerald-500',
      icon: Headphones,
      iconBg: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.focusCards.learningPriority,
      title: CERTIFICATION_UI_TEXT.studyPlan.skills.vocabulary,
      desc: CERTIFICATION_UI_TEXT.studyPlan.focusCards.priorityDesc,
      val: dashboardData?.completedMocks ? `${dashboardData.completedMocks}` : '--',
      color: 'bg-purple-500',
      icon: Sparkles,
      iconBg: 'bg-purple-50 text-purple-500 dark:bg-purple-950/20',
    },
    {
      label: CERTIFICATION_UI_TEXT.studyPlan.focusCards.urgentReview,
      title: CERTIFICATION_UI_TEXT.studyPlan.skills.grammar,
      desc: CERTIFICATION_UI_TEXT.studyPlan.focusCards.reviewDesc,
      val: dashboardData?.daysRemaining ? `${dashboardData.daysRemaining} days` : '--',
      color: 'bg-amber-500',
      icon: GraduationCap,
      iconBg: 'bg-amber-50 text-amber-500 dark:bg-amber-950/20',
    },
  ];

  return {
    planDays,
    completedTasks,
    topStats,
    focusCards,
    isLoading: isLoadingPlan,
    isError: isErrorPlan,
    error: errorPlan,
    refetch: refetchPlan,
    isStartingExam,
    toggleTask,
    handleStartExam,
  };
}
