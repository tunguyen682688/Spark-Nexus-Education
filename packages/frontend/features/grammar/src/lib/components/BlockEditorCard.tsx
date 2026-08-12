import { FC } from 'react';
import { Trash2, ArrowUp, ArrowDown, Copy, FileText, Binary, FolderOpen, HelpCircle, Video, AlertCircle } from 'lucide-react';
import TextBlockEditor from '../components/TextBlockEditor';
import FormulaBlockEditor from '../components/FormulaBlockEditor';
import ExampleBlockEditor from '../components/ExampleBlockEditor';
import QuizBlockEditor from '../components/QuizBlockEditor';
import MediaBlockEditor from '../components/MediaBlockEditor';
import CalloutBlockEditor from '../components/CalloutBlockEditor';
import type { GrammarBlock } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';

interface BlockEditorCardProps {
  block: GrammarBlock;
  idx: number;
  totalBlocks: number;
  onUpdateBlock: (id: string, fields: Partial<GrammarBlock>) => void;
  onMoveBlock: (idx: number, direction: 'up' | 'down') => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
}

const BLOCK_ICONS: Record<string, FC<{ className?: string }>> = {
  text: FileText,
  formula: Binary,
  example: FolderOpen,
  quiz: HelpCircle,
  media: Video,
  callout: AlertCircle,
};

export const BlockEditorCard: FC<BlockEditorCardProps> = ({
  block,
  idx,
  totalBlocks,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}) => {
  const Icon = BLOCK_ICONS[block.type] || FileText;

  return (
    <div id={block.id} className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 shadow-xl relative group space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <span role="img" className="text-slate-450 text-xs">
            <Icon className="h-3.5 w-3.5 text-blue-500" />
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
            {GRAMMAR_UI_TEXT.lessonEditor.labelBlockOutline}
          </span>
          <input
            type="text"
            value={block.blockLabel || ''}
            onChange={(e) => onUpdateBlock(block.id, { blockLabel: e.target.value })}
            className="bg-[#0c1020] border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none w-full max-w-[220px] focus:border-blue-500 focus:bg-[#070a14] font-bold transition-all"
            placeholder={GRAMMAR_UI_TEXT.lessonEditor.placeholderBlockOutline}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => onMoveBlock(idx, 'up')} disabled={idx === 0}
              className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-[#0c1020] text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-none disabled:opacity-35 disabled:hover:bg-[#0c1020] transition-all"
              title={GRAMMAR_UI_TEXT.lessonEditor.btnMoveUpTitle}>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onMoveBlock(idx, 'down')} disabled={idx === totalBlocks - 1}
              className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-[#0c1020] text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-none disabled:opacity-35 disabled:hover:bg-[#0c1020] transition-all"
              title={GRAMMAR_UI_TEXT.lessonEditor.btnMoveDownTitle}>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <button type="button" onClick={() => onDuplicateBlock(block.id)}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 border-none transition-all opacity-70 group-hover:opacity-100"
            title={GRAMMAR_UI_TEXT.lessonEditor.btnDuplicateTitle}>
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDeleteBlock(block.id)}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 border-none transition-all opacity-70 group-hover:opacity-100"
            title={GRAMMAR_UI_TEXT.lessonEditor.btnDeleteTitle}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {block.type === 'text' && (
        <TextBlockEditor content={block.content || ''} onChange={(content) => onUpdateBlock(block.id, { content })} />
      )}
      {block.type === 'formula' && (
        <FormulaBlockEditor elements={block.elements || []} note={block.note || ''} onChange={(fields) => onUpdateBlock(block.id, fields)} />
      )}
      {block.type === 'example' && (
        <ExampleBlockEditor items={block.items || []} onChange={(items) => onUpdateBlock(block.id, { items })} />
      )}
      {block.type === 'quiz' && (
        <QuizBlockEditor question={block.question || ''} options={block.options || []} answer={block.answer || ''} onChange={(fields) => onUpdateBlock(block.id, fields)} />
      )}
      {block.type === 'media' && (
        <MediaBlockEditor url={block.url || ''} provider={block.provider || 'youtube'} onChange={(fields) => onUpdateBlock(block.id, fields)} />
      )}
      {block.type === 'callout' && (
        <CalloutBlockEditor title={block.title || ''} content={block.content || ''} onChange={(fields) => onUpdateBlock(block.id, fields)} />
      )}
    </div>
  );
};
