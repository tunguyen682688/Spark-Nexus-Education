import { FC } from 'react';
import { UserCheck } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { toast } from 'sonner';
import FormulaBuilder from '../components/FormulaBuilder';
import MediaBlock from '../components/MediaBlock';
import QuizBlock from '../components/QuizBlock';
import type { GrammarBlock } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';

interface LessonLectureTabProps {
  blocks: GrammarBlock[];
  isCompleting: boolean;
  onComplete: () => Promise<void>;
}

const handleSpeakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } else {
    toast.error(GRAMMAR_UI_TEXT.lessonDetail.toastSpeechUnsupported);
  }
};

export const LessonLectureTab: FC<LessonLectureTabProps> = ({
  blocks,
  isCompleting,
  onComplete,
}) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    {blocks?.map((block: GrammarBlock, idx: number) => {
      switch (block.type) {
        case 'media':
          return (
            <div id={block.id} key={block.id || idx} className="space-y-3">
              <MediaBlock url={block.url || ''} provider={block.provider || 'youtube'} />
            </div>
          );
        case 'text': {
          const isTitle = (block.content || '').startsWith('### ');
          if (isTitle) {
            return (
              <h2 id={block.id} key={block.id || idx}
                className="text-lg font-extrabold text-foreground border-l-4 border-blue-500 pl-3 mt-6 mb-2 tracking-wide">
                {(block.content || '').replace('### ', '')}
              </h2>
            );
          }
          return (
            <div id={block.id} key={block.id || idx}
              className="bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-xl space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{block.content || ''}</p>
            </div>
          );
        }
        case 'formula':
          return (
            <div id={block.id} key={block.id || idx}
              className="bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-xl border-l-4 border-l-blue-500 space-y-4">
              <div className="text-[10px] font-extrabold text-muted-foreground/75 tracking-widest uppercase">Structure Formula</div>
              <FormulaBuilder elements={block.elements || []} note={block.note || ''} isEditable={false} />
            </div>
          );
        case 'example':
          return (
            <div id={block.id} key={block.id || idx}
              className="bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-xl space-y-4">
              <div className="text-[10px] font-extrabold text-muted-foreground/75 tracking-widest uppercase border-b border-border pb-3 flex justify-between items-center">
                <span>Examples in Context</span>
                <span className="text-[9px] text-muted-foreground/60">{GRAMMAR_UI_TEXT.lessonDetail.exampleFeedbackNote}</span>
              </div>
              <div className="space-y-4">
                {(block.items || []).map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-muted/40 border border-border/60 rounded-2xl p-4.5 flex items-start justify-between gap-4 group hover:border-border transition-all">
                    <div className="space-y-1.5 flex-1">
                      <p className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">{item.text}</p>
                      <p className="text-xs text-muted-foreground/80 italic leading-relaxed">{item.explanation}</p>
                    </div>
                    <button onClick={() => handleSpeakText(item.text)}
                      className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border transition flex-shrink-0 cursor-pointer active:scale-95"
                      title={GRAMMAR_UI_TEXT.lessonDetail.exampleSpeechTitle}>
                      <span className="h-4 w-4 block">🔊</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'callout':
          return (
            <div id={block.id} key={block.id || idx}
              className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 shadow-xl space-y-2 border-l-4 border-l-blue-500/70">
              <span className="text-xs font-black text-blue-400 tracking-wider uppercase block">
                {block.title || GRAMMAR_UI_TEXT.lessonDetail.calloutDefaultTitle}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{block.content || ''}</p>
            </div>
          );
        case 'quiz':
          return (
            <div id={block.id} key={block.id || idx}>
              <QuizBlock question={block.question || ''} options={block.options || []} answer={block.answer || ''} isEditable={false} />
            </div>
          );
        default:
          return null;
      }
    })}

    <div className="flex justify-end pt-4 border-t border-border">
      <Button onClick={onComplete} disabled={isCompleting}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-wider">
        {isCompleting ? (
          <span className="h-4 w-4 rounded-full border-2 border-border border-t-transparent animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
        {GRAMMAR_UI_TEXT.lessonDetail.btnComplete}
      </Button>
    </div>
  </div>
);
