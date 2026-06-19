import React, { useEffect, useState, useCallback } from 'react';
import { BookA, Volume2, AlignLeft, Languages, Loader2 } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@spark-nest-ed/frontend-shared-components';
import { useVocabularyEntryDetail, useContextTranslation } from '../../hooks/use-reading';

export const VocabularyPanel: React.FC = () => {
  const [activeMark, setActiveMark] = useState<HTMLElement | null>(null);
  const [vocabData, setVocabData] = useState({
    level: '',
    def: '',
    pron: '',
    ex: '',
    exTrans: '',
  });

  const [suggestionWord, setSuggestionWord] = useState<string>('');
  const [suggestionSentence, setSuggestionSentence] = useState<string>('');

  const { data: dictData, isFetching: isFetchingDict } = useVocabularyEntryDetail(suggestionWord);
  const { data: contextData, isFetching: isFetchingContext } = useContextTranslation(suggestionWord, suggestionSentence);

  const triggerSaveEvent = useCallback(() => {
    if (activeMark) {
      const editorElement = activeMark.closest('.codex-editor__redactor');
      if (editorElement) {
        editorElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, [activeMark]);

  useEffect(() => {
    const handleVocabSelected = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.element) {
        const mark = customEvent.detail.element as HTMLElement;
        setActiveMark(mark);
        
        const initialLevel = mark.getAttribute('data-level') || '';
        const initialDef = mark.getAttribute('data-def') || '';
        const initialPron = mark.getAttribute('data-pron') || '';
        const initialEx = mark.getAttribute('data-ex') || '';
        const initialExTrans = mark.getAttribute('data-ex-trans') || '';

        setVocabData({
          level: initialLevel,
          def: initialDef,
          pron: initialPron,
          ex: initialEx,
          exTrans: initialExTrans,
        });

        // Set suggestion triggers if definition or pronunciation are missing
        if (!initialDef && !initialPron) {
          const word = mark.textContent?.trim() || '';
          if (word) {
            setSuggestionWord(word);
            const blockElement = mark.closest('.ce-block__content');
            const blockText = blockElement ? blockElement.textContent || '' : '';
            setSuggestionSentence(blockText);
          } else {
            setSuggestionWord('');
            setSuggestionSentence('');
          }
        } else {
          setSuggestionWord('');
          setSuggestionSentence('');
        }
      } else {
        setActiveMark(null);
        setSuggestionWord('');
        setSuggestionSentence('');
      }
    };

    window.addEventListener('vocab-selected', handleVocabSelected);
    return () => window.removeEventListener('vocab-selected', handleVocabSelected);
  }, []);

  // Update vocabData and DOM attributes when dictData is resolved
  useEffect(() => {
    if (dictData && activeMark) {
      const suggestedDef = dictData.senses?.[0]?.definition || dictData.notes || '';
      const suggestedPron = dictData.pronunciation || '';
      const suggestedLevel = dictData.senses?.[0]?.level || dictData.partOfSpeech || '';

      setVocabData(prev => {
        const updated = {
          ...prev,
          def: prev.def || suggestedDef,
          pron: prev.pron || suggestedPron,
          level: prev.level || suggestedLevel,
        };

        if (updated.level) activeMark.setAttribute('data-level', updated.level);
        if (updated.def) activeMark.setAttribute('data-def', updated.def);
        if (updated.pron) activeMark.setAttribute('data-pron', updated.pron);
        activeMark.setAttribute('data-entry-id', dictData.id);

        triggerSaveEvent();
        return updated;
      });
    }
  }, [dictData, activeMark, triggerSaveEvent]);

  // Update vocabData and DOM attributes when contextData is resolved
  useEffect(() => {
    if (contextData && activeMark) {
      const suggestedDef = contextData.translation || '';
      const suggestedEx = suggestionSentence;
      const suggestedExTrans = contextData.explanation || '';

      setVocabData(prev => {
        const updated = {
          ...prev,
          def: prev.def || suggestedDef,
          ex: prev.ex || suggestedEx,
          exTrans: prev.exTrans || suggestedExTrans,
        };

        if (updated.def) activeMark.setAttribute('data-def', updated.def);
        if (updated.ex) activeMark.setAttribute('data-ex', updated.ex);
        if (updated.exTrans) activeMark.setAttribute('data-ex-trans', updated.exTrans);

        triggerSaveEvent();
        return updated;
      });
    }
  }, [contextData, activeMark, triggerSaveEvent, suggestionSentence]);

  const handleChange = useCallback((field: string, value: string) => {
    setVocabData(prev => ({ ...prev, [field]: value }));
    if (activeMark) {
      const attrMap: Record<string, string> = {
        level: 'data-level',
        def: 'data-def',
        pron: 'data-pron',
        ex: 'data-ex',
        exTrans: 'data-ex-trans'
      };
      activeMark.setAttribute(attrMap[field], value);
      triggerSaveEvent();
    }
  }, [activeMark, triggerSaveEvent]);

  const unwrapMark = useCallback(() => {
    if (activeMark) {
      const parent = activeMark.parentNode;
      if (parent) {
        while (activeMark.firstChild) {
          parent.insertBefore(activeMark.firstChild, activeMark);
        }
        parent.removeChild(activeMark);
        setActiveMark(null);
        setSuggestionWord('');
        setSuggestionSentence('');
        triggerSaveEvent();
      }
    }
  }, [activeMark, triggerSaveEvent]);

  const loadingSuggestions = isFetchingDict || isFetchingContext;

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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                Biên tập thông tin từ: <span className="font-semibold text-blue-600 dark:text-blue-400">"{activeMark.textContent}"</span>
                {loadingSuggestions && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang gợi ý...
                  </span>
                )}
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
            
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col gap-2 shrink-0">
              <Button onClick={unwrapMark} variant="outline" className="w-full border-red-200 text-red-650 hover:bg-red-50 hover:text-red-750 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 rounded-lg">
                Huỷ bôi đậm
              </Button>
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
