import React from 'react';
import { Plus, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface Chapter {
  id: string;
  title: string;
  isDraft?: boolean;
}

interface BookStudioSidebarProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onChapterSelect: (id: string) => void;
  onAddChapter: () => void;
  onSelectOverview: () => void;
  isOverviewActive: boolean;
}

export const BookStudioSidebar: React.FC<BookStudioSidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  onAddChapter,
  onSelectOverview,
  isOverviewActive,
}) => {
  return (
    <div className="w-64 bg-white/40 dark:bg-[#121826]/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5 h-full flex flex-col shrink-0 font-sans">
      <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
          Manuscript Tree
        </h2>
        <button 
          onClick={onAddChapter}
          className="p-1 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 hover:scale-110 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
        <button
          onClick={onSelectOverview}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-all duration-200 mb-4",
            isOverviewActive
              ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent"
          )}
        >
          <Settings className={cn("w-4 h-4", isOverviewActive ? "text-blue-500" : "text-slate-400")} />
          Curriculum Overview
        </button>

        <div className="flex flex-col gap-1.5">
          {chapters.map((chapter, idx) => {
            const isActive = activeChapterId === chapter.id && !isOverviewActive;
            return (
              <div
                key={chapter.id}
                onClick={() => onChapterSelect(chapter.id)}
                className={cn(
                  "group w-full flex flex-col cursor-pointer transition-all duration-200"
                )}
              >
                <div className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-[0_4px_15px_-3px_rgba(79,70,229,0.4)]" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5 font-medium border border-transparent hover:border-slate-200/50 dark:hover:border-white/5"
                )}>
                  <div className="flex items-center gap-2">
                    <ChevronDown className={cn("w-4 h-4", isActive ? "text-blue-200" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200")} />
                    <span className="truncate">Ch. {idx + 1}: {chapter.title}</span>
                  </div>
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 shadow-sm", isActive ? "bg-white" : (chapter.isDraft ? "bg-amber-400" : "bg-emerald-500"))} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
