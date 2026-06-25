import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UploadCloud, Info, CheckCircle2, Circle } from 'lucide-react';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import type { StudioFormValues } from '../../types';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface StudioSidebarProps {
  form: UseFormReturn<StudioFormValues>;
  wordCount: number;
  estimatedReadTime: number;
  checklist: {
    hasTitle: boolean;
    hasContent: boolean;
    hasCategory: boolean;
    hasDifficulty: boolean;
  };
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  form,
  wordCount,
  estimatedReadTime,
  checklist,
}) => {
  const thumbnailUrl = form.watch('thumbnailUrl');

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('thumbnailUrl', e.target.value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="w-[300px] flex-shrink-0 flex flex-col gap-6">
      
      {/* Content Info Panel */}
      {wordCount === 0 && !form.watch('title') ? (
        <div className="bg-slate-900/5 dark:bg-slate-100/5 rounded-2xl p-8 flex flex-col items-center text-center border border-slate-200/60 dark:border-slate-800/60">
          <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Info className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{STUDIO_UI_TEXT.SIDEBAR_NO_CONTENT_TITLE}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {STUDIO_UI_TEXT.SIDEBAR_NO_CONTENT_DESC}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            {STUDIO_UI_TEXT.CHECKLIST_TITLE}
          </h3>
          <ul className="space-y-3">
            <li className={cn("text-sm flex items-start gap-2", checklist.hasTitle ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600")}>
              {checklist.hasTitle ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5" /> : <Circle className="w-4 h-4 mt-0.5" />}
              <span>{STUDIO_UI_TEXT.CHECKLIST_HAS_TITLE}</span>
            </li>
            <li className={cn("text-sm flex items-start gap-2", checklist.hasContent ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600")}>
              {checklist.hasContent ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5" /> : <Circle className="w-4 h-4 mt-0.5" />}
              <span>{STUDIO_UI_TEXT.CHECKLIST_HAS_CONTENT}</span>
            </li>
            <li className={cn("text-sm flex items-start gap-2", checklist.hasCategory ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600")}>
              {checklist.hasCategory ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5" /> : <Circle className="w-4 h-4 mt-0.5" />}
              <span>{STUDIO_UI_TEXT.CHECKLIST_HAS_CATEGORY}</span>
            </li>
            <li className={cn("text-sm flex items-start gap-2", checklist.hasDifficulty ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600")}>
              {checklist.hasDifficulty ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5" /> : <Circle className="w-4 h-4 mt-0.5" />}
              <span>{STUDIO_UI_TEXT.CHECKLIST_HAS_DIFFICULTY}</span>
            </li>
          </ul>
        </div>
      )}

      {/* Cover Image Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">{STUDIO_UI_TEXT.SIDEBAR_COVER_IMAGE}</h3>
        
        {thumbnailUrl ? (
          <div className="group relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200 dark:border-slate-700">
            <img src={thumbnailUrl} alt="Cover preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Invalid+Image+URL'; }} />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => form.setValue('thumbnailUrl', null, { shouldDirty: true })}
                className="text-white text-xs font-semibold px-3 py-1.5 bg-red-600 rounded-lg hover:bg-red-700"
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 mb-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <UploadCloud className="w-6 h-6 mb-2" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{STUDIO_UI_TEXT.SIDEBAR_DRAG_DROP}</span>
            <span className="text-xs">{STUDIO_UI_TEXT.SIDEBAR_DRAG_DROP_SUB}</span>
          </div>
        )}

        <input 
          type="url"
          placeholder={STUDIO_UI_TEXT.SIDEBAR_COVER_URL_PLACEHOLDER}
          className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={thumbnailUrl || ''}
          onChange={handleThumbnailChange}
        />
      </div>

      {/* Stats Panel */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{STUDIO_UI_TEXT.STATS_WORDS}</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{wordCount > 0 ? wordCount : STUDIO_UI_TEXT.STATS_NO_VALUE}</span>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{STUDIO_UI_TEXT.STATS_TIME}</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{estimatedReadTime > 0 ? `${estimatedReadTime}m` : STUDIO_UI_TEXT.STATS_NO_VALUE}</span>
        </div>
      </div>
      
    </div>
  );
};
