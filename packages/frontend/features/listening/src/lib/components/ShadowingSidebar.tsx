import React from 'react';
import { BookOpen } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';

interface ShadowingSidebarProps {
  subtitles: ListeningSubtitle[];

  selectedSubIndex: number;
  setSelectedSubIndex: (idx: number) => void;
}

export const ShadowingSidebar: React.FC<ShadowingSidebarProps> = ({
  subtitles,
  selectedSubIndex,
  setSelectedSubIndex,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.SHADOWING;
  const common = LISTENING_WORKSPACE_TEXT.COMMON;

  return (
    <div className="w-full lg:w-4/12 bg-card/40 border border-border rounded-2xl p-4 flex flex-col h-[260px] lg:h-full overflow-hidden backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 px-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          {text.SIDEBAR_TITLE}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {subtitles.map((sub, idx) => {
          const isCurrent = selectedSubIndex === idx;
          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubIndex(idx)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                isCurrent
                  ? 'bg-primary/10 border-primary/50 text-foreground'
                  : 'bg-muted/20 border-transparent hover:bg-muted/40 hover:border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {common.SENTENCE_NUMBER(idx + 1)}
              </span>
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

export default ShadowingSidebar;
