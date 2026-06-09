import React from 'react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { MY_LIBRARY_TEXT } from '../../constants';

export interface MyLibraryVocabularySetPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MyLibraryVocabularySetPagination: React.FC<MyLibraryVocabularySetPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        {MY_LIBRARY_TEXT.PAGINATION.PREVIOUS}
      </Button>
      <span className="text-sm text-muted-foreground">
        {MY_LIBRARY_TEXT.PAGINATION.PAGE_OF(currentPage, totalPages)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        {MY_LIBRARY_TEXT.PAGINATION.NEXT}
      </Button>
    </div>
  );
};

export default MyLibraryVocabularySetPagination;

