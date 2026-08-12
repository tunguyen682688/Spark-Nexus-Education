import type { DashboardStats, StudyPlanDay, Contributor, CreatorDashboardResponse } from '../types';
import { getAxiosInstance, unwrapJsonApiResponse } from './api-helpers';

export class DashboardApi {
  static async getDashboardStats(): Promise<DashboardStats> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/dashboard');
    return unwrapJsonApiResponse<DashboardStats>(response.data);
  }

  static async getCreatorDashboardData(): Promise<CreatorDashboardResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/creator-dashboard');
    return unwrapJsonApiResponse<CreatorDashboardResponse>(response.data);
  }

  static async getStudyPlan(): Promise<StudyPlanDay[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/study-plan');
    const data = unwrapJsonApiResponse<{ tasks?: StudyPlanDay[] }>(response.data);
    if (data && Array.isArray(data.tasks)) {
      return data.tasks;
    }
    if (Array.isArray(data)) {
      return data as unknown as StudyPlanDay[];
    }
    return [];
  }

  static async getTopContributors(): Promise<Contributor[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/contributors/top');
    const data = unwrapJsonApiResponse<{ contributors?: Contributor[] }>(response.data);
    if (data && Array.isArray(data.contributors)) {
      return data.contributors;
    }
    if (Array.isArray(data)) {
      return data as unknown as Contributor[];
    }
    return [];
  }
}
