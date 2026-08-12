import { FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import FormulaBuilder from '../components/FormulaBuilder';
import MediaBlock from '../components/MediaBlock';
import QuizBlock from '../components/QuizBlock';
import ExampleBlock from '../components/ExampleBlock';
import type { GrammarBlock } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';

interface LessonPreviewContentProps {
  blocks: GrammarBlock[];
  title: string;
  vietnameseTitle: string;
  level: string;
  isSplit?: boolean;
}

export const LessonPreviewContent: FC<LessonPreviewContentProps> = ({
  blocks,
  title,
  vietnameseTitle,
  level,
  isSplit = false,
}) => (
  <div className={`space-y-8 ${isSplit ? 'p-2' : 'max-w-4xl mx-auto py-6'}`}>
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-850 text-slate-500">
        <ArrowLeft className="h-4 w-4" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
            {level} LEVEL
          </span>
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
            {GRAMMAR_UI_TEXT.lessonEditor.timeReadLecture}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
          {title || GRAMMAR_UI_TEXT.lessonEditor.untitledLesson}
          {vietnameseTitle && (
            <span className="text-sm text-slate-400 font-normal">({vietnameseTitle})</span>
          )}
        </h1>
      </div>
    </div>

    <div className="flex flex-col gap-6">
      {blocks.map((block: GrammarBlock, idx: number) => {
        switch (block.type) {
          case 'media':
            return (
              <div id={'preview-' + block.id} key={block.id || idx}>
                <MediaBlock url={block.url || ''} provider={block.provider || 'youtube'} isEditable={false} />
              </div>
            );
          case 'text': {
            const isTitle = (block.content || '').startsWith('### ');
            if (isTitle) {
              return (
                <h2 id={'preview-' + block.id} key={block.id || idx}
                  className="text-xl font-extrabold text-white border-l-4 border-blue-500 pl-3 mt-6 mb-2 tracking-wide">
                  {(block.content || '').replace('### ', '')}
                </h2>
              );
            }
            return (
              <div id={'preview-' + block.id} key={block.id || idx}
                className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 shadow-xl">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{block.content || ''}</p>
              </div>
            );
          }
          case 'formula':
            return (
              <div id={'preview-' + block.id} key={block.id || idx}
                className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 shadow-xl border-l-4 border-l-blue-500 space-y-4">
                <div className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase">Structure Formula</div>
                <FormulaBuilder elements={block.elements || []} note={block.note || ''} isEditable={false} />
              </div>
            );
          case 'example':
            return (
              <div id={'preview-' + block.id} key={block.id || idx}
                className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase border-b border-slate-900 pb-3">Examples in Context</div>
                <ExampleBlock items={block.items || []} isEditable={false} />
              </div>
            );
          case 'quiz':
            return (
              <div id={'preview-' + block.id} key={block.id || idx}>
                <QuizBlock question={block.question || ''} options={block.options || []} answer={block.answer || ''} isEditable={false} />
              </div>
            );
          case 'callout':
            return (
              <div id={'preview-' + block.id} key={block.id || idx}
                className="bg-[#0f1530]/40 border border-blue-500/20 rounded-3xl p-6 shadow-xl space-y-2 border-l-4 border-l-blue-500/70">
                <span className="text-xs font-black text-blue-400 tracking-wider uppercase block">
                  {block.title || GRAMMAR_UI_TEXT.lessonEditor.calloutDefaultTitle}
                </span>
                <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">{block.content || ''}</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  </div>
);
