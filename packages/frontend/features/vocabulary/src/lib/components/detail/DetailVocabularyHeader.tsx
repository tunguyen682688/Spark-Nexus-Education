import { ChevronLeft, Volume, Bookmark, BookmarkPlus } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { DETAIL_VOCABULARY_TEXT } from '../../constants';
import type { Word } from '../../types';

export interface DetailVocabularyHeaderProps {
  word: Word;
  isSaved: boolean;
  onSaveClick: () => void;
  onPracticeClick: () => void;
  onBackClick: () => void;
  onPronunciationClick?: () => void;
}

export default function DetailVocabularyHeader({
  word,
  isSaved,
  onSaveClick,
  onPracticeClick,
  onBackClick,
  onPronunciationClick,
}: DetailVocabularyHeaderProps) {
  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={onBackClick}
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> {DETAIL_VOCABULARY_TEXT.HEADER.BACK_BUTTON}
      </Button>

      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{word.word}</h1>
            {word.audioUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onPronunciationClick}
              >
                <Volume className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-muted-foreground mb-1">
            {word.pronunciation && `${word.pronunciation} • `}
            {word.partOfSpeech}
          </div>
          {word.tags && word.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {word.tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 self-start">
          <Button variant="outline" size="sm" onClick={onSaveClick}>
            {isSaved ? (
              <>
                <Bookmark className="h-4 w-4 mr-2 fill-current" /> {DETAIL_VOCABULARY_TEXT.HEADER.SAVED_BUTTON}
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 mr-2" /> {DETAIL_VOCABULARY_TEXT.HEADER.SAVE_BUTTON}
              </>
            )}
          </Button>
          <Button size="sm" onClick={onPracticeClick}>
            {DETAIL_VOCABULARY_TEXT.HEADER.PRACTICE_BUTTON}
          </Button>
        </div>
      </div>
    </div>
  );
}

