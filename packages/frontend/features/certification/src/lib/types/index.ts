export interface ExamCollection {
  id: string;
  title: string;
  exam: string;
  subtitle?: string;
  desc?: string;
  description?: string;
  ownerId?: string;
  author?: string;
  authorRole?: string;
  avatar?: string;
  image?: string;
  publishStatus?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  updated?: string;
  examCount?: number;
  itemCount?: number;
  itemsCount?: number;
  mocks?: number | string;
  minis?: number | string;
  questions?: number | string;
  questionsCount?: number;
  level?: string;
  levelColor?: string;
  colorClass?: string;
  duration?: string;
  tag?: string;
  tagColor?: string;
  badgeColor?: string;
  btnColor?: string;
  rating?: string;
  reviews?: string;
  learners?: string;
  downloads?: string;
  rank?: number;
  trend?: string;
  clones?: string;
  followers?: string;
  targetBand?: string;
  cefrLevel?: string;
  language?: string;
  totalSize?: string;
  tags?: string[];
  saved?: boolean;
  bookmarked?: boolean;
  cloned?: boolean;
  itemsList?: Array<{ id: string; title: string; type: string; duration: string; items: string }>;
  reviewsList?: Array<{ id?: string; author: string; avatar?: string; rating: number; date: string; text: string }>;
  activitiesList?: Array<{ user: string; action: string; time: string }>;
}

export interface CollectionDiscussion {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  date: string;
  repliesCount: number;
  content: string;
}

export interface CreateCollectionReviewDto {
  rating: number;
  text: string;
}

export interface CreateCollectionDiscussionDto {
  title: string;
  content: string;
}

export interface SaveQuestionOptionDto {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface SaveQuestionDto {
  id?: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  shuffleOptions?: boolean;
  options: SaveQuestionOptionDto[];
  explanation?: string;
  points?: number;
  estimatedTime?: string;
  tags?: string[];
  skills?: string[];
  cognitiveLevel?: string;
  target?: 'exam' | 'bank';
}

export interface SaveQuestionResult {
  id: string;
  savedToBank: boolean;
  status: string;
}

export interface DashboardStats {
  scorePrediction?: string;
  scoreRange?: string;
  accuracy?: string;
  timeSpent?: string;
  completedMocks?: string;
  targetExam?: string;
  targetScore?: string;
  daysRemaining?: number;
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
  id?: string;
  rank: number;
  name: string;
  details: string;
  points: string;
  avatar: string;
  bio?: string;
}

export interface ExamQuestionChoice {
  id: string;
  choiceKey: string;
  content: string;
}

export interface ExamQuestion {
  id: string;
  questionText?: string;
  content?: string;
  questionType?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'MCQ' | string;
  orderIndex?: number;
  points?: number;
  explanation?: string;
  choices?: ExamQuestionChoice[];
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  sectionType: string;
  orderIndex: number;
  durationMinutes?: number;
  questions: ExamQuestion[];
}

export interface Exam {
  id: string;
  collectionId: string;
  title: string;
  code: string;
  description?: string;
  examType: 'FULL_MOCK' | 'MINI_TEST' | 'SECTION_PRACTICE';
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  sections?: ExamSection[];
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText?: string | null;
  choiceIds: string[];
  savedAt?: string;
  updatedAt?: string;
}

export interface SessionViolation {
  id: string;
  sessionId: string;
  violationType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'TIMEOUT';
  description?: string;
  timestamp: string;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'terminated';
  startedAt: string;
  endedAt?: string;
  remainingSeconds: number;
  answers: SessionAnswer[];
  violations: SessionViolation[];
  questions?: ExamQuestion[];
  examTitle?: string;
  title?: string;
}

export interface SkillResult {
  skill: string;
  score: number;
  maxScore: number;
  accuracyRate: string;
  feedback: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamResult {
  id: string;
  sessionId: string;
  examId: string;
  examTitle: string;
  totalScore: number;
  maxScore: number;
  targetBand: string;
  achievedBand: string;
  accuracyRate: string;
  timeSpentMinutes: number;
  completedAt: string;
  skillResults: SkillResult[];
  questionResults: QuestionResult[];
  overallAiSummary: string;
  actionableRecommendations: string[];
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: string;
}

export interface SaveSessionAnswerDto {
  questionId: string;
  answerText?: string;
  choiceIds?: string[];
}

export interface RecordSessionViolationDto {
  violationType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'TIMEOUT';
  description?: string;
}

export interface CertificateItem {
  id: string;
  collectionId: string;
  title: string;
  examCategory: string;
  issuedDate: string;
  score: string;
  downloadUrl?: string;
  credentialCode: string;
}

export interface QuestionVersion {
  id: string;
  questionId: string;
  version: number;
  content: string;
  createdAt: Date | string;
  createdBy: string | null;
}

export interface QuestionMetadata {
  id: string;
  questionId: string;
  explanation: string | null;
  points: number;
  estimatedTime: string | null;
  shuffleOptions: boolean;
  referenceType: string | null;
  passageSource: string | null;
  highlight: string | null;
  cognitiveLevel: string | null;
  tags: string[];
  skills: string[];
  qualityScore: number | null;
  qualityRating: string | null;
}

export interface QuestionBuilderData {
  id: string;
  badgeType: string;
  status: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  shuffleOptions: boolean;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  reference: {
    type: string | null;
    passageSource: string | null;
    highlight: string | null;
  };
  properties: {
    id: string;
    points: number;
    estimatedTime: string;
    tags: string[];
    skills: string[];
    cognitiveLevel: string;
    createdDate: string;
    lastUpdatedDate: string;
    createdBy: string;
  };
  qualityScore: {
    score: number;
    rating: string;
    description: string;
    checks: string[];
  };
  usedIn: {
    examTitle: string;
    sectionInfo: string;
  } | null;
}

export interface CreatorDashboardResponse {
  metrics: {
    totalExams: number;
    totalExamsWeeklyChange: string;
    totalQuestions: number;
    totalQuestionsWeeklyChange: string;
    totalAttempts: number;
    totalAttemptsWeeklyChange: string;
    averageScore: number;
    averageScoreWeeklyChange: string;
    totalLikes: number;
    likesReceived: number;
    likesReceivedWeeklyChange: string;
  };
  performanceChart: {
    timeframe: string;
    dates: string[];
    attempts: number[];
    averageScores: number[];
    likes: number[];
    revenue: number[];
  };
  topExams: Array<{
    rank: number;
    id: string;
    title: string;
    category: string;
    categoryBadge: string;
    categoryBadgeClass: string;
    attempts: number;
    avgScore: string;
    likes: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    iconType: 'check' | 'document' | 'star' | 'comment' | 'heart';
    iconBgClass: string;
  }>;
  revenue: {
    totalRevenue: string;
    revenueGrowth: string;
    payoutBalance: string;
    dailyData: Array<{ day: string; amount: number }>;
  };
}

export interface CollectionEditorResponse {
  id: string;
  status: string;
  lastAutosaved: string;
  details: {
    title: string;
    subtitle: string;
    description: string;
    level: string;
    tags: string[];
    visibility: string;
    allowDownloads: boolean;
    coverImage: string;
    createdDate: string;
    lastUpdatedDate: string;
  };
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    description: string;
    examCount: number;
    exams: Array<{
      id: string;
      number: number;
      title: string;
      subTitle: string;
      questionsCount: number;
      durationMinutes: number;
      difficulty: string;
      status: string;
      iconType: string;
      chapterId?: string;
    }>;
  }>;
  summary: {
    totalChapters: number;
    totalExams: number;
    totalQuestions: number;
    estimatedDurationHours: number;
    estimatedDurationMinutes: number;
    difficultyMix: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

export interface ExamBuilderResponse {
  id: string;
  title: string;
  description: string;
  examType: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  settings: {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    difficulty: string;
    instructions: string;
  };
  sections: ExamSection[];
}

export interface QuestionBuilderResponse {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  options: AnswerOptionItem[];
  explanation: string;
  properties: Record<string, unknown>;
  metadata: {
    id: string;
    lastUpdatedDate: string;
    createdBy: string;
  };
}

export interface BookmarksApiResponse {
  id: string;
  userId: string;
  totalBookmarks: number;
  folders: BookmarkFolder[];
  items: BookmarkItem[];
}

export interface PracticeHistoryResponse {
  id: string;
  userId: string;
  totalSessions: number;
  items: Array<{
    id: string;
    code: string;
    title: string;
    type: string;
    examPart: string;
    scoreDisplay: string;
    scoreSub: string;
    timeSpent: string;
    dateDisplay: string;
  }>;
}

export interface CompletedCollectionsResponse {
  id: string;
  userId: string;
  totalCompleted: number;
  items: Array<{
    id: string;
    title: string;
    category: string;
    examType: string;
    completedDate: string;
    scoreText: string;
    totalItems: number;
    certificateEligible: boolean;
  }>;
}

export interface FavoritesResponse {
  id: string;
  userId: string;
  totalFavorites: number;
  items: Array<{
    id: string;
    collectionId: string;
    title: string;
    exam: string;
    addedAt: string;
  }>;
}

export interface BookmarksResponse {
  id: string;
  userId: string;
  totalBookmarks: number;
  folders?: Array<{ id: string; name: string; itemCount: number }>;
  items: Array<{
    id: string;
    itemId: string;
    itemType: string;
    title: string;
    folderName: string;
    createdAt: string;
  }>;
}

export interface DownloadsResponse {
  id: string;
  userId: string;
  totalDownloads: number;
  items: Array<{
    id: string;
    collectionId: string;
    title: string;
    downloadedAt: string;
    fileSize: string;
  }>;
}

export interface PurchasedCollectionsResponse {
  id: string;
  userId: string;
  totalPurchased: number;
  items: Array<{
    id: string;
    collectionId: string;
    title: string;
    exam: string;
    purchasedAt: string;
    price: number;
  }>;
}

export interface AnswerOptionItem {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  itemCount: number;
}

export interface BookmarkItem {
  id: string;
  itemId: string;
  itemType: string;
  title: string;
  folderName: string;
  createdAt: string;
}
