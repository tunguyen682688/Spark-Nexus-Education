import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Target, BarChart2, Link as LinkIcon, Plus, BookOpen } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, useToast } from '@spark-nest-ed/frontend-shared-components';
import type { StudioFormValues, EditorJsBlock, EditorJsOutputData } from '../../types';
import { useUserVocabularyPackages, useCreateVocabularyPackage } from '../../hooks/use-reading';

interface BookRightSidebarProps {
  form: UseFormReturn<StudioFormValues>;
}

export const BookRightSidebar: React.FC<BookRightSidebarProps> = ({ form }) => {
  const { register, setValue } = form;
  const [targetVocab, setTargetVocab] = useState<string[]>([]);
  const content = form.watch('content');

  const { toast } = useToast();
  const [newVocabTitle, setNewVocabTitle] = useState('');
  const { data: vocabSetsResponse } = useUserVocabularyPackages();
  const createVocabMutation = useCreateVocabularyPackage();

  const vocabSets = vocabSetsResponse?.data || [];

  const handleCreateVocabSet = async () => {
    if (!newVocabTitle.trim()) return;
    try {
      const newSet = await createVocabMutation.mutateAsync({
        title: newVocabTitle.trim(),
        language: 'en',
        type: 'reading',
      });
      toast({
        title: 'Tạo thành công',
        description: `Đã tạo bộ từ vựng "${newSet.title}"`,
      });
      setValue('vocabularySetId', newSet.id, { shouldValidate: true, shouldDirty: true });
      setNewVocabTitle('');
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo bộ từ vựng mới',
        variant: 'destructive',
      });
    }
  };

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

          {/* Vocabulary Set */}
          <AccordionItem value="vocabularySet" className="border-b border-slate-200/60 dark:border-white/5 px-5">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Bộ Từ Vựng
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2 space-y-3">
                <select 
                  {...register('vocabularySetId')}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200"
                >
                  <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    Tự động tạo bộ từ vựng mới
                  </option>
                  {vocabSets.map((set) => (
                    <option key={set.id} value={set.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {set.title} ({set.entryCount} từ)
                    </option>
                  ))}
                </select>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 italic pl-1">
                  Mặc định hệ thống tự động tạo một bộ từ vựng riêng cho sách. Bạn có thể chọn liên kết với bộ từ vựng có sẵn của mình.
                </div>

                <div className="border-t border-slate-200/60 dark:border-white/5 pt-3">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5 pl-1">
                    Hoặc tạo nhanh bộ từ vựng mới
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tên bộ từ vựng..."
                      value={newVocabTitle}
                      onChange={(e) => setNewVocabTitle(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreateVocabSet}
                      disabled={createVocabMutation.isPending || !newVocabTitle.trim()}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 transition-all"
                    >
                      {createVocabMutation.isPending ? '...' : 'Tạo'}
                    </button>
                  </div>
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
