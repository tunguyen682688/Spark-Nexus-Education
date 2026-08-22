import { LucideIcon } from 'lucide-react';

export interface CreatorActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  iconType: 'check' | 'document' | 'star' | 'comment' | 'heart';
  iconBgClass: string;
}

export interface CreatorTopExamItem {
  rank: number;
  id: string;
  title: string;
  category: string;
  categoryBadge: string;
  categoryBadgeClass: string;
  attempts: number;
  avgScore: string;
  likes: number;
}

export interface DailyRevenueItem {
  day: string;
  amount: number;
}

export interface DashboardStatCard {
  title: string;
  value: string;
  subtitle: string;
  change: string;
  trend: 'up' | 'neutral' | 'down';
  icon: LucideIcon;
  color: string;
}
