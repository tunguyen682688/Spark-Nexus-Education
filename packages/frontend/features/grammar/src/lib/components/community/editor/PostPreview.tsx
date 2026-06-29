import { GrammarBlock } from '../../../types';
import { GRAMMAR_UI_TEXT } from '../../../constants';
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

const T = GRAMMAR_UI_TEXT.postPreview;

export function PostPreview({ title, tags, blocks, isSplit = false }: PostPreviewProps) {
  return (
    <div className={`space-y-8 ${isSplit ? 'p-1' : 'max-w-4xl mx-auto py-4'}`}>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
          B
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-foreground block">{T.authorName}</span>
          <span className="text-[9px] text-primary font-medium block">
            {T.authorSubtitle}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 max-w-[50%] justify-end shrink-0">
          {tags.length === 0 ? (
            <span className="text-[9px] text-muted-foreground italic">{T.noTags}</span>
          ) : (
            tags.map((t) => (
              <span
                key={t}
                className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-semibold px-2 py-0.5 rounded-md"
              >
                #{t}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-base font-bold text-foreground leading-snug">
          {title || <span className="text-muted-foreground/45 italic">{T.emptyTitle}</span>}
        </h1>
      </div>

      <div className="space-y-6">
        {blocks.map((block, idx) => {
          switch (block.type) {
            case 'media':
              return (
                <div key={block.id || idx} className="space-y-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                    <span role="img" aria-label="video camera">
                      🎥
                    </span>{' '}
                    {T.mediaLabel}
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
                    className="text-sm font-extrabold text-foreground border-l-3 border-primary pl-2.5 mt-4 mb-2 tracking-wide"
                  >
                    {cleanText}
                  </h2>
                );
              }
              return (
                <div key={block.id || idx} className="bg-muted/20 border border-border p-4 rounded-2xl">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {block.content || ''}
                  </p>
                </div>
              );
            }

            case 'formula':
              return (
                <div
                  key={block.id || idx}
                  className="bg-muted/20 border border-border border-l-3 border-l-primary p-4 rounded-2xl space-y-3"
                >
                  <span className="text-[8px] font-extrabold text-muted-foreground tracking-widest uppercase block">
                    {T.formulaLabel}
                  </span>
                  <FormulaBuilder elements={block.elements || []} note={block.note || ''} isEditable={false} />
                </div>
              );

            case 'example':
              return (
                <div
                  key={block.id || idx}
                  className="bg-muted/20 border border-border p-4 rounded-2xl space-y-3"
                >
                  <span className="text-[8px] font-extrabold text-muted-foreground tracking-widest uppercase block">
                    {T.exampleLabel}
                  </span>
                  <ExampleBlock items={block.items || []} isEditable={false} />
                </div>
              );

            case 'callout':
              return (
                <div
                  key={block.id || idx}
                  className="bg-primary/5 border border-primary/20 rounded-2xl p-4 border-l-3 border-l-primary/70 space-y-1"
                >
                  <span className="text-[10px] font-black text-primary tracking-wider uppercase block">
                    {block.title || T.calloutDefault}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {block.content || ''}
                  </p>
                </div>
              );

            case 'quiz': {
              return (
                <div key={block.id || idx} className="relative">
                  <div className="absolute top-2 right-2 flex gap-1 items-center z-10">
                    <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 select-none">
                      {T.testPreviewBadge}
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
