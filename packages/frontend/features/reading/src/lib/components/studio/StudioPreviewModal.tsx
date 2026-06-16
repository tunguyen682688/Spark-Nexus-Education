import React from 'react';
import { X } from 'lucide-react';
import type { StudioFormValues } from '../../types';

interface StudioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  values: StudioFormValues;
}

// Render EditorJS blocks into React elements
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderEditorBlocks(content: any): React.ReactNode {
  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) {
    // Fallback: if content is a string, render as paragraphs
    if (typeof content === 'string' && content.trim()) {
      return content.split(/\n+/).map((para: string, i: number) => (
        <p key={i} className="leading-relaxed">{para}</p>
      ));
    }
    return <p className="text-slate-400 italic">Chưa có nội dung để xem trước.</p>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return content.blocks.map((block: any, index: number) => {
    const key = block.id || index;

    switch (block.type) {
      case 'header': {
        const level = block.data?.level || 2;
        const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return <Tag key={key} className="font-bold text-slate-800 dark:text-slate-100" dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
      }

      case 'paragraph':
        return <p key={key} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;

      case 'list': {
        const items = block.data?.items || [];
        const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag key={key} className={ListTag === 'ol' ? 'list-decimal pl-6 space-y-1' : 'list-disc pl-6 space-y-1'}>
            {items.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ListTag>
        );
      }

      case 'quote':
        return (
          <blockquote key={key} className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400">
            <p dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />
            {block.data?.caption && <cite className="text-sm not-italic text-slate-500">— {block.data.caption}</cite>}
          </blockquote>
        );

      case 'delimiter':
        return <hr key={key} className="border-slate-200 dark:border-slate-700 my-6" />;

      case 'image':
        return (
          <figure key={key} className="my-4">
            <img src={block.data?.file?.url || block.data?.url} alt={block.data?.caption || ''} className="rounded-lg w-full" />
            {block.data?.caption && <figcaption className="text-sm text-center text-slate-500 mt-2">{block.data.caption}</figcaption>}
          </figure>
        );

      case 'bilingualBlock':
        return (
          <div key={key} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 my-4">
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bản gốc</div>
              <div dangerouslySetInnerHTML={{ __html: block.data?.original || '' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bản dịch</div>
              <div dangerouslySetInnerHTML={{ __html: block.data?.translation || '' }} />
            </div>
          </div>
        );

      default:
        return <p key={key} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
    }
  });
}

// Calculate word count from EditorJS OutputData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcWordCount(content: any): number {
  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) return 0;
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content.blocks.forEach((b: any) => {
    if (b.data?.text) {
      const plain = b.data.text.replace(/<[^>]*>?/gm, '').trim();
      if (plain) count += plain.split(/\s+/).length;
    }
  });
  return count;
}

export const StudioPreviewModal: React.FC<StudioPreviewModalProps> = ({
  isOpen,
  onClose,
  values,
}) => {
  if (!isOpen) return null;

  const { title, content, author, category, difficulty } = values;
  const wordCount = calcWordCount(content);
  const estimatedTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-slate-50 dark:bg-[#0A0D14] w-full h-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200/50 dark:border-white/5">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-white dark:bg-[#121826] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full shadow-md transition-all border border-slate-200/50 dark:border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center py-10 px-5">
          
          <div className="max-w-[750px] w-full px-5 py-8 md:py-14 bg-white dark:bg-[#121826]/80 border border-slate-100 dark:border-white/5 shadow-sm rounded-xl space-y-6 md:space-y-8 select-text">
            
            {/* Header Metadata */}
            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-white/5">
              <span className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-widest flex items-center gap-2">
                <span>{category || 'Uncategorized'} • {difficulty || 'Unrated'} Level</span>
                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold px-2 py-0.5 rounded-full select-none text-[10px]">
                  <span role="img" aria-label="thunderbolt">⚡</span> {estimatedTime} min read
                </span>
              </span>
              <h1 className="text-2xl md:text-4xl font-serif font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                {title || 'Untitled Article'}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                By {author || 'Anonymous'} • Preview Mode
              </p>
            </div>

            {/* Article Body Content — Rendered from EditorJS blocks */}
            <div className="text-slate-700 dark:text-slate-300 font-serif space-y-5 md:space-y-6 text-lg leading-relaxed">
              {renderEditorBlocks(content)}
            </div>

          </div>
          
          <div className="h-24" />
        </div>
      </div>
    </div>
  );
};
