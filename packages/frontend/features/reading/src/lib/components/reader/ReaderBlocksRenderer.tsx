import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import type { EditorJsOutputData, EditorJsBlock, WeakWordItem, ArticleVocabularyHighlight } from '../../types';
import { useWeakWords } from '../../hooks/use-reading';
import { highlightAndBionicTransform } from '../../services/reading.service';
import type { VocabHighlightInfo } from '../../services/reading.service';
import { readingApi } from '../../api/reading-api';
import { ReaderBlockItem } from './ReaderBlockItem';

interface ReaderBlocksRendererProps {
  content: EditorJsOutputData | null | string;
  isBionicMode: boolean;
  fixation: number;
  saccade: number;
  isBilingualView?: boolean;
  vocabularyHighlights?: ArticleVocabularyHighlight[];
}

export const ReaderBlocksRenderer: React.FC<ReaderBlocksRendererProps> = ({
  content,
  isBionicMode,
  fixation,
  saccade,
  isBilingualView = false,
  vocabularyHighlights = [],
}) => {
  const { data: weakWords } = useWeakWords();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [hoveredWord, setHoveredWord] = useState<{
    word: string;
    definition: string;
    pronunciation: string;
    audioUrl: string;
    x: number;
    y: number;
  } | null>(null);

  const [translatedBlocks, setTranslatedBlocks] = useState<Record<string | number, { text: string; loading: boolean }>>({});
  const [activeTranslations, setActiveTranslations] = useState<Record<string | number, boolean>>({});

  const weakWordsMap = useMemo(() => {
    const map = new Map<string, WeakWordItem>();
    if (weakWords) {
      weakWords.forEach((item) => {
        map.set(item.word.toLowerCase().trim(), item);
      });
    }
    return map;
  }, [weakWords]);

  // Build a Map<blockId, Map<wordIndex, VocabHighlightInfo>> from decoupled highlights
  const vocabHighlightsByBlock = useMemo(() => {
    const map = new Map<string, Map<number, VocabHighlightInfo>>();
    if (vocabularyHighlights && vocabularyHighlights.length > 0) {
      vocabularyHighlights.forEach((h) => {
        if (!map.has(h.blockId)) {
          map.set(h.blockId, new Map());
        }
        map.get(h.blockId)!.set(h.wordIndex, {
          word: h.entry.word,
          definition: h.customDefinition || h.entry.notes || null,
          pronunciation: h.entry.pronunciation || null,
          partOfSpeech: h.entry.partOfSpeech || null,
        });
      });
    }
    return map;
  }, [vocabularyHighlights]);

  const createTransformText = useMemo(() => {
    return (blockId?: string) => (txt: string) => {
      if (!txt) return '';
      const blockVocabMap = blockId ? vocabHighlightsByBlock.get(blockId) : undefined;
      return highlightAndBionicTransform(txt, isBionicMode, fixation, saccade, weakWordsMap, blockVocabMap);
    };
  }, [isBionicMode, fixation, saccade, weakWordsMap, vocabHighlightsByBlock]);

  const handleTranslateBlock = async (key: string | number, textContent: string) => {
    if (activeTranslations[key]) {
      setActiveTranslations(prev => ({ ...prev, [key]: false }));
      return;
    }

    if (translatedBlocks[key]) {
      setActiveTranslations(prev => ({ ...prev, [key]: true }));
      return;
    }

    setTranslatedBlocks(prev => ({ ...prev, [key]: { text: '', loading: true } }));
    try {
      const res = await readingApi.translateParagraph(textContent);
      setTranslatedBlocks(prev => ({ ...prev, [key]: { text: res.translation, loading: false } }));
      setActiveTranslations(prev => ({ ...prev, [key]: true }));
    } catch (err) {
      console.error("Translation error:", err);
      setTranslatedBlocks(prev => ({ ...prev, [key]: { text: 'Không thể dịch đoạn văn này. Vui lòng thử lại.', loading: false } }));
      setActiveTranslations(prev => ({ ...prev, [key]: true }));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Support both weak-word-highlight and vocab-highlight
      const highlightEl = target.closest('.weak-word-highlight, .vocab-highlight') as HTMLElement | null;
      if (highlightEl) {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        
        const word = highlightEl.getAttribute('data-word') || '';
        const definition = highlightEl.getAttribute('data-def') || '';
        const pronunciation = highlightEl.getAttribute('data-pron') || '';
        const audioUrl = highlightEl.getAttribute('data-audio') || '';

        const rect = highlightEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setHoveredWord({
          word,
          definition,
          pronunciation,
          audioUrl,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const highlightEl = target.closest('.weak-word-highlight, .vocab-highlight') as HTMLElement | null;
      if (highlightEl) {
        hideTimeoutRef.current = setTimeout(() => {
          setHoveredWord(null);
        }, 300);
      }
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);
    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredWord(null);
    }, 300);
  };

  const playAudio = (url: string, fallbackWord: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => {
        const utterance = new SpeechSynthesisUtterance(fallbackWord);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      });
    } else {
      const utterance = new SpeechSynthesisUtterance(fallbackWord);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Normalization logic: unify string content and EditorJS output blocks
  const blocks = useMemo((): EditorJsBlock[] => {
    if (!content) return [];
    if (typeof content !== 'object' || !Array.isArray(content.blocks)) {
      if (typeof content === 'string' && content.trim()) {
        return content.split(/\n+/).map((para, i) => ({
          id: `str-para-${i}`,
          type: 'paragraph',
          data: { text: para },
        }));
      }
      return [];
    }
    return content.blocks;
  }, [content]);

  return (
    <div ref={containerRef} className="relative w-full">
      {blocks.length === 0 ? (
        <p className="text-slate-400 italic">Chưa có nội dung để hiển thị.</p>
      ) : (
        blocks.map((block, index) => (
          <ReaderBlockItem
            key={block.id || index}
            block={block}
            index={index}
            transformText={createTransformText(block.id)}
            activeTranslations={activeTranslations}
            translatedBlocks={translatedBlocks}
            onTranslate={handleTranslateBlock}
            isBilingualView={isBilingualView}
          />
        ))
      )}

      {/* Weak Word Tooltip */}
      {hoveredWord && (
        <div
          className="absolute bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl p-3 z-50 text-xs w-64 space-y-2 select-text"
          style={{
            left: `${hoveredWord.x}px`,
            top: `${hoveredWord.y - 10}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="flex justify-between items-start select-none">
            <div>
              <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs capitalize">{hoveredWord.word}</h5>
              {hoveredWord.pronunciation && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-mono">
                  /{hoveredWord.pronunciation}/
                </span>
              )}
            </div>
            <button
              onClick={() => playAudio(hoveredWord.audioUrl, hoveredWord.word)}
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition-colors"
              title="Phát âm"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-sans leading-normal text-[11px] bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800/40">
            {hoveredWord.definition || 'Không có định nghĩa sẵn.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReaderBlocksRenderer;
