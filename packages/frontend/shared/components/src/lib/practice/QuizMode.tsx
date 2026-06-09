import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, X } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface WordType {
  id: number;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface QuizModeProps {
  currentWord: WordType;
  quizOptions: QuizOption[];
  selectedOption: number | null;
  handleOptionSelect: (optionId: number) => void;
  settings: {
    showPartOfSpeech: boolean;
    showPronunciation: boolean;
  };
  currentWordIndex: number;
  totalWords: number;
  prevWord: () => void;
  nextWord: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  currentWord,
  quizOptions,
  selectedOption,
  handleOptionSelect,
  settings,
  currentWordIndex,
  totalWords,
  prevWord,
  nextWord,
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl mb-2">{currentWord.word}</CardTitle>
        {settings.showPartOfSpeech && (
          <CardDescription>
            {settings.showPronunciation && (
              <span className="mr-2">{currentWord.pronunciation}</span>
            )}
            <span className="italic">{currentWord.partOfSpeech}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-6">
            What is the meaning of this word?
          </h3>
          <div className="space-y-3">
            {quizOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  'w-full justify-start text-left h-auto py-3 px-4',
                  selectedOption === option.id &&
                    option.isCorrect &&
                    'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-800',
                  selectedOption === option.id &&
                    !option.isCorrect &&
                    'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-800'
                )}
                onClick={() =>
                  selectedOption === null && handleOptionSelect(option.id)
                }
                disabled={selectedOption !== null}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {selectedOption === option.id && option.isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {selectedOption === option.id && !option.isCorrect && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    {selectedOption !== option.id && (
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {['A', 'B', 'C', 'D'][option.id - 1]}
                      </div>
                    )}
                  </div>
                  <div>{option.text}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevWord}
            disabled={currentWordIndex === 0 || selectedOption !== null}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextWord}
            disabled={
              currentWordIndex === totalWords - 1 || selectedOption !== null
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {selectedOption !== null && (
          <div className="text-sm">
            {quizOptions.find((o) => o.id === selectedOption)?.isCorrect ? (
              <span className="text-green-500 font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Correct!
              </span>
            ) : (
              <span className="text-red-500 font-medium flex items-center">
                <X className="h-4 w-4 mr-1" /> Incorrect
              </span>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
