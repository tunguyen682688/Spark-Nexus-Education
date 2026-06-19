export interface ListeningSubtitle {
  id: string;
  materialId: string;
  startTime: number;
  endTime: number;
  text: string;
  translation?: string;
  order: number;
}

export interface ListeningQuestion {
  id: string;
  materialId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  audioTimestamp?: number;
  order: number;
}

export interface UserProgress {
  progress: number;
  lastPosition: number;
  timeSpent: number;
  completedAt?: string | null;
}

export interface ListeningMaterial {
  id: string;
  title: string;
  description?: string | null;
  category: 'podcast' | 'audio' | 'exam' | 'video' | string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string;
  mediaUrl: string;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  duration: number;
  author?: string | null;
  viewCount: number;
  isCommunity: boolean;
  upvotes: number;
  downvotes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  vocabularySetId?: string | null;
  subtitles?: ListeningSubtitle[];
  questions?: ListeningQuestion[];
  userProgress?: UserProgress | null;
  isBookmarked?: boolean;
  userVote?: number; // 0, 1, -1
}
