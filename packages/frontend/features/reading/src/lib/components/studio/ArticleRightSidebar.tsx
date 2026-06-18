import React, { KeyboardEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Calendar, Settings2 } from 'lucide-react';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import type { StudioFormValues, EditorJsBlock, EditorJsOutputData } from '../../types';

interface ArticleRightSidebarProps {
  form: UseFormReturn<StudioFormValues>;
}

export const ArticleRightSidebar: React.FC<ArticleRightSidebarProps> = ({ form }) => {
  const { register, watch, setValue } = form;
  const tags = watch('tags') || [];
  const title = watch('title') || '';
  const content = watch('content');
  
  // Dynamic SEO Calc
  const hasGoodTitle = title.length > 10;
  const hasTags = tags.length > 0;
  
  const contentVal = content as unknown;
  let parsedContent: EditorJsOutputData | null = null;
  if (contentVal) {
    if (typeof contentVal === 'object') {
      parsedContent = contentVal as EditorJsOutputData;
    } else if (typeof contentVal === 'string' && contentVal.trim()) {
      try {
        parsedContent = JSON.parse(contentVal) as EditorJsOutputData;
      } catch {
        parsedContent = null;
      }
    }
  }

  let wordCount = 0;
  if (parsedContent && parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
    parsedContent.blocks.forEach((b: EditorJsBlock) => {
      if (b.type === 'paragraph' && b.data?.text) {
        wordCount += b.data.text.split(/\s+/).length;
      }
    });
  }
  const hasGoodLength = wordCount >= 300;
  
  let seoScore = 0;
  if (hasGoodTitle) seoScore += 40;
  if (hasGoodLength) seoScore += 40;
  if (hasTags) seoScore += 20;

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setValue('tags', [...tags, newTag], { shouldValidate: true, shouldDirty: true });
        e.currentTarget.value = '';
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((t: string) => t !== tagToRemove), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent font-sans">
      <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3 shrink-0">
        <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
          <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
          Cài Đặt Biên Tập
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['category', 'seo']} className="w-full">
          
          {/* Category */}
          <AccordionItem value="category" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Phân Loại Nội Dung
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 pb-2">
                {STUDIO_UI_TEXT.CATEGORIES.map((c: {value: string, label: string}) => (
                  <label key={c.value} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 cursor-pointer transition-all duration-200">
                    <input 
                      type="radio" 
                      value={c.value} 
                      {...register('category')}
                      className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 bg-transparent focus:ring-blue-500 dark:focus:ring-blue-400/50"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{c.label}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Real-time SEO Score */}
          <AccordionItem value="seo" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center justify-between w-full pr-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Điểm SEO
                </span>
                <span className={cn(
                  "text-xs font-bold",
                  seoScore >= 80 ? "text-green-500" : seoScore >= 40 ? "text-amber-500" : "text-red-500"
                )}>
                  {seoScore}/100
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pb-2">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      seoScore >= 80 ? "bg-green-500" : seoScore >= 40 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${seoScore}%` }} 
                  />
                </div>
                <ul className="text-xs space-y-1.5 mt-2">
                  <li className={cn(
                    "flex items-center gap-2",
                    hasGoodTitle ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      hasGoodTitle ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                    )} /> 
                    Độ dài tiêu đề tốt
                  </li>
                  <li className={cn(
                    "flex items-center gap-2",
                    hasGoodLength ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      hasGoodLength ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                    )} /> 
                    Nội dung đủ dài ({wordCount}/300 từ)
                  </li>
                  <li className={cn(
                    "flex items-center gap-2",
                    hasTags ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      hasTags ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                    )} /> 
                    Đã thêm thẻ (Tags)
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tags */}
          <AccordionItem value="tags" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Thẻ (Tags)
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-md">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 hover:text-red-500 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Nhập thẻ và nhấn Enter..."
                  onKeyDown={handleAddTag}
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Schedule */}
          <AccordionItem value="schedule" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Lịch Trình
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setValue('publishedAt', undefined)}
                    className="bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-sm font-medium border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
                  >
                    Lập Tức
                  </button>
                  <button 
                    type="button"
                    className="bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
                  >
                    Lên Lịch
                  </button>
                </div>
                <input 
                  type="datetime-local" 
                  {...register('publishedAt')}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* CEFR Difficulty Level */}
          <AccordionItem value="difficulty" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Cấp Độ CEFR
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2">
                <select 
                  {...register('difficulty')}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200"
                >
                  <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Chọn cấp độ...</option>
                  {STUDIO_UI_TEXT.CEFR_LEVELS.map(l => (
                    <option key={l.value} value={l.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Source URL */}
          <AccordionItem value="source" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                URL Nguồn
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2">
                <input 
                  {...register('sourceUrl')}
                  type="url"
                  placeholder="https://example.com/..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Publishing Checklist */}
          <AccordionItem value="checklist" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Điều Kiện Xuất Bản
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pb-2">
                {[
                  { ok: title.length >= 3, label: 'Có tiêu đề (≥ 3 ký tự)' },
                  { ok: wordCount >= 50, label: 'Có nội dung (≥ 50 từ)' },
                  { ok: watch('category')?.length > 0, label: 'Đã chọn danh mục' },
                  { ok: watch('difficulty')?.length > 0, label: 'Đã chọn cấp độ CEFR' },
                ].map((item, i) => (
                  <li key={i} className={cn(
                    "flex items-center gap-2 text-xs font-medium transition-colors",
                    item.ok ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"
                  )}>
                    <span className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      item.ok ? "border-emerald-500 bg-emerald-500/20" : "border-slate-300 dark:border-slate-700"
                    )}>
                      {item.ok && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </div>
    </div>
  );
};
