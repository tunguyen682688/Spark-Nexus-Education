import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import type { StudioFormValues } from '../../types';
import { BlockEditor } from './BlockEditor';
import { Clock, Type, BookOpen } from 'lucide-react';

interface StudioEditorProps {
  form: UseFormReturn<StudioFormValues>;
  wordCount?: number;
  estimatedReadTime?: number;
  isChapter?: boolean;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({ 
  form, 
  wordCount = 0, 
  estimatedReadTime = 0,
  isChapter = false
}) => {
  const { register, control, watch } = form;
  const difficulty = watch('difficulty');

  const titleField: 'title' | 'chapterTitle' = isChapter ? 'chapterTitle' : 'title';
  const contentField: 'content' | 'chapterContent' = isChapter ? 'chapterContent' : 'content';

  return (
    <div className="flex-1 flex flex-col min-h-[800px] w-full max-w-4xl mx-auto pt-8 pb-32 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white/60 dark:bg-[#121826]/60 backdrop-blur-3xl rounded-3xl p-8 shadow-sm border border-slate-200/50 dark:border-white/5 mb-8 transition-all hover:shadow-md hover:dark:border-white/10">
        {/* Title Input */}
        <TextareaAutosize
          {...register(titleField)}
          placeholder={isChapter ? "Nhập tên chương sách..." : STUDIO_UI_TEXT.EDITOR_TITLE_PLACEHOLDER}
          className="w-full text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none border-none focus:outline-none focus:ring-0 p-0 mb-6 bg-transparent leading-tight"
        />

        {/* Summary / Subtitle Input (Optional, hide for chapters) */}
        {!isChapter && (
          <TextareaAutosize
            {...register('summary')}
            placeholder={STUDIO_UI_TEXT.EDITOR_SUMMARY_PLACEHOLDER}
            className="w-full text-xl font-medium text-slate-500 dark:text-slate-400 placeholder:text-slate-300/80 dark:placeholder:text-slate-600 resize-none border-none focus:outline-none focus:ring-0 p-0 mb-6 bg-transparent leading-relaxed"
          />
        )}

        {/* Metadata Bar */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
            <Type className="w-3.5 h-3.5" />
            <span>{wordCount.toLocaleString()} từ</span>
          </div>
          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>~{estimatedReadTime} phút đọc</span>
          </div>
          {difficulty && !isChapter && (
            <>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{difficulty}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <Controller
        name={contentField}
        control={control}
        render={({ field }) => (
          <BlockEditor 
            value={field.value ?? null} 
            onChange={field.onChange} 
            placeholder={STUDIO_UI_TEXT.EDITOR_CONTENT_PLACEHOLDER}
          />
        )}
      />

    </div>
  );
};

export default StudioEditor;
