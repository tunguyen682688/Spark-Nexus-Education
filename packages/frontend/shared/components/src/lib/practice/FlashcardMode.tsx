import React from 'react';
import { Button } from '../ui/button' ;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Flag,
  Volume,
  MousePointerClick,
  ThumbsDown,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { useKeyboardShortcut } from '@spark-nest-ed/frontend-shared-hooks';

interface WordType {
  id: number;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

interface FlashcardModeProps {
  currentWord: WordType;
  revealAnswer: boolean;
  setRevealAnswer: (reveal: boolean) => void;
  settings: {
    showPartOfSpeech: boolean;
    showPronunciation: boolean;
    showExamples: boolean;
  };
  currentWordIndex: number;
  totalWords: number;
  flaggedWords: number[];
  markAsKnown: () => void;
  markAsUnknown: () => void;
  prevWord: () => void;
  nextWord: () => void;
  toggleFlag: () => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  currentWord,
  revealAnswer,
  setRevealAnswer,
  settings,
  currentWordIndex,
  totalWords,
  flaggedWords,
  markAsKnown,
  markAsUnknown,
  prevWord,
  nextWord,
  toggleFlag,
}) => {
  // Use the spacebar to reveal/hide the answer
  useKeyboardShortcut({
    targetKey: ' ',
    onKeyDown: () => setRevealAnswer(!revealAnswer),
  });

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex justify-center items-center gap-2 text-3xl">
          {currentWord.word}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Volume className="h-4 w-4" />
          </Button>
        </CardTitle>
        {settings.showPartOfSpeech && (
          <CardDescription>
            {settings.showPronunciation && (
              <span className="mr-2">{currentWord.pronunciation}</span>
            )}
            <span className="italic">{currentWord.partOfSpeech}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-center py-6">
        {revealAnswer ? (
          <div className="space-y-4">
            <p className="text-lg font-medium">{currentWord.meaning}</p>
            {settings.showExamples && (
              <div className="mt-4 text-muted-foreground">
                <p className="italic">"{currentWord.example}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setRevealAnswer(true)}
              className="min-w-32"
            >
              Reveal Meaning
            </Button>
            <div className="mt-4 text-muted-foreground text-sm flex items-center justify-center">
              <MousePointerClick className="h-3 w-3 mr-1" /> Click to reveal or
              press spacebar
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={!revealAnswer}
            onClick={toggleFlag}
            className={cn(
              flaggedWords.includes(currentWord.id) ? 'text-yellow-500' : ''
            )}
          >
            <Flag
              className={cn(
                'h-4 w-4',
                flaggedWords.includes(currentWord.id) ? 'fill-yellow-500' : ''
              )}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={prevWord}
            disabled={currentWordIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextWord}
            disabled={currentWordIndex === totalWords - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {revealAnswer && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
              onClick={markAsUnknown}
            >
              <ThumbsDown className="h-4 w-4 mr-2" /> Don't Know
            </Button>
            <Button
              variant="outline"
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300"
              onClick={markAsKnown}
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Know It
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
