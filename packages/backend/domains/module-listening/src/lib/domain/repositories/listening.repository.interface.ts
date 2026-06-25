import {
  ListeningMaterial,
  ListeningProgress,
  ListeningVote,
  UserListeningBookmark,
  UserListeningStats,
  ListeningSession,
  ListeningSubtitle,
  ListeningQuestion
} from '@prisma/client';
import { GetListeningMaterialsQueryDto } from '../../application/dtos/get-materials-query.dto';
import { CreateListeningMaterialDto } from '../../application/dtos/create-material.dto';

export const LISTENING_REPOSITORY = Symbol('LISTENING_REPOSITORY');

export interface ListeningMaterialWithProgress extends ListeningMaterial {
  progress: number;
  lastPosition: number;
  timeSpent: number;
  completedAt: Date | null;
  isBookmarked: boolean;
}

export interface ListeningMaterialDetail extends ListeningMaterial {
  subtitles: ListeningSubtitle[];
  questions: ListeningQuestion[];
  userProgress?: {
    progress: number;
    lastPosition: number;
    timeSpent: number;
    completedAt: Date | null;
  } | null;
  isBookmarked: boolean;
  userVote: number;
}

export interface ListeningLeaderboardEntry {
  userId: string;
  totalTime: number;
  masteryLevel: string;
  userName: string;
  userPicture: string | null;
}

export interface UserListeningStatsWithStreak {
  totalMaterials: number;
  totalTime: number;
  masteryLevel: string;
  streak: number;
}

export interface IListeningRepository {
  findMaterials(
    queryParams: GetListeningMaterialsQueryDto,
    userId?: string
  ): Promise<{
    data: ListeningMaterialWithProgress[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;

  findMaterialById(id: string, userId?: string): Promise<ListeningMaterialDetail | null>;

  incrementViewCount(id: string): Promise<void>;

  findMaterialRawById(id: string): Promise<ListeningMaterial | null>;

  findProgress(userId: string, materialId: string): Promise<ListeningProgress | null>;

  upsertProgress(
    userId: string,
    materialId: string,
    data: {
      progress: number;
      lastPosition: number;
      timeSpent: number;
      completedAt: Date | null;
    }
  ): Promise<ListeningProgress>;

  findAllProgressByUserId(userId: string): Promise<ListeningProgress[]>;

  upsertUserStats(
    userId: string,
    totalMaterials: number,
    totalTime: number
  ): Promise<UserListeningStats>;

  createSession(
    userId: string,
    materialId: string,
    duration: number
  ): Promise<ListeningSession>;

  findBookmark(userId: string, materialId: string): Promise<UserListeningBookmark | null>;

  createBookmark(userId: string, materialId: string): Promise<UserListeningBookmark>;

  deleteBookmark(userId: string, materialId: string): Promise<void>;

  findVote(userId: string, materialId: string): Promise<ListeningVote | null>;

  createVote(userId: string, materialId: string, vote: number): Promise<ListeningVote>;

  updateVote(userId: string, materialId: string, vote: number): Promise<ListeningVote>;

  deleteVote(userId: string, materialId: string): Promise<void>;

  countVotes(materialId: string, voteValue: number): Promise<number>;

  updateMaterialVotes(
    materialId: string,
    upvotes: number,
    downvotes: number
  ): Promise<ListeningMaterial>;

  createMaterial(
    dto: CreateListeningMaterialDto,
    creatorId: string
  ): Promise<ListeningMaterial & { subtitles: ListeningSubtitle[]; questions: ListeningQuestion[] }>;

  findUserStats(userId: string): Promise<UserListeningStatsWithStreak | null>;

  findWeeklyActivity(userId: string): Promise<{ day: string; minutes: number }[]>;

  findLeaderboard(limit?: number): Promise<ListeningLeaderboardEntry[]>;
}
