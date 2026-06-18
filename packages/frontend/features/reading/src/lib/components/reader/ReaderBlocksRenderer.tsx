import React from 'react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import type { EditorJsOutputData, EditorJsBlock } from '../../types';
import { bionicTransformInner } from '../../utils/reader-parser';

interface ReaderBlocksRendererProps {
  content: EditorJsOutputData | null | string;
  isBionicMode: boolean;
  fixation: number;
  saccade: number;
}

export const ReaderBlocksRenderer: React.FC<ReaderBlocksRendererProps> = ({
  content,
  isBionicMode,
  fixation,
  saccade,
}) => {
  const transformText = (txt: string) => {
    if (!txt) return '';
    return isBionicMode ? bionicTransformInner(txt, fixation, saccade) : txt;
  };

  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) {
    if (typeof content === 'string' && (content as string).trim()) {
      return (
        <>
          {(content as string).split(/\n+/).map((para: string, i: number) => {
            if (isBionicMode) {
              return (
                <p
                  key={i}
                  className="leading-relaxed mb-4 text-slate-700 dark:text-slate-355"
                  dangerouslySetInnerHTML={{ __html: bionicTransformInner(para, fixation, saccade) }}
                />
              );
            }
            return (
              <p key={i} className="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
                {para}
              </p>
            );
          })}
        </>
      );
    }
    return <p className="text-slate-400 italic">Chưa có nội dung để hiển thị.</p>;
  }

  return (
    <>
      {content.blocks.map((block: EditorJsBlock, index: number) => {
        const key = block.id || index;

        switch (block.type) {
          case 'header': {
            const level = block.data?.level || 2;
            const text = block.data?.text || '';
            const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

            let sizeClass = 'text-xl md:text-2xl mt-6 mb-3 font-serif';
            if (level === 1) sizeClass = 'text-2xl md:text-3xl mt-8 mb-4 font-serif';
            if (level === 3) sizeClass = 'text-lg md:text-xl mt-5 mb-2 font-serif';

            return (
              <Tag
                key={key}
                className={cn("font-bold text-slate-800 dark:text-slate-100", sizeClass)}
                dangerouslySetInnerHTML={{ __html: transformText(text) }}
              />
            );
          }

          case 'paragraph': {
            const text = block.data?.text || '';
            return (
              <p
                key={key}
                className="leading-relaxed mb-4 text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: transformText(text) }}
              />
            );
          }

          case 'list': {
            const items = block.data?.items || [];
            const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
            const listClass = cn(
              "pl-6 space-y-1 mb-4 text-slate-700 dark:text-slate-300",
              ListTag === 'ol' ? "list-decimal" : "list-disc"
            );

            return (
              <ListTag key={key} className={listClass}>
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
              <blockquote key={key} className="border-l-4 border-blue-500 pl-4 py-1 pr-2 italic text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-r-lg my-4">
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
            return <hr key={key} className="border-slate-200 dark:border-slate-700 my-6" />;

          case 'image': {
            const url = block.data?.file?.url || block.data?.url;
            const caption = block.data?.caption || '';
            return (
              <figure key={key} className="my-6">
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
              <div key={key} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/20 my-4">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Bản gốc / Original</div>
                  <div
                    className="text-slate-800 dark:text-slate-200"
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
              <p
                key={key}
                className="leading-relaxed mb-4 text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: transformText(text) }}
              />
            );
          }
        }
      })}
    </>
  );
};
export default ReaderBlocksRenderer;
