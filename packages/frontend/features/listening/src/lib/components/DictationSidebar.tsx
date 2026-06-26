import React from 'react';
import { BookOpen } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';

interface DictationSidebarProps {
  subtitles: ListeningSubtitle[];

  selectedSubIndex: number;
  setSelectedSubIndex: (idx: number) => void;
  submittedDictations: Record<string, boolean>;
  getDictationStats: (orig: string, typed: string) => { accuracy: number };
  typedTexts: Record<string, string>;
}

export const DictationSidebar: React.FC<DictationSidebarProps> = ({
  subtitles,
  selectedSubIndex,
  setSelectedSubIndex,
  submittedDictations,
  getDictationStats,
  typedTexts,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.DICTATION;
  const common = LISTENING_WORKSPACE_TEXT.COMMON;

  return (
    <div className="w-full lg:w-4/12 bg-card/40 border border-border rounded-2xl p-4 flex flex-col h-[280px] lg:h-full overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            {text.SIDEBAR_TITLE}
          </span>
        </div>
        <span className="text-[11px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
          {text.SIDEBAR_ROWS(subtitles.length)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {subtitles.map((sub, idx) => {
          const isCurrent = selectedSubIndex === idx;
          const isChecked = submittedDictations[sub.id];
          const subStats = isChecked
            ? getDictationStats(sub.text, typedTexts[sub.id] || '')
            : null;

          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubIndex(idx)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                isCurrent
                  ? 'bg-primary/10 border-primary/50 text-foreground shadow-sm'
                  : 'bg-muted/20 border-transparent hover:bg-muted/40 hover:border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {common.SENTENCE_NUMBER(idx + 1)}
                </span>
                {isChecked && subStats && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      subStats.accuracy >= 90
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}
                  >
                    {text.ACCURACY_LABEL(subStats.accuracy)}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold truncate mt-2 leading-relaxed">
                {sub.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DictationSidebar;
