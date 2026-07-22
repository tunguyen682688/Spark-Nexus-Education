import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../api/certification-api';

export const useCertificationDashboard = () => {
  return useQuery({
    queryKey: ['certification', 'dashboard'],
    queryFn: () => CertificationApi.getDashboardStats()
  });
};

export const useFeaturedCollections = (exam?: string, search?: string) => {
  return useQuery({
    queryKey: ['certification', 'featured', exam, search],
    queryFn: () => CertificationApi.getFeaturedCollections(exam, search)
  });
};

export const useTrendingCollections = () => {
  return useQuery({
    queryKey: ['certification', 'trending'],
    queryFn: () => CertificationApi.getTrendingCollections()
  });
};

export const useOfficialCollections = () => {
  return useQuery({
    queryKey: ['certification', 'official'],
    queryFn: () => CertificationApi.getOfficialCollections()
  });
};

export const useCommunityCollections = () => {
  return useQuery({
    queryKey: ['certification', 'community'],
    queryFn: () => CertificationApi.getCommunityCollections()
  });
};

export const useStudyPlan = () => {
  return useQuery({
    queryKey: ['certification', 'study-plan'],
    queryFn: () => CertificationApi.getStudyPlan()
  });
};

export const useTopContributors = () => {
  return useQuery({
    queryKey: ['certification', 'top-contributors'],
    queryFn: () => CertificationApi.getTopContributors()
  });
};
