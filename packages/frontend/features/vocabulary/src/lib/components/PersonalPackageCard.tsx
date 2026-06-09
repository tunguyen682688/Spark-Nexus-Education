import React from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Progress } from '@spark-nest-ed/frontend-shared-components';
import { BookOpen, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import type { VocabularySet } from '../types';
import { VOCABULARY_CARD_TEXT } from '../constants';
import { formatUserDisplay } from '../utils/user';

export interface PersonalPackageCardProps {
  set: VocabularySet;
  onFavoriteToggle?: (setId: string) => void;
}

const PersonalPackageCard: React.FC<PersonalPackageCardProps> = ({
  set,
  onFavoriteToggle,
}) => {
  const navigate = useNavigate();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFavoriteToggle) {
      onFavoriteToggle(set.id);
    }
  };

  const progressPercentage = set.studyCount || 0;
  const lastStudiedDate = set.updatedAt
    ? new Date(set.updatedAt).toLocaleDateString()
    : 'Never';

  return (
    <Card key={set.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {set.tags.length > 0 && (
            <Badge className="mb-2">{set.tags.join(', ')}</Badge>
          )}
          {onFavoriteToggle && (
            <Button
              variant="ghost"
              size="icon"
              className={
                set.favoriteCount > 0
                  ? 'text-amber-500'
                  : 'text-muted-foreground'
              }
              onClick={handleFavoriteClick}
            >
              <Star className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
        </div>
        <CardTitle className="line-clamp-1">{set.title}</CardTitle>
        <CardDescription>
          {VOCABULARY_CARD_TEXT.BY} {formatUserDisplay(set.userId, set.creator)} • {set.entryCount}{' '}
          {VOCABULARY_CARD_TEXT.ENTRIES_SUFFIX}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{VOCABULARY_CARD_TEXT.PROGRESS_LABEL}</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {VOCABULARY_CARD_TEXT.LAST_STUDIED_PREFIX} {lastStudiedDate}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link
            to={ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(
              ':id',
              set.id.toString()
            )}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {VOCABULARY_CARD_TEXT.VIEW}
          </Link>
        </Button>
        <Button
          className="flex-1"
          onClick={() =>
            navigate(
              ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(
                ':id',
                set.id.toString()
              )
            )
          }
        >
          {VOCABULARY_CARD_TEXT.CONTINUE}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalPackageCard;
