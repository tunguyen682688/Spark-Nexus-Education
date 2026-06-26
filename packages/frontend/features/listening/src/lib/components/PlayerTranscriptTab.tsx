import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { ListeningSubtitle } from '../types';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import WordLookupPopover from './WordLookupPopover';

interface PlayerTranscriptTabProps {
  subtitles?: ListeningSubtitle[];
  activeSubId: string | null;
  showTranslation: boolean;
  onSubtitleClick: (startTime: number) => void;
  onRegisterRef: (id: string, el: HTMLDivElement | null) => void;
  formatTime: (secs: number) => string;
}

export const PlayerTranscriptTab: React.FC<PlayerTranscriptTabProps> = ({
  subtitles,
  activeSubId,
  showTranslation,
  onSubtitleClick,
  onRegisterRef,
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
    <div className="space-y-4 max-w-3xl mx-auto relative">
      {subtitles && subtitles.length > 0 ? (
        subtitles.map((sub) => {
          const isActive = activeSubId === sub.id;
          return (
            <div
              key={sub.id}
              ref={(el) => onRegisterRef(sub.id, el)}
              onClick={() => onSubtitleClick(sub.startTime)}
              className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                  : 'bg-muted/20 border-border hover:bg-muted hover:border-border/80'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Seek timing indicator */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                }`}>
                  {formatTime(sub.startTime)}
                </span>

                {/* Transcripts Text */}
                <div className="flex-1 space-y-1.5">
                  <p className={`text-base font-semibold transition-colors duration-300 leading-relaxed ${
                    isActive ? 'text-foreground' : 'text-foreground/90'
                  }`}>
                    {renderInteractiveText(sub.text)}
                  </p>
                  {showTranslation && sub.translation && (
                    <p className={`text-sm transition-colors duration-300 leading-relaxed ${
                      isActive ? 'text-primary/90' : 'text-muted-foreground'
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
        <div className="text-center py-20 text-muted-foreground">
          <Info className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
          {LISTENING_WORKSPACE_TEXT.PLAYER.NO_SUBTITLES}
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

export default PlayerTranscriptTab;
