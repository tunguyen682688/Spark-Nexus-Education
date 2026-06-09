import React from 'react';
import { BookMarked } from 'lucide-react';
import { Button, Skeleton } from '@spark-nest-ed/frontend-shared-components';
import PersonalPackageCard from '../PersonalPackageCard';
import type { VocabularySet, CommunityVocabularySet } from '../../types';

export interface MyLibraryVocabularySetListProps {
  sets: (VocabularySet | CommunityVocabularySet)[];
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string | null;
  onEmptyAction: () => void;
  emptyActionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
}

const MyLibraryVocabularySetList: React.FC<MyLibraryVocabularySetListProps> = ({
  sets,
  isLoading,
  searchTerm,
  selectedCategory,
  onEmptyAction,
  emptyActionLabel,
  emptyTitle,
  emptyDescription,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="text-center py-12">
        <BookMarked className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground mb-6">
          {searchTerm || selectedCategory
            ? "Try changing your search or filter criteria"
            : emptyDescription}
        </p>
        <Button onClick={onEmptyAction}>{emptyActionLabel}</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sets.map((set) => (
        <PersonalPackageCard key={set.id} set={set} />
      ))}
    </div>
  );
};

export default MyLibraryVocabularySetList;

