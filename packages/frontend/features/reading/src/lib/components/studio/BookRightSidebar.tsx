import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Target, BarChart2, Link as LinkIcon, Plus } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@spark-nest-ed/frontend-shared-components';
import type { StudioFormValues, EditorJsBlock, EditorJsOutputData } from '../../types';

interface BookRightSidebarProps {
  form: UseFormReturn<StudioFormValues>;
}

export const BookRightSidebar: React.FC<BookRightSidebarProps> = ({ form }) => {
  const [targetVocab, setTargetVocab] = useState<string[]>([]);
  const content = form.watch('content');

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

  // Basic heuristic for CEFR
  let wordCount = 0;
  if (parsedContent && parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
    parsedContent.blocks.forEach((b: EditorJsBlock) => {
      if (b.type === 'paragraph' && b.data?.text) {
        wordCount += b.data.text.split(/\s+/).length;
      }
    });
  }

  // Generate dynamic CEFR percentages based on wordCount (just a heuristic for demo)
  const c1Percent = Math.min(80, Math.max(10, Math.floor(wordCount / 10)));
  const b2Percent = Math.max(0, 80 - c1Percent);
  const b1Percent = 100 - c1Percent - b2Percent;

  // Listen to Vocabulary Panel events to update Target Vocabulary list
  useEffect(() => {
    const handleVocabSelected = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.element) {
        const mark = customEvent.detail.element as HTMLElement;
        const word = mark.textContent?.trim();
        if (word) {
          setTargetVocab(prev => {
            if (!prev.includes(word)) return [...prev, word];
            return prev;
          });
        }
      }
    };
    window.addEventListener('vocab-selected', handleVocabSelected);
    return () => window.removeEventListener('vocab-selected', handleVocabSelected);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-transparent font-sans">
      <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3 shrink-0">
        <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
          Curriculum Alignment
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['cefr', 'vocab']} className="w-full">
          
          {/* CEFR Distribution */}
          <AccordionItem value="cefr" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5" />
                Phân bổ CEFR (Ước tính)
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pb-2">
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="w-6 text-slate-600 dark:text-slate-400">C1</span>
                  <div className="flex-1 h-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500 shadow-[0_0_10px_rgba(217,70,239,0.3)]" style={{ width: `${c1Percent}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{c1Percent}%</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="w-6 text-slate-600 dark:text-slate-400">B2</span>
                  <div className="flex-1 h-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" style={{ width: `${b2Percent}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{b2Percent}%</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="w-6 text-slate-600 dark:text-slate-400">B1</span>
                  <div className="flex-1 h-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" style={{ width: `${b1Percent}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{b1Percent}%</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Target Vocabulary */}
          <AccordionItem value="vocab" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Từ Vựng Mục Tiêu
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pb-2">
                {targetVocab.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">Chưa có từ vựng nào được chọn.</span>
                )}
                {targetVocab.map((word, i) => (
                  <span key={i} className="inline-flex items-center bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {word}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Cross-references */}
          <AccordionItem value="links" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Liên Kết Chéo
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <LinkIcon className="w-3 h-3 text-blue-500" />
                    Xem Chương 1: Cấu trúc cơ bản
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                    Nhắc đến ở đoạn 2
                  </div>
                </div>
                
                <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
                  <Plus className="w-3 h-3" />
                  Thêm liên kết
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
};
