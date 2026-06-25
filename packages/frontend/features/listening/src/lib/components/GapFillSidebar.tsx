import React from 'react';
import { BookOpen } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';

interface GapFillSidebarProps {
  subtitles: ListeningSubtitle[];
  selectedSubIndex: number;
  setSelectedSubIndex: (idx: number) => void;
}


export const GapFillSidebar: React.FC<GapFillSidebarProps> = ({
  subtitles,
  selectedSubIndex,
  setSelectedSubIndex,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.GAPFILL;
  const common = LISTENING_WORKSPACE_TEXT.COMMON;

  return (
    <div className="w-full lg:w-4/12 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col h-[260px] lg:h-full overflow-hidden backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 px-2">
        <BookOpen className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-350">
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
                  ? 'bg-purple-600/10 border-purple-500/50 text-slate-100'
                  : 'bg-slate-955/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800 text-slate-400 hover:text-slate-202'
              }`}
            >
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isCurrent
                    ? 'bg-purple-505 text-white'
                    : 'bg-slate-800 text-slate-500'
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

export default GapFillSidebar;
