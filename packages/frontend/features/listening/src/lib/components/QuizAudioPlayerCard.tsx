import React from 'react';
import { Clock, Play, Pause, Gauge } from 'lucide-react';
import { ListeningMaterial } from '../types';
import { LISTENING_WORKSPACE_TEXT } from '../constants';

interface QuizAudioPlayerCardProps {
  material: ListeningMaterial;
  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: number;
  duration: number;
  handlePlayPause: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeSpeed: () => void;
  formatTime: (time: number) => string;
}

export const QuizAudioPlayerCard: React.FC<QuizAudioPlayerCardProps> = ({
  material,
  isPlaying,
  playbackSpeed,
  currentTime,
  duration,
  handlePlayPause,
  handleSeek,
  changeSpeed,
  formatTime,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.QUIZ;
  const common = LISTENING_WORKSPACE_TEXT.COMMON;

  return (
    <div className="w-full md:w-5/12 bg-card/40 border border-border rounded-2xl p-6 flex flex-col justify-between h-fit md:max-h-full overflow-hidden backdrop-blur-md shadow-lg shrink-0 gap-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            {text.PLAYER_TITLE}
          </span>
        </div>

        <div className="aspect-video w-full bg-background rounded-xl overflow-hidden relative flex flex-col justify-between p-4 border border-border shadow-inner">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span className="capitalize px-2 py-0.5 bg-muted rounded font-bold">
              {material.category}
            </span>
            <span className="text-muted-foreground font-medium">
              {common.SPEED_LABEL(playbackSpeed)}
            </span>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center transition-all shadow-lg shadow-primary/30 transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground text-center font-semibold">
            {text.PLAYER_TIP}
          </div>
        </div>

        {/* Seek bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/80">
        <button
          onClick={changeSpeed}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
        >
          <Gauge className="w-3.5 h-3.5 text-primary" />
          {common.SPEED_TEMPLATE(playbackSpeed)}
        </button>
        <span className="text-[11px] text-muted-foreground font-bold">
          Spark Nexus Education
        </span>
      </div>
    </div>
  );
};

export default QuizAudioPlayerCard;
