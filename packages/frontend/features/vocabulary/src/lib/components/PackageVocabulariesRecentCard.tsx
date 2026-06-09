import React from 'react';
import { BookOpen, Clock, Users, Heart, Download } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@spark-nest-ed/frontend-shared-components';
import { Link } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import type { CommunityVocabularySet } from '../types';
import { formatUserDisplay } from '../utils/user';
import { VOCABULARY_CARD_TEXT } from '../constants';

export interface PackageVocabulariesRecentCardProps {
  set: CommunityVocabularySet;
  onAdd?: (setId: string) => void;
}

const PackageVocabulariesRecentCard: React.FC<PackageVocabulariesRecentCardProps> = ({
  set,
  onAdd,
}) => {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAdd) {
      onAdd(set.id);
    }
  };

  return (
    <Card key={set.id}>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{set.title}</CardTitle>
            <CardDescription>
              {set.description || VOCABULARY_CARD_TEXT.NO_DESCRIPTION}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {new Date(set.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Users className="h-4 w-4 mr-1" />
            <span className="mr-4">
            {VOCABULARY_CARD_TEXT.BY} {formatUserDisplay(set.userId, set.creator)}
          </span>
          <BookOpen className="h-4 w-4 mr-1" />
          <span>
            {set.entryCount || 0} {VOCABULARY_CARD_TEXT.WORDS_SUFFIX}
          </span>
          {set.tags.length > 0 && (
            <>
              <span className="mx-3">•</span>
              <span>{set.tags[0]}</span>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm">
          <Heart className="h-4 w-4 mr-1 text-red-500" />
          <span className="mr-3">{set.favoriteCount || 0}</span>
          <Download className="h-4 w-4 mr-1" />
          <span>{set.cloneCount || 0}</span>
        </div>
        <div className="flex gap-2">
          {onAdd && (
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Download className="h-4 w-4 mr-1" /> {VOCABULARY_CARD_TEXT.ADD}
            </Button>
          )}
          <Button size="sm" asChild>
            <Link
              to={ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(':id', set.id)}
            >
              {VOCABULARY_CARD_TEXT.VIEW}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PackageVocabulariesRecentCard;
