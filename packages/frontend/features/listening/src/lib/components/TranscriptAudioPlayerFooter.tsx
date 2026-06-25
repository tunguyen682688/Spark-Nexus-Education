import React from 'react';
import { Volume2, Pause, Play, Clock } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';

interface TranscriptAudioPlayerFooterProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  handlePlayPause: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (time: number) => string;
}

export const TranscriptAudioPlayerFooter: React.FC<TranscriptAudioPlayerFooterProps> = ({
  isPlaying,
  currentTime,
  duration,
  handlePlayPause,
  handleSeek,
  formatTime,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.TRANSCRIPT;

  return (
    <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 space-y-3 shrink-0">
      {/* Timeline Slider */}
      <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
        <span className="text-xs text-slate-505 font-mono w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-slate-955 rounded-full appearance-none cursor-pointer accent-purple-500 focus:outline-none"
        />
        <span className="text-xs text-slate-505 font-mono w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Play/Pause Button Area */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 text-xs text-slate-550 font-semibold">
          <Volume2 className="w-4 h-4 text-purple-400" />
          <span>{text.PLAYER_TIP}</span>
        </div>

        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-505 text-white rounded-full transition-all shadow-lg shadow-purple-600/30 transform hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="w-32 flex items-center justify-end text-xs text-slate-505 font-medium gap-1">
          <Clock className="w-3.5 h-3.5 text-purple-500" />
          <span>{text.SHADOWING_LINK}</span>
        </div>
      </div>
    </footer>
  );
};

export default TranscriptAudioPlayerFooter;
