import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_DASHBOARD, STALE_TIME_COLLECTIONS } from './use-query-constants';
import type { DashboardStats, StudyPlanDay, Contributor, CreatorDashboardResponse } from '../../types';

export const useCertificationDashboard = () => {
  return useQuery<DashboardStats>({
    queryKey: ['certification', 'dashboard'],
    queryFn: () => CertificationApi.getDashboardStats(),
    staleTime: STALE_TIME_DASHBOARD,
    refetchOnWindowFocus: false,
  });
};

export const useCreatorDashboardData = () => {
  return useQuery<CreatorDashboardResponse>({
    queryKey: ['certification', 'creator-dashboard'],
    queryFn: () => CertificationApi.getCreatorDashboardData(),
    staleTime: STALE_TIME_DASHBOARD,
    refetchOnWindowFocus: false,
  });
};

export const useStudyPlan = () => {
  return useQuery<StudyPlanDay[]>({
    queryKey: ['certification', 'study-plan'],
    queryFn: () => CertificationApi.getStudyPlan(),
    staleTime: STALE_TIME_DASHBOARD,
    refetchOnWindowFocus: false,
  });
};

export const useTopContributors = () => {
  return useQuery<Contributor[]>({
    queryKey: ['certification', 'top-contributors'],
    queryFn: () => CertificationApi.getTopContributors(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};
