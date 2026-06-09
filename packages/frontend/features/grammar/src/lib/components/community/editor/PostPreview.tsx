import { GrammarBlock } from '../../../types';
import FormulaBuilder from '../../FormulaBuilder';
import MediaBlock from '../../MediaBlock';
import ExampleBlock from '../../ExampleBlock';
import { CommunityFeedQuiz } from '../CommunityFeedQuiz';

interface PostPreviewProps {
  title: string;
  tags: string[];
  blocks: GrammarBlock[];
  isSplit?: boolean;
}

export function PostPreview({ title, tags, blocks, isSplit = false }: PostPreviewProps) {
  return (
    <div className={`space-y-8 ${isSplit ? 'p-1' : 'max-w-4xl mx-auto py-4'}`}>
      <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
        <div className="h-9 w-9 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
          B
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-slate-200 block">Bạn (Tác giả)</span>
          <span className="text-[9px] text-indigo-400 font-medium block">
            Đang Biên Soạn • Tác Giả Cộng Đồng
          </span>
        </div>
        <div className="flex flex-wrap gap-1 max-w-[50%] justify-end shrink-0">
          {tags.length === 0 ? (
            <span className="text-[9px] text-slate-650 italic">Không có tag</span>
          ) : (
            tags.map((t) => (
              <span
                key={t}
                className="bg-indigo-950/40 text-indigo-300 border border-indigo-955 text-[9px] font-semibold px-2 py-0.5 rounded-md"
              >
                #{t}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-base font-bold text-slate-100 leading-snug">
          {title || <span className="text-slate-600 italic">Chưa nhập tiêu đề bài viết...</span>}
        </h1>
      </div>

      <div className="space-y-6">
        {blocks.map((block, idx) => {
          switch (block.type) {
            case 'media':
              return (
                <div key={block.id || idx} className="space-y-2">
                  <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest block">
                    <span role="img" aria-label="video camera">
                      🎥
                    </span>{' '}
                    Video Bài Giảng
                  </span>
                  <MediaBlock url={block.url || ''} provider={block.provider || 'youtube'} isEditable={false} />
                </div>
              );

            case 'text': {
              const isHeading = (block.content || '').startsWith('### ');
              if (isHeading) {
                const cleanText = (block.content || '').replace('### ', '');
                return (
                  <h2
                    key={block.id || idx}
                    className="text-sm font-extrabold text-white border-l-3 border-indigo-500 pl-2.5 mt-4 mb-2 tracking-wide"
                  >
                    {cleanText}
                  </h2>
                );
              }
              return (
                <div key={block.id || idx} className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl">
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {block.content || ''}
                  </p>
                </div>
              );
            }

            case 'formula':
              return (
                <div
                  key={block.id || idx}
                  className="bg-slate-950/40 border border-slate-900 border-l-3 border-l-indigo-500 p-4 rounded-2xl space-y-3"
                >
                  <span className="text-[8px] font-extrabold text-slate-500 tracking-widest uppercase block">
                    Structure Formula
                  </span>
                  <FormulaBuilder elements={block.elements || []} note={block.note || ''} isEditable={false} />
                </div>
              );

            case 'example':
              return (
                <div
                  key={block.id || idx}
                  className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl space-y-3"
                >
                  <span className="text-[8px] font-extrabold text-slate-500 tracking-widest uppercase block">
                    Examples in Context
                  </span>
                  <ExampleBlock items={block.items || []} isEditable={false} />
                </div>
              );

            case 'callout':
              return (
                <div
                  key={block.id || idx}
                  className="bg-indigo-950/10 border border-indigo-950 rounded-2xl p-4 border-l-3 border-l-indigo-500/70 space-y-1"
                >
                  <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase block">
                    {block.title || 'Lưu ý'}
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {block.content || ''}
                  </p>
                </div>
              );

            case 'quiz': {
              return (
                <div key={block.id || idx} className="relative">
                  <div className="absolute top-2 right-2 flex gap-1 items-center z-10">
                    <span className="text-[8px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900 select-none">
                      TEST PLAYABLE PREVIEW
                    </span>
                  </div>
                  <CommunityFeedQuiz postId={`preview-${block.id || idx}`} block={block} />
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
