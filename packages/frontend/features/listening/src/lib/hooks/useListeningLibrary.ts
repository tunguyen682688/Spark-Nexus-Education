import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useListeningMaterials,
  useToggleListeningBookmark,
  useListeningUserStats,
  useListeningWeeklyActivity,
} from './index';

export function useListeningLibrary() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'bookmarks'>('in-progress');

  // Fetch listening materials, stats, and weekly activity
  const { data: materialsData, isLoading: isLoadingMaterials, error: materialsError } = useListeningMaterials({ limit: 100 });
  const { data: userStats, isLoading: isLoadingStats } = useListeningUserStats();
  const { data: weeklyRawData = [], isLoading: isLoadingWeekly } = useListeningWeeklyActivity();
  const toggleBookmarkMutation = useToggleListeningBookmark();

  const allItems = materialsData?.items || [];

  // Group items by user progress
  const inProgressItems = allItems.filter(
    (item) => item.userProgress && item.userProgress.progress > 0 && item.userProgress.progress < 100
  );

  const completedItems = allItems.filter(
    (item) => item.userProgress && item.userProgress.progress >= 100
  );

  const bookmarkedItems = allItems.filter((item) => item.isBookmarked);

  // Recently studied items (top 3 in-progress items)
  const recentlyStudiedItems = [...inProgressItems].slice(0, 3);

  // Remove a bookmark via API (with optimistic feedback)
  const handleRemoveBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleBookmarkMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Map weeklyRawData to match the expected format { day: string; min: number }
  const weeklyData = weeklyRawData.map((d: any) => ({
    day: d.day,
    min: d.minutes || 0,
  }));

  // Game/achievements calculations
  const totalTime = userStats?.totalTime || 0;
  const streak = userStats?.streak || 0;
  const completedCount = completedItems.length;

  const achievements = [
    {
      id: 'first-step',
      title: 'Khởi đầu',
      description: 'Hoàn thành bài luyện nghe đầu tiên',
      unlocked: completedCount >= 1,
    },
    {
      id: 'listening-pro',
      title: 'Siêu nhân nghe',
      description: 'Luyện nghe tổng cộng 60 phút',
      unlocked: totalTime >= 3600, // 3600 seconds = 60 mins
    },
    {
      id: 'streak-consistency',
      title: 'Kiên trì',
      description: 'Đạt chuỗi học tập liên tục 3 ngày',
      unlocked: streak >= 3,
    },
    {
      id: 'perfectionist',
      title: 'Hoàn hảo',
      description: 'Hoàn thành xuất sắc 5 bài luyện nghe',
      unlocked: completedCount >= 5,
    },
  ];

  const isLoading = isLoadingMaterials || isLoadingStats || isLoadingWeekly;
  const error = materialsError;

  return {
    navigate,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    allItems,
    inProgressItems,
    completedItems,
    bookmarkedItems,
    recentlyStudiedItems,
    handleRemoveBookmark,
    userStats,
    weeklyData,
    achievements,
  };
}
