import React from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '../ui/drawer';
import { RotateCcw } from 'lucide-react';

interface PracticeResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedWords: number[];
  totalWords: number;
  flaggedWords: number[];
  restartPractice: () => void;
  handleCompletePractice: () => void;
  isMobile: boolean;
}

export const PracticeResults: React.FC<PracticeResultsProps> = ({
  open,
  onOpenChange,
  completedWords,
  totalWords,
  flaggedWords,
  restartPractice,
  handleCompletePractice,
  isMobile,
}) => {
  const progressValue = (completedWords.length / totalWords) * 100;

  const ResultsContent = () => (
    <div className="text-center space-y-4 py-4">
      <div className="text-2xl font-bold">
        {completedWords.length} of {totalWords} words completed
      </div>
      <Progress value={progressValue} className="h-2 max-w-md mx-auto" />

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{completedWords.length}</div>
          <div className="text-sm text-muted-foreground">Known Words</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{flaggedWords.length}</div>
          <div className="text-sm text-muted-foreground">
            Flagged for Review
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Practice Results</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2">
            <ResultsContent />
          </div>
          <DrawerFooter>
            <div className="flex flex-col gap-3">
              <Button onClick={restartPractice}>
                <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
              </Button>
              <Button variant="outline" onClick={handleCompletePractice}>
                Finish
              </Button>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Practice Results</DialogTitle>
          <DialogDescription>
            Here's how you did in this practice session.
          </DialogDescription>
        </DialogHeader>

        <ResultsContent />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={restartPractice} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
          </Button>
          <Button
            variant="outline"
            onClick={handleCompletePractice}
            className="w-full sm:w-auto"
          >
            Finish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
