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
          className="hover:text-primary cursor-help transition-colors select-none font-semibold"
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
                  ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                  : 'bg-secondary/40 border-border hover:bg-secondary/70'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded shrink-0 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary border border-border text-muted-foreground/80 group-hover:text-muted-foreground'
                }`}>
                  {formatTime(sub.startTime)}
                </span>

                <div className="flex-1 space-y-1">
                  <p className={`text-base font-semibold leading-relaxed transition-colors duration-300 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {renderInteractiveText(sub.text)}
                  </p>
                  {showTranslation && sub.translation && (
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                      isActive ? 'text-primary/95 font-semibold' : 'text-muted-foreground/60 group-hover:text-muted-foreground/80'
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
