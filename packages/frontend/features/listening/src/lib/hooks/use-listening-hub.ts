import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListeningMaterials, useListeningUserStats, useListeningLeaderboard } from './index';



export function useListeningHub() {
  const navigate = useNavigate();

  // Refs for horizontal scrolling sections
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const podcastsScrollRef = useRef<HTMLDivElement>(null);
  const examsScrollRef = useRef<HTMLDivElement>(null);
  const videosScrollRef = useRef<HTMLDivElement>(null);
  const communityScrollRef = useRef<HTMLDivElement>(null);

  // Filters state
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommunity, setIsCommunity] = useState<boolean | undefined>(undefined);



  // Fetch materials list
  const {
    data: materialsData,
    isLoading: isLoadingList,
    error: listError,
  } = useListeningMaterials({
    difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
    isCommunity,
    q: searchQuery || undefined,
    limit: 50,
  });

  const { data: userStats } = useListeningUserStats();
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useListeningLeaderboard(5);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Aggregate user study stats
  const allItems = materialsData?.items || [];

  // Baselines for gamification from DB userStats
  const displayStreak = userStats?.streak || 0;
  const displayTotalMinutes = Math.round((userStats?.totalTime || 0) / 60);
  const displayCompletedLessons = userStats?.totalMaterials || 0;
  const dailyTargetMinutes = 30;
  const dailyProgressPercent = Math.min(100, Math.round((displayTotalMinutes / dailyTargetMinutes) * 100));

  // Determine if searching/filtering is active (to show flat list layout)
  const isSearchActive = searchQuery !== '' || selectedDifficulty !== 'all' || isCommunity !== undefined;

  // Filter categories for individual blocks
  const podcasts = allItems.filter(item => (item.category === 'podcast' || item.category === 'audio') && !item.isCommunity);
  const exams = allItems.filter(item => item.category === 'exam' && !item.isCommunity);
  const videos = allItems.filter(item => item.category === 'video' && !item.isCommunity);
  const communityItems = allItems.filter(item => item.isCommunity);

  // Sort trending items by view count or upvotes
  const trendingItems = [...allItems].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  // Get daily recommended challenge
  const dailyChallengeItem = allItems.find(item => item.difficulty === 'B1' || item.difficulty === 'B2') || allItems[0] || null;

  const handleNavigateContribute = () => {
    navigate('/listening/contribute');
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
    setIsCommunity(undefined);
  };

  return {
    navigate,
    trendingScrollRef,
    podcastsScrollRef,
    examsScrollRef,
    videosScrollRef,
    communityScrollRef,
    selectedDifficulty,
    setSelectedDifficulty,
    searchQuery,
    setSearchQuery,
    isCommunity,
    setIsCommunity,
    isLoadingList,
    listError,
    allItems,
    handleScroll,
    displayStreak,
    displayTotalMinutes,
    displayCompletedLessons,
    dailyTargetMinutes,
    dailyProgressPercent,
    isSearchActive,
    podcasts,
    exams,
    videos,
    communityItems,
    trendingItems,
    dailyChallengeItem,
    handleResetSearch,
    handleNavigateContribute,
    leaderboardData,
    isLoadingLeaderboard,
  };
}
