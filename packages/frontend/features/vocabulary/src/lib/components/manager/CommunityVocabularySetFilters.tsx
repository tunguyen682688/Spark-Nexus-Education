import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@spark-nest-ed/frontend-shared-components';
import { COMMUNITY_TEXT } from '../../constants';

export interface CommunityVocabularySetFiltersProps {
  selectedCategory: string | null;
  onCategoryRemove: () => void;
  searchTerm: string;
  onSearchRemove: () => void;
}

const CommunityVocabularySetFilters: React.FC<CommunityVocabularySetFiltersProps> = ({
  selectedCategory,
  onCategoryRemove,
  searchTerm,
  onSearchRemove,
}) => {
  if (!selectedCategory && !searchTerm) {
    return null;
  }

  return (
    <div className="w-full mb-4 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">
        {COMMUNITY_TEXT.FILTERS.LABEL}
      </span>
      {selectedCategory && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {selectedCategory}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={onCategoryRemove}
          />
        </Badge>
      )}
      {searchTerm && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {COMMUNITY_TEXT.FILTERS.SEARCH_PREFIX} {searchTerm}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={onSearchRemove}
          />
        </Badge>
      )}
    </div>
  );
};

export default CommunityVocabularySetFilters;

