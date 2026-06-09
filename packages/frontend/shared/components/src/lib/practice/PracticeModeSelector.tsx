import React from 'react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { Button } from '../ui/button';

type PracticeMode = 'flashcard' | 'quiz' | 'matching';

interface PracticeModeSelectorProps {
  currentMode: PracticeMode;
  setCurrentMode: (mode: PracticeMode) => void;
  onQuizModeSelect: () => void;
}

export const PracticeModeSelector: React.FC<PracticeModeSelectorProps> = ({
  currentMode,
  setCurrentMode,
  onQuizModeSelect,
}) => {
  return (
    <div className="mb-6 flex justify-center">
      <div className="inline-flex rounded-md shadow-sm">
        <Button
          variant={currentMode === 'flashcard' ? 'default' : 'outline'}
          className={cn(
            'rounded-l-md rounded-r-none',
            currentMode === 'flashcard' ? '' : 'text-muted-foreground'
          )}
          onClick={() => setCurrentMode('flashcard')}
        >
          Flashcards
        </Button>
        <Button
          variant={currentMode === 'quiz' ? 'default' : 'outline'}
          className={cn(
            'rounded-none border-l-0',
            currentMode === 'quiz' ? '' : 'text-muted-foreground'
          )}
          onClick={() => {
            setCurrentMode('quiz');
            onQuizModeSelect();
          }}
        >
          Quiz
        </Button>
        <Button
          variant={currentMode === 'matching' ? 'default' : 'outline'}
          className={cn(
            'rounded-r-md rounded-l-none border-l-0',
            currentMode === 'matching' ? '' : 'text-muted-foreground'
          )}
          onClick={() => setCurrentMode('matching')}
          disabled={true}
        >
          Matching
        </Button>
      </div>
    </div>
  );
};
