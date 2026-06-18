import React, { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import type { StudioFormValues, EditorJsOutputData } from '../../types';
import { Book, Image as ImageIcon } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface Chapter {
  id: string;
  title: string;
  content: EditorJsOutputData | null;
  isDraft: boolean;
}

interface BookOverviewProps {
  form: UseFormReturn<StudioFormValues>;
  chapters: Chapter[];
  onEditChapter: (id: string) => void;
}

export const BookOverview: React.FC<BookOverviewProps> = ({ form, chapters, onEditChapter }) => {
  const { register, watch, setValue } = form;
  const thumbnailUrl = watch('thumbnailUrl');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setValue('thumbnailUrl', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[800px] w-full max-w-3xl mx-auto pt-8 pb-32">
      <div className="flex items-center gap-3 mb-8 text-blue-600 dark:text-blue-400">
        <Book className="w-6 h-6" />
        <h1 className="text-xl font-bold uppercase tracking-widest">Tổng quan sách</h1>
      </div>

      <TextareaAutosize
        {...register('title')}
        placeholder="Nhập tựa đề sách..."
        className="w-full text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none border-none focus:outline-none focus:ring-0 p-0 mb-6 bg-transparent"
      />

      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="w-full md:w-1/3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div 
            onClick={handleContainerClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "aspect-[2/3] w-full rounded-xl overflow-hidden flex flex-col items-center justify-center relative group cursor-pointer transition-all duration-200 border-2 border-dashed",
              isDragging 
                ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 scale-[0.98]" 
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
            )}
          >
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 p-4 text-center">
                <ImageIcon className="w-10 h-10 mb-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-semibold block">Tải ảnh bìa</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">Kéo thả hoặc Click chọn ảnh</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Thay đổi ảnh bìa</span>
            </div>
          </div>
          <input 
            type="url"
            placeholder="URL ảnh bìa..."
            className="w-full mt-3 text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={thumbnailUrl || ''}
            onChange={(e) => setValue('thumbnailUrl', e.target.value)}
          />
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tác giả
            </label>
            <input 
              {...register('author')}
              type="text"
              placeholder="Tên tác giả..."
              className="w-full text-base px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Cấp độ CEFR
            </label>
            <select 
              {...register('difficulty')}
              className="w-full text-base px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="" disabled>{STUDIO_UI_TEXT.EDITOR_DIFFICULTY_PLACEHOLDER}</option>
              {STUDIO_UI_TEXT.CEFR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Thể loại
            </label>
            <select 
              {...register('category')}
              className="w-full text-base px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="" disabled>{STUDIO_UI_TEXT.EDITOR_CATEGORY_PLACEHOLDER}</option>
              {STUDIO_UI_TEXT.CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Tóm tắt nội dung sách
        </label>
        <TextareaAutosize
          {...register('summary')}
          minRows={5}
          placeholder="Viết nội dung giới thiệu ngắn gọn về cuốn sách..."
          className="w-full text-base px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
        />
      </div>

      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Cài đặt nâng cao (Hỗ trợ học tập)</h3>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Liên kết Audio (Tuỳ chọn)
          </label>
          <input 
            {...register('audioUrl')}
            type="url"
            placeholder="Nhập URL file audio (mp3) để luyện nghe..."
            className="w-full text-base px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <input 
            type="checkbox"
            {...register('isBilingual')}
            className="w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500 bg-white dark:bg-slate-800"
          />
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">Tài liệu Song Ngữ</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Đánh dấu sách này có hỗ trợ đối chiếu bản dịch (Line-by-line translation).</div>
          </div>
        </label>
      </div>

    </div>
  );
};
