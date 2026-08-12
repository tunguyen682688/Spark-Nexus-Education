export interface UserVocabularyProgressResponse {
  id: string;
  userId: string;
  itemId: string;
  status: 'NEW' | 'LEARNING' | 'MASTERED';
  streak: number;
  masteryLevel: number;
  lastReview: string | null;
  nextReviewAt: string | null;
  interval: number;
  easeFactor: number;
  repetitions: number;
}
