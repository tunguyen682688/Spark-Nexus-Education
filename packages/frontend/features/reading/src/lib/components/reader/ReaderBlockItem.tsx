import React from 'react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { Languages } from 'lucide-react';
import type { EditorJsBlock } from '../../types';
import { buildReaderHeadingId } from '../../utils/reader-parser';

interface ReaderBlockItemProps {
  block: EditorJsBlock;
  index: number;
  transformText: (text: string) => string;
  activeTranslations: Record<string | number, boolean>;
  translatedBlocks: Record<string | number, { text: string; loading: boolean }>;
  onTranslate: (key: string | number, text: string) => void;
  isBilingualView?: boolean;
}

export const ReaderBlockItem: React.FC<ReaderBlockItemProps> = ({
  block,
  index,
  transformText,
  activeTranslations,
  translatedBlocks,
  onTranslate,
  isBilingualView = false,
}) => {
  const key = block.id || index;
  const textContent = block.data?.text || '';

  React.useEffect(() => {
    if (isBilingualView && ['paragraph', 'header', 'default'].includes(block.type)) {
      if (textContent && !translatedBlocks[key]) {
        onTranslate(key, textContent.replace(/<[^>]*>?/gm, ''));
      }
    }
  }, [isBilingualView, block.type, textContent, key, onTranslate, translatedBlocks]);

  switch (block.type) {
    case 'header': {
      const level = block.data?.level || 2;
      const text = block.data?.text || '';
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

      let sizeClass = 'text-xl md:text-2xl mt-6 mb-3 font-serif';
      if (level === 1) sizeClass = 'text-2xl md:text-3xl mt-8 mb-4 font-serif';
      if (level === 3) sizeClass = 'text-lg md:text-xl mt-5 mb-2 font-serif';

      return (
        <div className="group relative flex items-start gap-3 mt-6 mb-3">
          <div className="flex-1">
            <Tag
              id={buildReaderHeadingId(text, index)}
              className={cn("font-bold text-slate-800 dark:text-slate-100", sizeClass, "mt-0 mb-0")}
              dangerouslySetInnerHTML={{ __html: transformText(text) }}
            />
            {(activeTranslations[key] || isBilingualView) && (
              <div className="mt-1.5 text-sm font-sans font-normal text-slate-500 dark:text-slate-400 italic bg-blue-500/5 dark:bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-0.5 rounded-r-md animate-in fade-in slide-in-from-top-1 duration-200">
                {translatedBlocks[key]?.loading ? (
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    Đang dịch...
                  </span>
                ) : (
                  translatedBlocks[key]?.text
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onTranslate(key, text.replace(/<[^>]*>?/gm, ''))}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 mt-1"
            title="Dịch song ngữ"
          >
            <Languages className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    case 'paragraph': {
      const text = block.data?.text || '';
      return (
        <div className="group relative flex items-start gap-3 mb-4">
          <div className="flex-1">
            <p
              className="leading-relaxed text-slate-705 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: transformText(text) }}
            />
            {(activeTranslations[key] || isBilingualView) && (
              <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 italic bg-blue-500/5 dark:bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-1 rounded-r-md animate-in fade-in slide-in-from-top-1 duration-200">
                {translatedBlocks[key]?.loading ? (
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    Đang dịch...
                  </span>
                ) : (
                  translatedBlocks[key]?.text
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onTranslate(key, text.replace(/<[^>]*>?/gm, ''))}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 mt-0.5"
            title="Dịch song ngữ"
          >
            <Languages className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    case 'list': {
      const items = block.data?.items || [];
      const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
      const listClass = cn(
        "pl-6 space-y-1 mb-4 text-slate-705 dark:text-slate-300",
        ListTag === 'ol' ? "list-decimal" : "list-disc"
      );

      return (
        <ListTag className={listClass}>
          {items.map((item: string, i: number) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: transformText(item) }}
            />
          ))}
        </ListTag>
      );
    }

    case 'quote': {
      const text = block.data?.text || '';
      const caption = block.data?.caption || '';
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-1 pr-2 italic text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-r-lg my-4">
          <p dangerouslySetInnerHTML={{ __html: transformText(text) }} />
          {caption && (
            <cite
              className="text-sm not-italic text-slate-500 block mt-1"
              dangerouslySetInnerHTML={{ __html: transformText(`— ${caption}`) }}
            />
          )}
        </blockquote>
      );
    }

    case 'delimiter':
      return <hr className="border-slate-200 dark:border-slate-700 my-6" />;

    case 'image': {
      const url = block.data?.file?.url || block.data?.url;
      const caption = block.data?.caption || '';
      return (
        <figure className="my-6">
          <img src={url} alt={caption} className="rounded-lg w-full max-h-[450px] object-cover shadow-sm" />
          {caption && (
            <figcaption className="text-sm text-center text-slate-500 mt-2 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'bilingualBlock': {
      const original = block.data?.original || '';
      const translation = block.data?.translation || '';
      return (
        <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/20 my-4">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Bản gốc / Original</div>
            <div
              className="text-slate-800 dark:text-slate-205"
              dangerouslySetInnerHTML={{ __html: transformText(original) }}
            />
          </div>
          <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Bản dịch / Translation</div>
            <div
              className="text-slate-600 dark:text-slate-400 italic"
              dangerouslySetInnerHTML={{ __html: transformText(translation) }}
            />
          </div>
        </div>
      );
    }

    default: {
      const text = block.data?.text || '';
      return (
        <div className="group relative flex items-start gap-3 mb-4">
          <div className="flex-1">
            <p
              className="leading-relaxed text-slate-705 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: transformText(text) }}
            />
            {(activeTranslations[key] || isBilingualView) && (
              <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 italic bg-blue-500/5 dark:bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-1 rounded-r-md animate-in fade-in slide-in-from-top-1 duration-200">
                {translatedBlocks[key]?.loading ? (
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    Đang dịch...
                  </span>
                ) : (
                  translatedBlocks[key]?.text
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onTranslate(key, text.replace(/<[^>]*>?/gm, ''))}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 mt-0.5"
            title="Dịch song ngữ"
          >
            <Languages className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
  }
};
