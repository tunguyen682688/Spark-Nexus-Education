import { CheckCircle2, Save, Eye, Bookmark, RefreshCw, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { CertificationUIText } from '../../constants/certification.constants';

interface QuestionBuilderHeaderProps {
  questionBuilderText: CertificationUIText['questionBuilder'];
  hasPreviousQuestion: boolean;
  hasNextQuestion: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  handleSaveToBank: () => void;
  handleSaveQuestion: () => void;
  onRefresh: () => void;
}

export const QuestionBuilderHeader = ({
  questionBuilderText,
  hasPreviousQuestion,
  hasNextQuestion,
  showPreview,
  setShowPreview,
  handlePreviousQuestion,
  handleNextQuestion,
  handleSaveToBank,
  handleSaveQuestion,
  onRefresh,
}: QuestionBuilderHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {questionBuilderText.title}
          </h1>
          <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border-none">
            {questionBuilderText.badgeMultipleChoice}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {questionBuilderText.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mr-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{questionBuilderText.savedStatus}</span>
        </div>

        <Button onClick={onRefresh} variant="outline" className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>

        <Button onClick={handlePreviousQuestion} disabled={!hasPreviousQuestion} variant="outline" className="text-xs font-bold py-2 px-2.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed" title="Previous question">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button onClick={handleNextQuestion} disabled={!hasNextQuestion} variant="outline" className="text-xs font-bold py-2 px-2.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed" title="Next question">
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button onClick={() => setShowPreview(!showPreview)} variant={showPreview ? 'default' : 'outline'} className={`text-xs font-bold py-2 px-3.5 h-9 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm ${showPreview ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'}`}>
          <Eye className="w-4 h-4" />
          <span>{questionBuilderText.previewBtn}</span>
        </Button>

        <Button onClick={handleSaveToBank} variant="outline" className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Bookmark className="w-4 h-4" />
          <span>{questionBuilderText.saveToBankBtn}</span>
        </Button>

        <Button onClick={handleSaveQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer">
          <Save className="w-4 h-4" />
          <span>{questionBuilderText.saveQuestionBtn}</span>
        </Button>

        <button className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};