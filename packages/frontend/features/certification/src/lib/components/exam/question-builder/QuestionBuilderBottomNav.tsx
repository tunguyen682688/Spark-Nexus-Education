import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { CertificationUIText } from '../../constants/certification.constants';

interface QuestionBuilderBottomNavProps {
  questionBuilderText: CertificationUIText['questionBuilder'];
  handleDeleteQuestion: () => void;
  handlePreviousQuestion: () => void;
  hasPreviousQuestion: boolean;
  handleNextQuestion: () => void;
}

export const QuestionBuilderBottomNav = ({
  questionBuilderText,
  handleDeleteQuestion,
  handlePreviousQuestion,
  hasPreviousQuestion,
  handleNextQuestion,
}: QuestionBuilderBottomNavProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border bg-card p-4 rounded-2xl shadow-md">
      <Button onClick={handleDeleteQuestion} variant="outline" className="border-rose-200 text-rose-600 dark:border-rose-900/60 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer">
        <Trash2 className="w-4 h-4" />
        <span>{questionBuilderText.bottomNav.deleteQuestion}</span>
      </Button>

      <div className="flex items-center gap-3">
        <Button onClick={handlePreviousQuestion} variant="outline" disabled={!hasPreviousQuestion} className="text-xs font-bold py-2 px-4 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          <span>{questionBuilderText.bottomNav.previousQuestion}</span>
        </Button>

        <Button onClick={handleNextQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm">
          <span>{questionBuilderText.bottomNav.nextQuestion}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};