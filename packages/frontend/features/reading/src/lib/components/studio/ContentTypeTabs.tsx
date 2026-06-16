import React from 'react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import type { ContentType } from '../../types';
import { FileText, BookOpen, Newspaper, AlignLeft } from 'lucide-react';

interface ContentTypeTabsProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
  disabled?: boolean;
}

export const ContentTypeTabs: React.FC<ContentTypeTabsProps> = ({ value, onChange, disabled }) => {
  const tabs = [
    { id: 'article', label: STUDIO_UI_TEXT.TAB_ARTICLE, icon: FileText },
    { id: 'book', label: 'Sách / Giáo Trình', icon: BookOpen },
    { id: 'news', label: STUDIO_UI_TEXT.TAB_NEWS, icon: Newspaper },
    { id: 'blog', label: STUDIO_UI_TEXT.TAB_BLOG, icon: AlignLeft },
  ] as const;

  return (
    <div className="flex bg-slate-900/5 dark:bg-slate-100/5 p-1 rounded-xl w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as ContentType)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isActive 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-slate-100/5"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
