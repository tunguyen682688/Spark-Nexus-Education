import { LucideIcon } from 'lucide-react';

export interface CompletedCollectionCardItem {
  id: string;
  title: string;
  category: 'Vocabulary' | 'IELTS' | 'TOEIC' | 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  coverTitle: string;
  coverSubtitle: string;
  gradientClass: string;
  medalColor: string;
  score: string;
  timeSpent: string;
  completedDate: string;
}

export interface PracticeHistorySessionItem {
  id: string;
  code: string;
  title: string;
  type: 'Mock Test' | 'Practice by Part' | 'AI Practice' | 'Quiz';
  typeBadgeClass: string;
  iconBgClass: string;
  iconType: 'document' | 'headphones' | 'edit' | 'quiz' | 'mic';
  examPart: string;
  scoreDisplay: string;
  scoreSub: string;
  scoreColor: string;
  timeSpent: string;
  dateDisplay: string;
}

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
