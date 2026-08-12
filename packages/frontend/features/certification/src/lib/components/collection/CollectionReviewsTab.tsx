import { MessageSquare, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@spark-nest-ed/frontend-shared-components';
import { UserReview } from '../../hooks/container-logic/collection/use-collection-detail-container-logic';
import { ReviewForm } from './ReviewForm';
import { ComingSoonSection } from '../shared/ComingSoonSection';

interface CollectionReviewsTabProps {
  userReviews: UserReview[];
  reviewsCount?: string;
  onSubmitReview: (data: { rating: number; text: string }) => void;
  isSubmittingReview: boolean;
}

export const CollectionReviewsTab = ({
  userReviews = [],
  reviewsCount,
  onSubmitReview,
  isSubmittingReview,
}: CollectionReviewsTabProps) => {
  return (
    <div className="space-y-6">
      <ReviewForm onSubmit={onSubmitReview} isPending={isSubmittingReview} />

      {/* REVIEWS LIST CARD */}
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
