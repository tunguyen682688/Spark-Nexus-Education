import React, { KeyboardEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Calendar, Settings2 } from 'lucide-react';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';

interface ArticleRightSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export const ArticleRightSidebar: React.FC<ArticleRightSidebarProps> = ({ form }) => {
  const { register, watch, setValue } = form;
  const tags = watch('tags') || [];
  const title = watch('title') || '';
  const content = watch('content');
  
  // Dynamic SEO Calc
  const hasGoodTitle = title.length > 10;
  const hasTags = tags.length > 0;
  let wordCount = 0;
  if (content && content.blocks && Array.isArray(content.blocks)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content.blocks.forEach((b: any) => {
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
    <div className="w-80 bg-white/40 dark:bg-[#121826]/80 backdrop-blur-xl border-l border-slate-200/60 dark:border-white/5 h-full flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20">
          <Settings2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
          Cài Đặt Biên Tập
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        
        {/* Category */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Phân Loại Nội Dung
          </label>
          <div className="flex flex-col gap-1.5">
            {STUDIO_UI_TEXT.CATEGORIES.map((c: {value: string, label: string}) => (
              <label key={c.value} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 cursor-pointer transition-all duration-200">
                <input 
                  type="radio" 
                  value={c.value} 
                  {...register('category')}
                  className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 bg-transparent focus:ring-indigo-500 dark:focus:ring-indigo-400/50"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Real-time SEO Score */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex justify-between">
            Điểm SEO
            <span className={seoScore >= 80 ? 'text-green-500' : seoScore >= 40 ? 'text-amber-500' : 'text-red-500'}>
              {seoScore}/100
            </span>
          </label>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${seoScore >= 80 ? 'bg-green-500' : seoScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
              style={{ width: `${seoScore}%` }} 
            />
          </div>
          <ul className="text-xs space-y-1.5 mt-2">
            <li className={`flex items-center gap-2 ${hasGoodTitle ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasGoodTitle ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} /> 
              Độ dài tiêu đề tốt
            </li>
            <li className={`flex items-center gap-2 ${hasGoodLength ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasGoodLength ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} /> 
              Nội dung đủ dài ({wordCount}/300 từ)
            </li>
            <li className={`flex items-center gap-2 ${hasTags ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasTags ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} /> 
              Đã thêm thẻ (Tags)
            </li>
          </ul>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Thẻ (Tags)
          </label>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
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
              placeholder="Thêm thẻ mới..."
              onKeyDown={handleAddTag}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Lịch Trình
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              type="button"
              onClick={() => setValue('publishedAt', undefined)}
              className="bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-sm font-medium border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
            >
              Lập Tức
            </button>
            <button 
              type="button"
              className="bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
            >
              Lên Lịch
            </button>
          </div>
          <input 
            type="datetime-local" 
            {...register('publishedAt')}
            className="w-full bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all duration-200"
          />
        </div>

        {/* CEFR Difficulty Level */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Cấp Độ CEFR
          </label>
          <select 
            {...register('difficulty')}
            className="w-full bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all duration-200"
          >
            <option value="">Chọn cấp độ...</option>
            {STUDIO_UI_TEXT.CEFR_LEVELS.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Source URL */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            URL Nguồn (Tùy chọn)
          </label>
          <input 
            {...register('sourceUrl')}
            type="url"
            placeholder="https://example.com/original-article"
            className="w-full bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all duration-200"
          />
        </div>

        {/* Publishing Checklist */}
        <div className="space-y-3 pt-4 border-t border-slate-200/30 dark:border-white/5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Danh Sách Kiểm Tra Xuất Bản
          </label>
          <ul className="space-y-2">
            {[
              { ok: title.length >= 3, label: 'Có tiêu đề (≥ 3 ký tự)' },
              { ok: wordCount >= 50, label: 'Có nội dung (≥ 50 từ)' },
              { ok: watch('category')?.length > 0, label: 'Đã chọn danh mục' },
              { ok: watch('difficulty')?.length > 0, label: 'Đã chọn cấp độ CEFR' },
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-2 text-xs font-medium transition-colors ${item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.ok ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-300 dark:border-slate-700'}`}>
                  {item.ok && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
};
