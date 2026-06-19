import React, { useState, useEffect } from 'react';
import { LayoutList } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { StudioFormValues, EditorJsBlock } from '../../types';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface ArticleLeftSidebarProps {
  form: UseFormReturn<StudioFormValues>;
}

export const ArticleLeftSidebar: React.FC<ArticleLeftSidebarProps> = ({ form }) => {
  const [headings, setHeadings] = useState<{ id: string, text: string, level: number }[]>([]);

  const content = form.watch('content');

  // Parse EditorJS output blocks
  useEffect(() => {
    if (!content || !content.blocks || !Array.isArray(content.blocks)) {
      setHeadings([]);
      return;
    }

    const newHeadings: { id: string, text: string, level: number }[] = [];
    let hIndex = 0;

    content.blocks.forEach((block: EditorJsBlock) => {
      if (block.type === 'header' && block.data?.text) {
        // Strip HTML tags if any (EditorJS sometimes wraps in bold/italic)
        const textStr = block.data.text.replace(/<[^>]*>?/gm, '');
        hIndex++;
        newHeadings.push({
          id: block.id || `h-${hIndex}`,
          text: textStr,
          level: block.data.level || 2,
        });
      }
    });

    setHeadings(newHeadings);
  }, [content]);

  return (
    <div className="w-full h-full flex flex-col bg-transparent font-sans">
      <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3 shrink-0">
        <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
          <LayoutList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
          Dàn Ý Bài Viết
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {headings.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 opacity-50">
            <LayoutList className="w-8 h-8 text-slate-400 mb-3" />
            <p className="text-xs text-slate-500 text-center font-medium">
              Chưa có nội dung.<br/>Hãy bắt đầu viết nhé!
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {headings.map((h, i) => (
              <li 
                key={i} 
                className={cn(
                  "text-sm py-1.5 px-2 rounded-lg cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200",
                  h.level === 1 && "font-bold text-slate-800 dark:text-slate-200",
                  h.level === 2 && "font-medium text-slate-600 dark:text-slate-400 ml-4 border-l-2 border-slate-200 dark:border-slate-800 pl-3",
                  h.level > 2 && "text-slate-500 dark:text-slate-500 ml-8 border-l-2 border-slate-200 dark:border-slate-800 pl-3"
                )}
              >
                <span className="line-clamp-1">{h.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
