import React from 'react';
import { BookOpen, Heart, Share } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Skeleton, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { CommunityVocabularySet } from '../../types';
import { formatUserDisplay } from '../../utils/user';

export interface CommunityVocabularySetListProps {
  sets: CommunityVocabularySet[];
  isLoading: boolean;
  onToggleFavorite: (setId: string, isFavorited: boolean) => void;
  isTogglingFavorite: boolean;
  onViewSet: (setId: string) => void;
}

const CommunityVocabularySetList: React.FC<CommunityVocabularySetListProps> = ({
  sets,
  isLoading,
  onToggleFavorite,
  isTogglingFavorite,
  onViewSet,
}) => {

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No vocabulary sets found. Try adjusting your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sets.map((set) => (
        <Card key={set.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{set.title}</CardTitle>
                {set.description && (
                  <CardDescription className="line-clamp-2">
                    {set.description}
                  </CardDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(set.id, set.isFavorited ?? false)}
                disabled={isTogglingFavorite}
              >
                <Heart
                  className={`h-5 w-5 ${
                    set.isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{set.entryCount} words</span>
              </div>
              <div className="flex items-center gap-1">
                <span>By {formatUserDisplay(set.userId, set.creator)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{set.favoriteCount} favorites</span>
              </div>
            </div>
            {set.tags && set.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {set.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSet(set.id)}
            >
              View Details
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share:', set.id);
                }}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CommunityVocabularySetList;

