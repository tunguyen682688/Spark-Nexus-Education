import React, { useEffect, useState, useCallback } from 'react';
import { BookA, Volume2, AlignLeft, Languages } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@spark-nest-ed/frontend-shared-components';

export const VocabularyPanel: React.FC = () => {
  const [activeMark, setActiveMark] = useState<HTMLElement | null>(null);
  const [vocabData, setVocabData] = useState({
    level: '',
    def: '',
    pron: '',
    ex: '',
    exTrans: '',
  });

  useEffect(() => {
    const handleVocabSelected = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.element) {
        const mark = customEvent.detail.element as HTMLElement;
        setActiveMark(mark);
        setVocabData({
          level: mark.getAttribute('data-level') || '',
          def: mark.getAttribute('data-def') || '',
          pron: mark.getAttribute('data-pron') || '',
          ex: mark.getAttribute('data-ex') || '',
          exTrans: mark.getAttribute('data-ex-trans') || '',
        });
      } else {
        setActiveMark(null);
      }
    };

    window.addEventListener('vocab-selected', handleVocabSelected);
    return () => window.removeEventListener('vocab-selected', handleVocabSelected);
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setVocabData(prev => ({ ...prev, [field]: value }));
    if (activeMark) {
      // Map field names to data attributes
      const attrMap: Record<string, string> = {
        level: 'data-level',
        def: 'data-def',
        pron: 'data-pron',
        ex: 'data-ex',
        exTrans: 'data-ex-trans'
      };
      activeMark.setAttribute(attrMap[field], value);
      
      // We need to dispatch an input event on the editor content to ensure it saves
      const editorElement = activeMark.closest('.codex-editor__redactor');
      if (editorElement) {
        editorElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, [activeMark]);

  return (
    <Sheet open={!!activeMark} onOpenChange={(open) => { if (!open) setActiveMark(null); }}>
      <SheetContent className="w-80 sm:max-w-md p-0 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/50">
        {activeMark && (
          <>
            <SheetHeader className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50 text-left">
              <SheetTitle className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0 text-base">
                <BookA className="w-4 h-4 text-blue-500" />
                Cài đặt từ vựng
              </SheetTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Biên tập thông tin từ: <span className="font-semibold text-blue-600 dark:text-blue-400">"{activeMark.textContent}"</span>
              </p>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* CEFR Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            Cấp độ CEFR
          </label>
          <select 
            value={vocabData.level}
            onChange={(e) => handleChange('level', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">Chọn cấp độ...</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        {/* Definition */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <AlignLeft className="w-3.5 h-3.5" />
            Định nghĩa (Tiếng Việt)
          </label>
          <input 
            type="text"
            value={vocabData.def}
            onChange={(e) => handleChange('def', e.target.value)}
            placeholder="Ví dụ: con chó"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Pronunciation */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5" />
            Phiên âm (IPA)
          </label>
          <input 
            type="text"
            value={vocabData.pron}
            onChange={(e) => handleChange('pron', e.target.value)}
            placeholder="Ví dụ: /dɒg/"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50"></div>

        {/* Example */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookA className="w-3.5 h-3.5" />
            Câu ví dụ (Tiếng Anh)
          </label>
          <textarea 
            value={vocabData.ex}
            onChange={(e) => handleChange('ex', e.target.value)}
            placeholder="A cute dog."
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Example Translation */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Languages className="w-3.5 h-3.5" />
            Dịch nghĩa câu ví dụ
          </label>
          <textarea 
            value={vocabData.exTrans}
            onChange={(e) => handleChange('exTrans', e.target.value)}
            placeholder="Một chú chó dễ thương."
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
          />
        </div>

            </div>
            
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end shrink-0">
              <Button onClick={() => setActiveMark(null)} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/20">
                Hoàn tất
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
