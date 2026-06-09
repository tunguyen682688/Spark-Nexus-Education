import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@spark-nest-ed/frontend-shared-components';
import { BookOpen, ChevronRight, Download, Heart, Users } from 'lucide-react';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { imageCatalog, createImageExport } from '@spark-nest-ed/frontend-shared-assets';
import type { CommunityVocabularySet } from '../types';
import { formatUserDisplay } from '../utils/user';
import { VOCABULARY_CARD_TEXT } from '../constants';

const placeholderImage = createImageExport(
  imageCatalog.defaultVocabularySet1,
  'Vocabulary package cover image'
);

export interface PackageVocabulariesCardProps {
  set: CommunityVocabularySet;
  onAdd?: (setId: string) => void;
}

const PackageVocabulariesCard: React.FC<PackageVocabulariesCardProps> = ({
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
    <Card key={set.id} className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-48 md:h-auto">
          <img
            src={set.coverImage || placeholderImage.src}
            alt={set.title || placeholderImage.alt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-6">
          <CardHeader className="p-0 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{set.title}</CardTitle>
                <CardDescription className="line-clamp-3 overflow-hidden">
                  {set.description || VOCABULARY_CARD_TEXT.NO_DESCRIPTION}
                </CardDescription>
              </div>
              {onAdd && (
                <Button variant="outline" size="sm" onClick={handleAdd}>
                  <Download className="h-4 w-4 mr-1" /> {VOCABULARY_CARD_TEXT.ADD}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Users className="h-4 w-4 mr-1" />
                <span
                  className="mr-4 whitespace-nowrap overflow-hidden text-ellipsis"
                  title={formatUserDisplay(set.userId, set.creator)}
                >
                  {VOCABULARY_CARD_TEXT.BY} {formatUserDisplay(set.userId, set.creator)}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {set.tags.length > 0 ? (
                set.tags.map((tag, index) => (
                  <span key={index} className="text-sm">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm">{VOCABULARY_CARD_TEXT.GENERAL_TAG}</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-2 flex justify-between">
            <div className="flex items-center text-sm">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="whitespace-nowrap mr-2">{set.entryCount || 0}</span>
              <Heart className="h-4 w-4 mr-1 text-red-500" />
              <span className="mr-3">{set.favoriteCount || 0}</span>
              <Download className="h-4 w-4 mr-1" />
              <span>{set.cloneCount || 0}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(':id', set.id)}
              >
                {VOCABULARY_CARD_TEXT.VIEW_DETAILS}{' '}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default PackageVocabulariesCard;
