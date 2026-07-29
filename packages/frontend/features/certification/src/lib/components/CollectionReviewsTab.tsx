import React, { useState } from 'react';
import { MessageSquare, Star, Send, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import { UserReview } from '../hooks/useCollectionDetailContainerLogic';
import { useAddCollectionReview } from '../hooks/use-certification';
import { ComingSoonSection } from './ComingSoonSection';

interface CollectionReviewsTabProps {
  collectionId: string;
  userReviews: UserReview[];
  reviewsCount?: string;
}

export const CollectionReviewsTab = ({
  collectionId,
  userReviews = [],
  reviewsCount,
}: CollectionReviewsTabProps) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { mutate: addReview, isPending } = useAddCollectionReview();

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    addReview(
      { collectionId, rating, text: reviewText.trim() },
      {
        onSuccess: () => {
          setReviewText('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. REVIEW SUBMISSION FORM CARD */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-current" /> Write a Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-bold">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience and thoughts about this exam collection..."
              rows={3}
              className="w-full p-3 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !reviewText.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Submit Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. REVIEWS LIST CARD */}
      <Card className="border-border">
        <CardHeader className="flex items-center gap-2 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" /> Learner Reviews
            {reviewsCount && (
              <span className="text-muted-foreground font-normal text-xs">
                ({reviewsCount})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userReviews.length === 0 ? (
            <ComingSoonSection
              title="No reviews yet"
              description="Be the first to review this collection after completing it. Learner reviews will appear here."
            />
          ) : (
            <div className="space-y-4 divide-y divide-border">
              {userReviews.map((rev) => (
                <div key={rev.id} className="space-y-2 pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {rev.avatar ? (
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {rev.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-xs text-foreground">
                        {rev.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {rev.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
