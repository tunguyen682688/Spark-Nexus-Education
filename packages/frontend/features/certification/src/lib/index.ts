/**
 * Certification Exam Platform Feature Module
 */
export const FEATURE_NAME = 'certification';

export { CertificationDashboardPage } from './pages/CertificationDashboardPage';
export { CertificationExamsPage } from './pages/CertificationExamsPage';
export { CertificationStudyPlanPage } from './pages/CertificationStudyPlanPage';
export { CertificationEditorialPicksPage } from './pages/CertificationEditorialPicksPage';
export { CertificationSearchPage } from './pages/CertificationSearchPage';
export { CertificationTrendingPage } from './pages/CertificationTrendingPage';
export { CertificationOfficialPage } from './pages/CertificationOfficialPage';
export { CertificationCommunityPage } from './pages/CertificationCommunityPage';
export * from './hooks/use-certification';
export * from './types';
export * from './constants/certification.constants';
export * from './components/ErrorState';
export * from './components/LoadingSkeleton';
export * from './components/FeaturedCollectionCard';
export * from './components/TrendingCollectionCard';
export * from './components/OfficialCollectionCard';
export * from './components/CommunityCollectionCard';
export * from './container';
