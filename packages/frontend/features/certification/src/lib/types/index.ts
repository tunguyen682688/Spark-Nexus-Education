export interface ExamCollection {
  id: string;
  title: string;
  subtitle?: string;
  exam: string;
  rating: string;
  reviews?: string;
  learners: string;
  mocks?: string | number;
  minis?: string | number;
  questions?: string;
  level: string;
  levelColor?: string;
  duration: string;
  gradient?: string;
  image: string;
  tag?: string;
  tagColor?: string;
  updated?: string;
  author?: string;
  authorRole?: string;
  avatar?: string;
  desc?: string;
  trend?: string;
  rank?: number;
  btnColor?: string;
  badgeColor?: string;
  colorClass?: string;
}

export interface DashboardStats {
  scorePrediction: string;
  scoreRange: string;
  accuracy: string;
  timeSpent: string;
  completedMocks: string;
  targetExam: string;
  targetScore: string;
  daysRemaining: number;
}

export interface StudyPlanDay {
  day: string;
  title: string;
  topic: string;
  duration: string;
  type: 'mock' | 'skills' | 'review' | 'rest';
  completed: boolean;
  matchRate?: string;
}

export interface Contributor {
  rank: number;
  name: string;
  details: string;
  points: string;
  avatar: string;
}

export interface RecentlyAddedItem {
  title: string;
  author: string;
  rating: string;
  reviews: string;
  learners: string;
  image: string;
}
