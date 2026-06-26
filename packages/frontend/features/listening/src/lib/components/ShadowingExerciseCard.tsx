import React from 'react';
import { Volume2, AlertCircle, CheckCircle2, Mic, Square, Play, ArrowLeft } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningSubtitle } from '../types';

interface ShadowingExerciseCardProps {
  currentSub: ListeningSubtitle;
  selectedSubIndex: number;
  subtitles: ListeningSubtitle[];
  isRecording: boolean;
  recordedAudioUrl: string | null;
  micError: string | null;
  playSentence: (start: number, end: number) => void;
  startRecording: () => void;
  stopRecording: () => void;
  handlePlayUserAudio: () => void;
  setSelectedSubIndex: (idx: number) => void;
  formatTime: (time: number) => string;
}


export const ShadowingExerciseCard: React.FC<ShadowingExerciseCardProps> = ({
  currentSub,
  selectedSubIndex,
  subtitles,
  isRecording,
  recordedAudioUrl,
  micError,
  playSentence,
  startRecording,
  stopRecording,
  handlePlayUserAudio,
  setSelectedSubIndex,
  formatTime,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.SHADOWING;

  return (
    <div className="bg-card/40 border border-border rounded-2xl p-6 flex flex-col justify-between flex-1 shadow-xl backdrop-blur-md min-h-fit gap-6">
      {/* Target subtitle sentence display */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-border/80 flex items-center justify-between">
          <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
            {text.EXERCISE_TITLE}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground font-mono">
            {text.TIMESTAMP_LABEL(formatTime(currentSub.startTime), formatTime(currentSub.endTime))}
          </span>
        </div>

        <div className="p-6 bg-muted/50 border border-border rounded-2xl space-y-3">
          <p className="text-lg sm:text-xl font-bold leading-relaxed text-foreground">
            {currentSub.text}
          </p>
          {currentSub.translation && (
            <p className="text-sm text-muted-foreground leading-relaxed font-semibold border-t border-border/50 pt-2">
              {currentSub.translation}
            </p>
          )}
        </div>
      </div>

      {/* Interaction Center */}
      <div className="flex flex-col items-center justify-center p-8 bg-muted/10 border border-border rounded-2xl gap-6">
        {micError && (
          <div className="w-full flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* Status Indicator */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {text.STATUS_TITLE}
          </p>
          {isRecording ? (
            <div className="flex items-center justify-center gap-2 text-red-400 animate-pulse">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-sm font-extrabold uppercase">
                {text.STATUS_RECORDING}
              </span>
            </div>
          ) : recordedAudioUrl ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-extrabold uppercase">
                {text.STATUS_DONE}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-semibold">
              {text.STATUS_READY}
            </p>
          )}
        </div>

        {/* Wave animation simulation if recording */}
        {isRecording && (
          <div className="flex items-end gap-1.5 h-10">
            <span
              className="w-1.5 bg-primary rounded-full animate-bounce h-8"
              style={{ animationDelay: '0.1s' }}
            />
            <span
              className="w-1.5 bg-primary rounded-full animate-bounce h-5"
              style={{ animationDelay: '0.3s' }}
            />
            <span
              className="w-1.5 bg-primary rounded-full animate-bounce h-9"
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className="w-1.5 bg-primary rounded-full animate-bounce h-6"
              style={{ animationDelay: '0.5s' }}
            />
            <span
              className="w-1.5 bg-primary rounded-full animate-bounce h-8"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        )}

        {/* Voice Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => playSentence(currentSub.startTime, currentSub.endTime)}
            disabled={isRecording}
            className="flex items-center gap-2 px-5 py-3 text-xs font-extrabold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-primary/15"
          >
            <Volume2 className="w-4 h-4" />
            {text.PLAY_SAMPLE_BUTTON}
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-3 text-xs font-extrabold text-foreground bg-background border border-border hover:bg-muted rounded-xl transition-all"
            >
              <Mic className="w-4 h-4 text-red-500" />
              {text.RECORD_BUTTON}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-3 text-xs font-extrabold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all animate-pulse"
            >
              <Square className="w-4 h-4" />
              {text.STOP_BUTTON}
            </button>
          )}

          {recordedAudioUrl && !isRecording && (
            <button
              onClick={handlePlayUserAudio}
              className="flex items-center gap-2 px-5 py-3 text-xs font-extrabold text-muted-foreground bg-background border border-border hover:bg-muted rounded-xl transition-all"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              {text.PLAY_USER_BUTTON}
            </button>
          )}
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/80 mt-auto">
        <button
          onClick={() => {
            const prev = Math.max(0, selectedSubIndex - 1);
            setSelectedSubIndex(prev);
          }}
          disabled={selectedSubIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted hover:text-foreground rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {text.PREV_BUTTON}
        </button>
        <span className="text-xs text-muted-foreground font-extrabold">
          Câu {selectedSubIndex + 1} / {subtitles.length}
        </span>
        <button
          onClick={() => {
            const next = Math.min(subtitles.length - 1, selectedSubIndex + 1);
            setSelectedSubIndex(next);
          }}
          disabled={selectedSubIndex === subtitles.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted hover:text-foreground rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {text.NEXT_BUTTON}
          <Play className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ShadowingExerciseCard;
