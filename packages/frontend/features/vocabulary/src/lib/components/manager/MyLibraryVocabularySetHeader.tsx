import React from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { Link } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { MY_LIBRARY_TEXT } from '../../constants';

export interface MyLibraryVocabularySetHeaderProps {
  onCreateNewSet: () => void;
}

const MyLibraryVocabularySetHeader: React.FC<MyLibraryVocabularySetHeaderProps> = ({
  onCreateNewSet,
}) => {
  return (
    <section className="relative pt-16 pb-8">
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/50 dark:to-transparent"
        aria-hidden="true"
      ></div>
      <div className="w-full max-w-none mx-0 px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {MY_LIBRARY_TEXT.HEADER.TITLE}
            </h1>
            <p className="text-muted-foreground">
              {MY_LIBRARY_TEXT.HEADER.SUBTITLE}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.VOCABULARIES.COMMUNITY}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {MY_LIBRARY_TEXT.HEADER.COMMUNITY_BUTTON}
              </Link>
            </Button>
            <Button size="sm" onClick={onCreateNewSet}>
              <Plus className="mr-2 h-4 w-4" />
              {MY_LIBRARY_TEXT.HEADER.CREATE_BUTTON}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyLibraryVocabularySetHeader;

