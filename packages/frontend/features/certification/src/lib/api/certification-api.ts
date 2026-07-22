import type { 
  ExamCollection, 
  DashboardStats, 
  StudyPlanDay, 
  Contributor 
} from '../types';
import {
  DEFAULT_DASHBOARD_STATS,
  FEATURED_COLLECTIONS,
  TRENDING_COLLECTIONS,
  OFFICIAL_COLLECTIONS,
  COMMUNITY_COLLECTIONS,
  STUDY_PLAN_DAYS,
  TOP_CONTRIBUTORS
} from '../constants/certification.constants';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CertificationApi {
  static async getDashboardStats(): Promise<DashboardStats> {
    await delay(500);
    return DEFAULT_DASHBOARD_STATS;
  }

  static async getFeaturedCollections(exam?: string, search?: string): Promise<ExamCollection[]> {
    await delay(600);
    return FEATURED_COLLECTIONS.filter(item => {
      const matchExam = !exam || exam === 'All' || item.exam.toUpperCase() === exam.toUpperCase();
      const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
      return matchExam && matchSearch;
    });
  }

  static async getTrendingCollections(): Promise<ExamCollection[]> {
    await delay(500);
    return TRENDING_COLLECTIONS;
  }

  static async getOfficialCollections(): Promise<ExamCollection[]> {
    await delay(500);
    return OFFICIAL_COLLECTIONS;
  }

  static async getCommunityCollections(): Promise<ExamCollection[]> {
    await delay(500);
    return COMMUNITY_COLLECTIONS;
  }

  static async getStudyPlan(): Promise<StudyPlanDay[]> {
    await delay(500);
    return STUDY_PLAN_DAYS;
  }

  static async getTopContributors(): Promise<Contributor[]> {
    await delay(400);
    return TOP_CONTRIBUTORS;
  }
}
