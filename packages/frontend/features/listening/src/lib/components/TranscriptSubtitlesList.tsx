import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';
import WordLookupPopover from './WordLookupPopover';

interface TranscriptSubtitlesListProps {
  subtitles: ListeningSubtitle[];
  activeSubId: string | null;
  subtitleRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  handleSubtitleClick: (time: number) => void;
  showTranslation: boolean;
  formatTime: (time: number) => string;
}

export const TranscriptSubtitlesList: React.FC<TranscriptSubtitlesListProps> = ({
  subtitles,
  activeSubId,
  subtitleRefs,
  handleSubtitleClick,
  showTranslation,
  formatTime,
}) => {
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    setLookupWord(word);
    setPopoverPos({ x: e.clientX, y: e.clientY });
  };

  const renderInteractiveText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      if (/^\s+$/.test(word)) {
        return <span key={idx}>{word}</span>;
      }
      return (
        <span
          key={idx}
          onClick={(e) => handleWordClick(e, word)}
          className="hover:text-purple-400 cursor-help transition-colors select-none font-semibold"
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {subtitles.length > 0 ? (
        subtitles.map((sub) => {
          const isActive = activeSubId === sub.id;
          return (
            <div
              key={sub.id}
              ref={(el) => {
                if (subtitleRefs.current) {
                  subtitleRefs.current[sub.id] = el;
                }
              }}
              onClick={() => handleSubtitleClick(sub.startTime)}
              className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
                  : 'bg-slate-900/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded shrink-0 ${
                  isActive 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-950 border border-slate-850 text-slate-500 group-hover:text-slate-400'
                }`}>
                  {formatTime(sub.startTime)}
                </span>

                <div className="flex-1 space-y-1">
                  <p className={`text-base font-semibold leading-relaxed transition-colors duration-300 ${
                    isActive ? 'text-slate-100' : 'text-slate-350 group-hover:text-slate-202'
                  }`}>
                    {renderInteractiveText(sub.text)}
                  </p>
                  {showTranslation && sub.translation && (
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                      isActive ? 'text-purple-300/90' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {sub.translation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-32 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-medium">{LISTENING_WORKSPACE_TEXT.COMMON.EMPTY_SUBTITLES}</p>
        </div>
      )}

      {lookupWord && popoverPos && (
        <WordLookupPopover
          word={lookupWord}
          x={popoverPos.x}
          y={popoverPos.y}
          onClose={() => setLookupWord(null)}
        />
      )}
    </div>
  );
};

export default TranscriptSubtitlesList;
