import React, { useState } from 'react';
import { Star, Send, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spark-nest-ed/frontend-shared-components';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; text: string }) => void;
  isPending: boolean;
}

export const ReviewForm = ({ onSubmit, isPending }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    onSubmit({ rating, text: reviewText.trim() });
    setReviewText('');
  };

  return (
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
  );
};
