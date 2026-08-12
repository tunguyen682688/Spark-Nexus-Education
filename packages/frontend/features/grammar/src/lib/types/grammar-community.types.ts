export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  likesCount: number;
  tags: string[];
  hasQuiz?: boolean;
  quizType?: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  quizData?: {
    text?: string;
    words?: string[];
    answer?: string;
    options?: string[];
    sentence?: string;
    incorrectWord?: string;
    correctWord?: string;
    explanation?: string;
  };
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: {
      name: string;
      avatar?: string;
    };
  }>;
}

export interface CrowdsourcedQuiz {
  id: string;
  lessonId: string;
  contributorId: string;
  questionType: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  questionData: {
    options?: string[];
    answer?: string;
    words?: string[];
    sentence?: string;
    incorrectWord?: string;
    correctWord?: string;
    text?: string;
    question?: string;
  };
  explanation: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  upvotes: number;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    name: string;
    avatar?: string;
  };
}
