import type { 
  ExamCollection, 
  DashboardStats, 
  StudyPlanDay, 
  Contributor 
} from '../types';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SEARCH_KEYWORD = '';

export const DEFAULT_DASHBOARD_STATS: DashboardStats = {
  scorePrediction: '7.5',
  scoreRange: '7.0 - 8.0',
  accuracy: '78%',
  timeSpent: '12.5 hrs',
  completedMocks: '8/15',
  targetExam: 'IELTS Academic',
  targetScore: '8.0',
  daysRemaining: 18
};

export const FEATURED_COLLECTIONS: ExamCollection[] = [
  {
    id: 'f1',
    exam: 'IELTS',
    title: 'IELTS Academic Official Collection',
    tag: 'Featured',
    tagColor: 'bg-orange-500 text-white',
    updated: 'Updated Apr 30, 2026',
    rating: '4.9',
    reviews: '12.6K',
    learners: '45,200',
    mocks: '12',
    minis: '5',
    questions: '260+',
    level: 'Intermediate',
    levelColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
    duration: '180 mins',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'f2',
    exam: 'TOEIC',
    title: 'TOEIC 900+ Target Collection',
    tag: 'Best Seller',
    tagColor: 'bg-emerald-500 text-white',
    updated: 'Updated May 12, 2026',
    rating: '4.8',
    reviews: '8.9K',
    learners: '32,100',
    mocks: '10',
    minis: '3',
    questions: '200+',
    level: 'Advanced',
    levelColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    duration: '150 mins',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'f3',
    exam: 'Cambridge',
    title: 'Cambridge C1 Complete Practice',
    tag: 'AI Recommended',
    tagColor: 'bg-purple-500 text-white',
    updated: 'Updated May 5, 2026',
    rating: '4.9',
    reviews: '6.3K',
    learners: '18,700',
    mocks: '8',
    minis: '4',
    questions: '180+',
    level: 'Upper-Intermediate',
    levelColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300',
    duration: '165 mins',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'f4',
    exam: 'TOEFL',
    title: 'TOEFL iBT Ultimate Prep',
    tag: 'New',
    tagColor: 'bg-sky-500 text-white',
    updated: 'Updated May 20, 2026',
    rating: '4.7',
    reviews: '4.1K',
    learners: '14,300',
    mocks: '7',
    minis: '3',
    questions: '160+',
    level: 'Intermediate',
    levelColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
    duration: '180 mins',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'f5',
    exam: 'VSTEP',
    title: 'VSTEP B2 Complete Practice',
    tag: 'Trending',
    tagColor: 'bg-amber-500 text-white',
    updated: 'Updated May 18, 2026',
    rating: '4.8',
    reviews: '2.7K',
    learners: '9,800',
    mocks: '6',
    minis: '2',
    questions: '120+',
    level: 'Intermediate',
    levelColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    duration: '120 mins',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop'
  }
];

export const TRENDING_COLLECTIONS: ExamCollection[] = [
  {
    id: 't1',
    rank: 1,
    exam: 'IELTS',
    title: 'IELTS Academic Official Collection 2025',
    desc: 'Official-style mock tests with latest question patterns.',
    rating: '4.9',
    reviews: '12.6K',
    learners: '45.2K',
    mocks: '12',
    minis: '5',
    questions: '260+',
    level: 'Intermediate',
    levelColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    duration: '180 mins',
    trend: '35%',
    btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
    badgeColor: 'bg-blue-600 text-white',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 't2',
    rank: 2,
    exam: 'TOEIC',
    title: 'TOEIC 900+ Target Collection',
    desc: 'Score 900+ with high-quality practice tests.',
    rating: '4.8',
    reviews: '8.9K',
    learners: '32.1K',
    mocks: '10',
    minis: '3',
    questions: '200+',
    level: 'Advanced',
    levelColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    duration: '150 mins',
    trend: '28%',
    btnColor: 'bg-teal-600 hover:bg-teal-50 text-teal-600 dark:border-teal-900 dark:hover:bg-teal-950/40 dark:text-teal-400',
    badgeColor: 'bg-teal-600 text-white',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 't3',
    rank: 3,
    exam: 'Cambridge',
    title: 'Cambridge C1 Complete Practice',
    desc: 'Comprehensive practice for Cambridge C1 Advanced.',
    rating: '4.8',
    reviews: '6.3K',
    learners: '18.7K',
    mocks: '8',
    minis: '4',
    questions: '180+',
    level: 'Upper-Intermediate',
    levelColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    duration: '165 mins',
    trend: '22%',
    btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    badgeColor: 'bg-purple-600 text-white',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 't4',
    rank: 4,
    exam: 'TOEFL',
    title: 'TOEFL iBT Ultimate Prep',
    desc: 'Ace the TOEFL iBT with proven strategies.',
    rating: '4.7',
    reviews: '4.1K',
    learners: '14.3K',
    mocks: '7',
    minis: '3',
    questions: '160+',
    level: 'Intermediate',
    levelColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    duration: '180 mins',
    trend: '18%',
    btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
    badgeColor: 'bg-sky-600 text-white',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 't5',
    rank: 5,
    exam: 'VSTEP',
    title: 'VSTEP B2 Complete Practice',
    desc: 'Full practice for VSTEP B2 with detailed solutions.',
    rating: '4.7',
    reviews: '2.9K',
    learners: '9.8K',
    mocks: '6',
    minis: '2',
    questions: '120+',
    level: 'Intermediate',
    levelColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    duration: '120 mins',
    trend: '16%',
    btnColor: 'bg-orange-600 hover:bg-orange-500 text-white',
    badgeColor: 'bg-orange-600 text-white',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop'
  }
];

export const OFFICIAL_COLLECTIONS: ExamCollection[] = [
  {
    id: 'o1',
    title: 'IELTS Academic Official Practice Tests 2024',
    exam: 'IELTS',
    rating: '4.9',
    reviews: '12.6K',
    learners: '58.3K',
    mocks: 20,
    minis: 10,
    questions: '4000+',
    level: 'Intermediate',
    levelColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    duration: '180-210 mins',
    btnColor: 'border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900 dark:hover:bg-blue-950/40 dark:text-blue-400',
    badgeColor: 'bg-indigo-600 text-white',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'o2',
    title: 'TOEIC Official Learning and Practice',
    exam: 'TOEIC',
    rating: '4.8',
    reviews: '9.4K',
    learners: '42.1K',
    mocks: 17,
    minis: 5,
    questions: '3500+',
    level: 'Advanced',
    levelColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    duration: '120-180 mins',
    btnColor: 'border-teal-200 hover:bg-teal-50 text-teal-600 dark:border-teal-900 dark:hover:bg-teal-950/40 dark:text-teal-400',
    badgeColor: 'bg-teal-600 text-white',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'o3',
    title: 'Cambridge English C1 Advanced (CAE)',
    exam: 'Cambridge',
    rating: '4.9',
    reviews: '8.1K',
    learners: '28.7K',
    mocks: 12,
    minis: 6,
    questions: '2800+',
    level: 'Upper-Intermediate',
    levelColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    duration: '140-180 mins',
    btnColor: 'border-purple-200 hover:bg-purple-50 text-purple-600 dark:border-purple-900 dark:hover:bg-purple-950/40 dark:text-purple-400',
    badgeColor: 'bg-purple-600 text-white',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'o4',
    title: 'TOEFL iBT® Official Guide 6th Edition',
    exam: 'TOEFL',
    rating: '4.8',
    reviews: '4.7K',
    learners: '21.5K',
    mocks: 8,
    minis: 4,
    questions: '1900+',
    level: 'Advanced',
    levelColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    duration: '120 mins',
    btnColor: 'border-sky-200 hover:bg-sky-50 text-sky-600 dark:border-sky-900 dark:hover:bg-sky-950/40 dark:text-sky-400',
    badgeColor: 'bg-sky-600 text-white',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'o5',
    title: 'VSTEP Official Practice Collection',
    exam: 'VSTEP',
    rating: '4.7',
    reviews: '2.3K',
    learners: '11.2K',
    mocks: 10,
    minis: 4,
    questions: '2200+',
    level: 'Intermediate',
    levelColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    duration: '90-120 mins',
    btnColor: 'border-orange-200 hover:bg-orange-50 text-orange-600 dark:border-orange-900 dark:hover:bg-orange-950/40 dark:text-orange-400',
    badgeColor: 'bg-orange-600 text-white',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop'
  }
];

export const COMMUNITY_COLLECTIONS: ExamCollection[] = [
  {
    id: 'c1',
    title: 'IELTS Writing Task 2 Band 7+ Samples',
    desc: '50+ high score essays with model answers and vocabulary.',
    author: 'Sarah Nguyen',
    authorRole: 'IELTS 8.0',
    exam: 'IELTS',
    rating: '4.9',
    reviews: '2.1K',
    learners: '28.4K',
    duration: '60-90 mins',
    tag: 'Trending',
    tagColor: 'bg-emerald-500 text-white',
    level: 'Intermediate',
    levelColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=300&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop'
  },
  {
    id: 'c2',
    title: 'TOEIC Part 5 & 6 Drill Pack',
    desc: 'Grammar essentials with detailed explanations.',
    author: 'Minh Le',
    authorRole: 'TOEIC 945',
    exam: 'TOEIC',
    rating: '4.8',
    reviews: '1.7K',
    learners: '45.2K',
    duration: '30-45 mins',
    tag: 'Most Cloned',
    tagColor: 'bg-orange-500 text-white',
    level: 'Beginner',
    levelColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop'
  },
  {
    id: 'c3',
    title: 'Cambridge B2 First Complete Practice',
    desc: 'Full practice tests with audio and answer explanations.',
    author: 'John D.',
    authorRole: 'B2 Certified',
    exam: 'Cambridge',
    rating: '4.9',
    reviews: '3.3K',
    learners: '19.6K',
    duration: '120 mins',
    tag: 'Top Rated',
    tagColor: 'bg-blue-600 text-white',
    level: 'Upper-Intermediate',
    levelColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=300&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop'
  }
];

export const STUDY_PLAN_DAYS: StudyPlanDay[] = [
  { day: 'Mon', title: 'Diagnostic Test', topic: 'Full Mock Test (Listening & Reading)', duration: '120 mins', type: 'mock', completed: true },
  { day: 'Tue', title: 'Vocabulary Practice', topic: 'High-Frequency Vocabulary Set 01', duration: '45 mins', type: 'skills', completed: true },
  { day: 'Wed', title: 'Skills Practice', topic: 'Academic Reading - Paragraph Headings', duration: '60 mins', type: 'skills', completed: false, matchRate: '95%' },
  { day: 'Thu', title: 'Skills Practice', topic: 'Listening Part 3 - Multiple Choice', duration: '60 mins', type: 'skills', completed: false, matchRate: '90%' },
  { day: 'Fri', title: 'Mock Practice', topic: 'Section Practice - Academic Writing Task 1', duration: '40 mins', type: 'mock', completed: false },
  { day: 'Sat', title: 'Review Session', topic: 'AI Weakness Analysis & Error Notebook', duration: '90 mins', type: 'review', completed: false },
  { day: 'Sun', title: 'Rest Day', topic: 'Weekly Performance Analysis & Recovery', duration: '0 mins', type: 'rest', completed: false }
];

export const TOP_CONTRIBUTORS: Contributor[] = [
  { rank: 1, name: 'Sarah Nguyen', details: 'IELTS 8.5', points: '12.5K', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop' },
  { rank: 2, name: 'Minh Le', details: 'TOEIC 945', points: '9.2K', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop' },
  { rank: 3, name: 'John D.', details: 'B2 Certified', points: '7.8K', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop' },
  { rank: 4, name: 'Hana Kim', details: 'TOEFL 112', points: '5.1K', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop' },
  { rank: 5, name: 'Anh Tran', details: 'VSTEP B2', points: '5.3K', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80&auto=format&fit=crop' }
];

// ===== STANDARDIZED CERTIFICATION UI CONSTANTS & FILTER OPTIONS =====

export const COMMUNITY_SORT_FILTERS = [
  'All Collections',
  'Trending',
  'Most Cloned',
  'Top Rated',
] as const;

export const EXAM_CATEGORY_OPTIONS = [
  'All Exams',
  'IELTS',
  'TOEIC',
  'Cambridge',
] as const;

export const EXAM_LIBRARY_CATEGORIES = [
  'All',
  'IELTS',
  'TOEIC',
  'TOEFL',
  'Cambridge',
  'VSTEP',
  'SAT',
] as const;

export const OFFICIAL_EXAM_CATEGORIES = [
  'All Exams',
  'IELTS',
  'TOEIC',
  'TOEFL',
  'Cambridge',
  'VSTEP',
] as const;

export const EDITORIAL_LEVEL_FILTERS = [
  'All Picks',
  'Intermediate',
  'Advanced',
  'Upper-Intermediate',
] as const;

export const DIFFICULTY_LEVEL_OPTIONS = [
  'All Levels',
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export const POPULAR_EXAM_BADGES: Array<{
  type: string;
  badge: string;
  badgeType: 'default' | 'destructive' | 'secondary' | 'outline';
}> = [
  { type: 'TOEIC', badge: 'Most Popular', badgeType: 'default' },
  { type: 'IELTS', badge: 'High Demand', badgeType: 'destructive' },
  { type: 'TOEFL', badge: 'Updated 2025', badgeType: 'secondary' },
  { type: 'Cambridge', badge: 'B2 - C1', badgeType: 'outline' },
  { type: 'VSTEP', badge: 'B1 - C1', badgeType: 'secondary' },
  { type: 'SAT', badge: 'Math & Verbal', badgeType: 'outline' },
];

export const CERTIFICATION_UI_TEXT = {
  common: {
    back: 'Quay lại',
    search: 'Tìm kiếm',
    viewAll: 'Xem tất cả',
    viewCollection: 'Xem bộ đề',
    practiceNow: 'Luyện tập ngay',
    startLearning: 'Bắt đầu học',
    savedToLibrary: 'Đã lưu vào thư viện',
    addToSaved: 'Lưu bộ đề',
    collectionCloned: 'Đã sao chép bộ đề',
    cloneCollection: 'Sao chép bộ đề',
    reportCollection: 'Báo cáo vi phạm',
    share: 'Chia sẻ',
    editCollection: 'Chỉnh sửa bộ đề',
    noDescription: 'Chưa có mô tả chi tiết cho bộ đề này.',
    noData: 'Chưa có dữ liệu',
    published: 'Đã xuất bản',
    editorsPick: 'Lựa chọn của biên tập viên',
  },
  dashboard: {
    title: 'Tổng quan Chứng chỉ & Thi thử',
    subtitle:
      'Theo dõi tiến độ luyện thi, tỉ lệ chính xác và dự đoán điểm số của bạn.',
    platformBadge: 'AI-POWERED CERTIFICATION PLATFORM',
    heroTitle: 'Practice Smarter,\nScore Higher',
    exploreCollectionBtn: 'Explore Collection',
    exploreLibraryBtn: 'Explore Library',
    liveAnalyticsTitle: 'Live Analytics',
    estimatedScore: 'Estimated Score',
    accuracyRate: 'Accuracy Rate',
    last7Days: 'Last 7 Days',
    verified: 'Verified',
    daysLeft: 'Days Left',
    activeStreak: 'Active Streak 🔥',
    popularCategoriesTitle: 'Popular Exam Categories',
    popularCategoriesDesc:
      'Select an exam category to filter live practice collections',
    featuredCollectionsTitle: 'Featured Practice Collections',
    studyScheduleTitle: 'Recommended Study Schedule',
    studyScheduleDesc: 'Personalized learning roadmap generated by AI',
    topContributorsTitle: 'Top Contributors',
    topContributorsDesc: 'Leading learners and test creators',
    noFeaturedMatch: 'No featured collections found for this category.',
    doneStatus: 'Done ✓',
    pendingStatus: 'Pending',
    statsTitles: {
      estimatedScore: 'Estimated Score',
      accuracy: 'Accuracy',
      studyTime: 'Study Time',
      testsCompleted: 'Tests Completed',
      daysRemaining: 'Days Remaining',
    },
    statsSubtitles: {
      recentTests: 'Recent tests',
      accumulated: 'Accumulated',
      totalMocks: 'Total mocks',
      countdown: 'Countdown',
    },
    emptyState: {
      noStudyPlan: 'Chưa có kế hoạch học tập nào được gợi ý.',
      noTopContributors: 'Chưa có dữ liệu người đóng góp nổi bật.',
      noDashboardStats: 'Dữ liệu thống kê cá nhân chưa sẵn sàng.',
    },
  },
  studyPlan: {
    title: 'AI Recommendations 🤖',
    subtitle:
      'Personalized recommendations powered by AI to help you learn smarter and achieve your target score.',
    refreshRoadmap: 'Refresh Roadmap',
    weeklyRoadmapTitle: 'Weekly Study Roadmap',
    startTaskBtn: 'Start Task',
    progressLabel: 'Progress',
    stats: {
      currentScore: 'Current Score',
      targetScore: 'Target Score',
      confidence: 'Confidence',
      estimatedTime: 'Estimated Time',
      dailyStudyTime: 'Daily Study Time',
      subtitles: {
        ieltsOverall: 'IELTS Overall',
        targetBand: 'Target Band',
        highMatch: 'High Match Rate',
        reachTarget: 'To reach target',
        recommended: 'Recommended',
      },
    },
    skills: {
      reading: 'Reading',
      listening: 'Listening',
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
    },
    focusCards: {
      weakestSkill: 'Weakest Skill',
      weakestDesc: 'Needs most improvement',
      strongestSkill: 'Strongest Skill',
      strongestDesc: 'Your best performance',
      learningPriority: 'Learning Priority',
      priorityDesc: 'Highest impact area',
      urgentReview: 'Urgent Review',
      reviewDesc: 'Review recommended',
    },
    emptyState: 'Chưa có kế hoạch học tập cá nhân hóa được tạo.',
  },
  trending: {
    title: 'Trending Collections 🔥',
    subtitle:
      "Most popular collections this week based on learners' activity and engagement.",
    leaderboardTitle: 'Live Trending Leaderboard',
    whyTrendingTitle: 'Why These Collections Are Trending?',
    noMatchFilter: 'No trending collections match your filter.',
    tableHeaders: {
      rank: 'Rank',
      collection: 'Collection',
      exam: 'Exam',
      trend: 'Trend',
      action: 'Action',
    },
    reasons: {
      highCompletion: 'High Completion Rate',
      highCompletionDesc:
        'These collections have high mock completion rates this week.',
      popularLearners: 'Popular Among Learners',
      popularLearnersDesc:
        'Many active learners are starting and enjoying these collections.',
      topRated: 'Top Rated by Community',
      topRatedDesc: 'High ratings and positive reviews from our learners.',
      examAligned: 'Aligned with Exam Trends',
      examAlignedDesc: 'Based on the latest exam patterns and updates.',
    },
  },
  community: {
    title: 'Bộ sưu tập cộng đồng',
    subtitle:
      'Các bộ đề thi được tạo và chia sẻ bởi người học từ khắp nơi trên thế giới.',
    stats: {
      collections: 'Bộ sưu tập cộng đồng',
      collectionsDesc: 'Chia sẻ toàn cầu',
      rating: 'Đánh giá trung bình',
      ratingDesc: 'Từ nhận xét người học',
      downloads: 'Lượt tải về',
      downloadsDesc: 'Tổng số lượt sao chép',
      feedback: 'Phản hồi tích cực',
      feedbackDesc: 'Từ người luyện thi',
    },
    topContributors: 'Bảng xếp hạng đóng góp cộng đồng',
    noMatchFilter: 'Không có bộ sưu tập cộng đồng nào phù hợp với bộ lọc.',
  },
  editorialPicks: {
    title: "Editor's Picks 🎯",
    subtitle:
      'Hand-picked collections by language experts for maximum score improvement and efficiency.',
    badgeTag: 'HAND-PICKED BY EXPERTS',
    badges: {
      expertCurated: 'Expert Curated',
      expertCuratedDesc: 'Selected by exam specialists with proven results',
      qualityAssured: 'Quality Assured',
      qualityAssuredDesc: 'Strict quality standards and regular updates',
      provenEffective: 'Proven Effective',
      provenEffectiveDesc: 'High completion & success rate by learners',
      bestValue: 'Best Value',
      bestValueDesc: 'Most comprehensive content at the best value',
    },
    noMatchFilter: 'No editorial picks match your current filters.',
  },
  examsLibrary: {
    title: 'Exam Library 📚',
    subtitle: 'Curated collections to help you achieve your target score faster.',
    searchPlaceholder: 'Search collections...',
    featuredTitle: 'Featured Collections ✨',
    featuredSubtitle: 'Curated collections to help you achieve your target score faster.',
    noMatchFilter: 'No exam collections found matching filters.',
  },
  officialCollections: {
    title: 'Official Collections',
    subtitle:
      'Official and authorized exam collections from leading organizations.',
    noMatchFilter: 'No official collections found matching filters.',
  },
  search: {
    title: 'Search Exam Library 🔍',
    subtitlePrefix: 'Showing live results for',
    inputPlaceholder: 'Search exams, questions, skills...',
    tabAll: 'All Results',
    tabCollections: 'Practice Collections',
    noResultsPrefix: 'No search results found for',
    noResultsSuffix: '. Try searching for IELTS or TOEIC.',
  },
  collectionDetail: {
    insideCollection: 'Nội dung trong bộ sưu tập này',
    aboutCollection: 'Thông tin bộ sưu tập',
    quickActions: 'Thao tác nhanh',
    creatorProfile: 'Thông tin tác giả',
    viewProfile: 'Xem trang tác giả',
    tabs: {
      overview: 'Tổng quan',
      content: 'Danh sách bài học',
      statistics: 'Thống kê & Phân tích',
      reviews: 'Đánh giá người học',
      activity: 'Hoạt động gần đây',
      related: 'Bộ sưu tập tương tự',
    },
    emptyState: {
      contentTitle: 'Chưa có danh sách nội dung',
      contentDesc: 'Nội dung chi tiết của bộ sưu tập này chưa được công bố.',
      noItemsTitle: 'Chưa có bài luyện tập',
      noItemsDesc:
        'Các bài tập sẽ xuất hiện ở đây ngay khi dữ liệu được tải từ máy chủ.',
      analyticsTitle: 'Thống kê đang được cập nhật',
      analyticsDesc:
        'Phân tích chi tiết hiệu suất bộ đề sẽ sẵn sàng trong bản cập nhật tới.',
      noReviewsTitle: 'Chưa có đánh giá nào',
      noReviewsDesc:
        'Hãy là người đầu tiên đánh giá bộ sưu tập này sau khi hoàn thành.',
      noActivityTitle: 'Chưa có hoạt động',
      noActivityDesc:
        'Hoạt động luyện tập theo thời gian thực sẽ hiển thị tại đây.',
      noRelatedTitle: 'Không tìm thấy bộ sưu tập tương tự',
      noRelatedDesc: 'Gợi ý đề thi cùng danh mục sẽ được đề xuất tại đây.',
      noCreatorTitle: 'Thông tin tác giả chưa cập nhật',
      noCreatorDesc: 'Chi tiết tác giả tạo bộ đề này chưa có sẵn.',
    },
  },
  examDetail: {
    sectionsBreakdown: 'Cấu trúc các phần thi',
    sectionsDesc: 'Xem lại thời lượng và số lượng câu hỏi trước khi bắt đầu',
    proctoringTitle: 'Quy định giám sát & Chống gian lận',
    proctoringDesc:
      'Không chuyển tab trình duyệt hoặc thoát khỏi chế độ toàn màn hình trong khi làm bài. Đáp án sẽ được tự động lưu theo thời gian thực.',
  },
  loading: {
    dashboard: 'Đang tải dữ liệu tổng quan chứng chỉ...',
    collections: 'Đang tải danh sách bộ sưu tập đề thi...',
    exam: 'Đang tải cấu trúc đề thi...',
    session: 'Đang khởi tạo phiên thi...',
    submit: 'Đang chấm điểm và phân tích kết quả...',
  },
  error: {
    title: 'Đã xảy ra lỗi',
    dashboard: 'Không thể tải bảng điều khiển chứng chỉ. Vui lòng thử lại.',
    collections: 'Không thể tải danh sách bộ đề thi. Vui lòng kiểm tra kết nối.',
    exam: 'Không thể tải thông tin đề thi.',
    startSession: 'Không thể khởi tạo phiên thi. Vui lòng thử lại sau.',
    saveAnswer: 'Lỗi khi lưu câu trả lời. Hệ thống sẽ thử lại tự động.',
    submitSession: 'Nộp bài thi thất bại. Vui lòng thử lại.',
    retryButton: 'Thử lại',
  },
  toast: {
    sessionStarted: {
      title: 'Bắt đầu bài thi',
      description:
        'Phiên thi của bạn đã bắt đầu. Chúc bạn hoàn thành tốt bài thi!',
    },
    answerSaved: {
      title: 'Đã lưu đáp án',
      description: 'Đáp án của bạn đã được lưu tự động.',
    },
    violationRecorded: {
      title: 'Cảnh báo gian lận',
      description:
        'Hệ thống phát hiện hành vi chuyển màn hình hoặc thoát cửa sổ thi.',
    },
    sessionSubmitted: {
      title: 'Nộp bài thành công',
      description:
        'Bài thi của bạn đã được chấm điểm và phân tích năng lực bởi AI.',
    },
    errorOccurred: {
      title: 'Thao tác thất bại',
      description:
        'Có lỗi kết nối xảy ra. Vui lòng kiểm tra lại đường truyền mạng.',
    },
  },
} as const;
