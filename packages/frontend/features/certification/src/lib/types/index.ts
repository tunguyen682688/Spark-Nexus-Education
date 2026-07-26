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
  choices?: ExamQuestionChoice[] | string[] | any;
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
