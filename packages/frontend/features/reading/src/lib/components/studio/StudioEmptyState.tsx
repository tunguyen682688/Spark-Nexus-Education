import React from 'react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { PenLine, Link as LinkIcon, LayoutTemplate, Edit3 } from 'lucide-react';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';

interface StudioEmptyStateProps {
  onCreateNew: () => void;
  onImportUrl: () => void;
  onChooseTemplate: () => void;
}

export const StudioEmptyState: React.FC<StudioEmptyStateProps> = ({
  onCreateNew,
  onImportUrl,
  onChooseTemplate,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-900/5 dark:bg-slate-100/5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 border-dashed m-6">
      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center mb-6">
        <Edit3 className="w-8 h-8 text-blue-600 dark:text-blue-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        {STUDIO_UI_TEXT.EMPTY_TITLE}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm text-center">
        {STUDIO_UI_TEXT.EMPTY_DESC}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button 
          onClick={onCreateNew} 
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold px-6 py-5 rounded-xl shadow-sm"
        >
          <PenLine className="w-5 h-5" />
          {STUDIO_UI_TEXT.BTN_CREATE_NEW}
        </Button>

        <Button 
          variant="outline"
          onClick={onImportUrl} 
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2 font-semibold px-6 py-5 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <LinkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">{STUDIO_UI_TEXT.BTN_IMPORT_URL}</span>
        </Button>

        <Button 
          variant="outline"
          onClick={onChooseTemplate} 
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2 font-semibold px-6 py-5 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <LayoutTemplate className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">{STUDIO_UI_TEXT.BTN_CHOOSE_TEMPLATE}</span>
        </Button>
      </div>
    </div>
  );
};
