import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { PART_TITLES } from './part-titles.constants';

interface TopBreadcrumbProps {
  examTitle: string;
  partTitle: string;
  questionNumber: number;
  totalQuestions: number;
  isPublished?: boolean;
  isDirty?: boolean;
  lastSavedAt?: Date;
  onBack: () => void;
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
}

export function TopBreadcrumb({
  examTitle,
  partTitle,
  questionNumber,
  totalQuestions,
  isPublished = false,
  isDirty = false,
  lastSavedAt,
  onBack,
  onSave,
  onPublish,
  isSaving,
}: TopBreadcrumbProps) {
  const hasQuestion = questionNumber > 0;

  const partMatch = partTitle?.match(/^Part (\d+)/);
  const partNumber = partMatch ? parseInt(partMatch[1], 10) : 0;
  const partFullName = partNumber ? `Part ${partNumber}: ${PART_TITLES[partNumber] || ''}` : partTitle;

  return (
    <div className="flex items-center justify-between px-4 h-11 border-b border-border bg-card shrink-0">
      {/* Left: Back + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-all shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lai</span>
        </button>

        <div className="w-px h-5 bg-border shrink-0" />

        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0 overflow-hidden">
          <span className="font-bold text-foreground whitespace-nowrap">{examTitle}</span>
          {isPublished && (
            <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shrink-0">
              Da xuat ban
            </span>
          )}
          {partFullName && (
            <>
              <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50" />
              <span className="whitespace-nowrap">{partFullName}</span>
            </>
          )}
          {hasQuestion && (
            <>
              <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50" />
              <span className="font-bold text-foreground whitespace-nowrap">
                Cau {questionNumber}/{totalQuestions}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Save status */}
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          {isSaving ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-medium text-amber-600 whitespace-nowrap">Dang luu...</span>
            </>
          ) : isDirty ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[10px] font-medium text-orange-600 whitespace-nowrap">Chua luu</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-600 whitespace-nowrap">
                {lastSavedAt ? `Da luu ${lastSavedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Da luu'}
              </span>
            </>
          )}
        </div>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-border hover:bg-muted/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          Luu nhap
        </button>

        <button
          onClick={onPublish}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Xuat ban
        </button>
      </div>
    </div>
  );
}
