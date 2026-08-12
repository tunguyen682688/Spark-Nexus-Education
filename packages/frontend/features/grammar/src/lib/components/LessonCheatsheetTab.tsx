import { FC } from 'react';
import { Compass, Download, Share2, Volume2 } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../constants';

interface LessonCheatsheetTabProps {
  onDownload: () => void;
  onShare: () => void;
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

export const LessonCheatsheetTab: FC<LessonCheatsheetTabProps> = ({
  onDownload,
  onShare,
}) => (
  <div className="bg-card border border-border text-card-foreground rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
          <Compass className="h-5 w-5 text-indigo-400" /> {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetTitle}
        </h3>
        <p className="text-xs text-muted-foreground/70">{GRAMMAR_UI_TEXT.lessonDetail.cheatsheetDesc}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onDownload} className="bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
          <Download className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetBtnDownload}
        </Button>
        <Button onClick={onShare} className="bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
          <Share2 className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetBtnShare}
        </Button>
      </div>
    </div>

    <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-5">
      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
        <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{GRAMMAR_UI_TEXT.lessonDetail.cheatsheetRuleTitle}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{GRAMMAR_UI_TEXT.lessonDetail.cheatsheetRuleDesc}</p>
      </div>
      <div className="border-l-4 border-purple-500 pl-4 space-y-2">
        <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{GRAMMAR_UI_TEXT.lessonDetail.cheatsheetTrapTitle}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{GRAMMAR_UI_TEXT.lessonDetail.cheatsheetTrapDesc}</p>
      </div>
      <div className="space-y-3 pt-2">
        <span className="text-[10px] font-black text-muted-foreground/75 tracking-wider uppercase block">{GRAMMAR_UI_TEXT.lessonDetail.cheatsheetAudioLabel}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { text: 'If I were you, I would learn grammar.', label: 'Conditional Clause' },
            { text: 'Hardly had we entered when it rained.', label: 'Inversion Structure' },
          ].map((item) => (
            <div key={item.text} className="bg-background p-4 border border-border rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">"{item.text}"</p>
                <span className="text-[9px] text-muted-foreground/60 block mt-0.5">{item.label}</span>
              </div>
              <button onClick={() => handleSpeakText(item.text)}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer active:scale-95">
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
