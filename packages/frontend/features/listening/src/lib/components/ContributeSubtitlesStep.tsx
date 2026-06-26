import React from 'react';
import {
  Music,
  Pause,
  Play,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { LISTENING_CONTRIBUTE_TEXT } from '../constants';
import { SubtitleLine } from '../hooks';

interface ContributeSubtitlesStepProps {
  title: string;
  duration: number;
  audioTime: number;
  audioDuration: number;
  audioPlaying: boolean;
  activeSyncIndex: number;
  subtitles: SubtitleLine[];
  bulkText: string;
  setBulkText: (val: string) => void;
  isBulkInputOpen: boolean;
  setIsBulkInputOpen: (val: boolean) => void;
  togglePlayback: () => void;
  seekTo: (time: number) => void;
  formatDuration: (sec: number) => string;
  handleSyncCurrentTime: () => void;
  handleResetSyncIndex: (idx: number) => void;
  handleBulkParse: () => void;
  handleAddSubtitleRow: () => void;
  handleRemoveSubtitleRow: (id: string) => void;
  handleUpdateSubtitleField: <K extends keyof SubtitleLine>(id: string, field: K, val: SubtitleLine[K]) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const ContributeSubtitlesStep: React.FC<ContributeSubtitlesStepProps> = ({
  title,
  duration,
  audioTime,
  audioDuration,
  audioPlaying,
  activeSyncIndex,
  subtitles,
  bulkText,
  setBulkText,
  isBulkInputOpen,
  setIsBulkInputOpen,
  togglePlayback,
  seekTo,
  formatDuration,
  handleSyncCurrentTime,
  handleResetSyncIndex,
  handleBulkParse,
  handleAddSubtitleRow,
  handleRemoveSubtitleRow,
  handleUpdateSubtitleField,
  onPrevStep,
  onNextStep,
}) => {
  const text = LISTENING_CONTRIBUTE_TEXT.STEP_2_STUDIO;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column Studio Audio player bar */}
      <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-5 space-y-4 self-start backdrop-blur-md">
        <h3 className="text-xs font-black uppercase text-primary flex items-center gap-2">
          <Music className="w-4.5 h-4.5" />
          {text.STUDIO_TITLE}
        </h3>

        {/* Mini Audio Player display */}
        <div className="bg-background border border-border p-4 rounded-2xl flex flex-col gap-4 text-center items-center justify-center">
          <span className="text-xs font-bold truncate max-w-xs text-muted-foreground">{title || text.DEFAULT_TITLE}</span>
          
          <div className="flex items-center gap-1.5 text-foreground font-mono text-lg font-bold">
            <span>{formatDuration(audioTime)}</span>
            <span className="text-muted-foreground/60">/</span>
            <span>{formatDuration(audioDuration || duration)}</span>
          </div>

          <input
            type="range"
            min="0"
            max={audioDuration || duration}
            step="0.1"
            value={audioTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full accent-primary bg-muted h-1 rounded-full cursor-pointer"
          />

          <button
            onClick={togglePlayback}
            className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors active:scale-95 shadow-md"
          >
            {audioPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Sync controls helpers */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-2 text-[11px] leading-relaxed">
            <span className="font-extrabold text-primary block uppercase">{text.SYNC_BOX_TITLE}</span>
            <p className="text-muted-foreground">
              {text.SYNC_BOX_DESC}
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>{text.SYNC_BOX_TIP_1}</li>
              <li>{text.SYNC_BOX_TIP_2}</li>
            </ul>
            <button
              onClick={handleSyncCurrentTime}
              disabled={activeSyncIndex >= subtitles.length}
              className="w-full mt-3 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-extrabold text-xs shadow"
            >
              {text.SYNC_BOX_CTA(activeSyncIndex + 1)}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Subtitles Grid Editor */}
      <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-black uppercase text-primary flex items-center gap-2">
              <FileText className="w-4.5 h-4.5" />
              {text.EDITOR_TITLE}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{text.EDITOR_DESC}</p>
          </div>
          
          {/* Bulk tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkInputOpen(!isBulkInputOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground hover:text-foreground/90 text-xs font-bold transition-all"
            >
              {isBulkInputOpen ? text.BULK_CLOSE_CTA : text.BULK_OPEN_CTA}
            </button>
            <button
              onClick={handleAddSubtitleRow}
              className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> {text.ADD_ROW_CTA}
            </button>
          </div>
        </div>

        {/* Bulk paste box */}
        {isBulkInputOpen && (
          <div className="bg-background border border-border p-4 rounded-2xl space-y-3">
            <label className="text-[11px] text-muted-foreground block font-bold uppercase">{text.BULK_LABEL}</label>
            <textarea
              placeholder={text.BULK_PLACEHOLDER}
              rows={4}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full text-xs font-medium bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary resize-y"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsBulkInputOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground font-bold"
              >
                {text.BULK_CANCEL}
              </button>
              <button
                onClick={handleBulkParse}
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {text.BULK_APPLY}
              </button>
            </div>
          </div>
        )}

        {/* Subtitles Input Rows List */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {subtitles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-bold text-xs bg-background/20 border border-dashed border-border rounded-2xl">
              {text.EMPTY_LIST}
            </div>
          ) : (
            subtitles.map((sub, idx) => (
              <div
                key={sub.id}
                className={`p-4 bg-background/40 border rounded-2xl space-y-3 transition-all ${
                  activeSyncIndex === idx
                    ? 'border-primary shadow-md shadow-primary/5 bg-card/30'
                    : 'border-border hover:border-border'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-extrabold uppercase">
                  
                  <button
                    type="button"
                    onClick={() => handleResetSyncIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                      activeSyncIndex === idx
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{text.ROW_LABEL(sub.order)}</span>
                    {activeSyncIndex === idx && <Sparkles className="w-3 h-3 text-white fill-current" />}
                  </button>

                  <div className="flex items-center gap-2">
                    
                    <div className="flex items-center gap-1 border border-border bg-background rounded-lg px-2 py-0.5">
                      <span className="text-muted-foreground lowercase">{text.START_LABEL}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sub.startTime}
                        onChange={(e) => handleUpdateSubtitleField(sub.id, 'startTime', Number(e.target.value))}
                        className="w-12 bg-transparent text-foreground focus:outline-none font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateSubtitleField(sub.id, 'startTime', Math.round(audioTime * 100) / 100)}
                        className="text-primary hover:text-primary/80 ml-1 font-bold lowercase text-[9px] border border-primary/25 px-1 rounded bg-primary/5"
                      >
                        {text.GHIM_CTA}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 border border-border bg-background rounded-lg px-2 py-0.5">
                      <span className="text-muted-foreground lowercase">{text.END_LABEL}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sub.endTime}
                        onChange={(e) => handleUpdateSubtitleField(sub.id, 'endTime', Number(e.target.value))}
                        className="w-12 bg-transparent text-foreground focus:outline-none font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateSubtitleField(sub.id, 'endTime', Math.round(audioTime * 100) / 100)}
                        className="text-primary hover:text-primary/80 ml-1 font-bold lowercase text-[9px] border border-primary/25 px-1 rounded bg-primary/5"
                      >
                        {text.GHIM_CTA}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        seekTo(sub.startTime);
                        // trigger toggle play if not already playing
                        if (!audioPlaying) {
                          togglePlayback();
                        }
                      }}
                      className="p-1 rounded bg-muted border border-border text-muted-foreground hover:text-foreground"
                      title={text.PLAY_ROW_TITLE}
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubtitleRow(sub.id)}
                      className="p-1 rounded border border-border bg-background text-muted-foreground hover:text-red-400 hover:border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder={text.TEXT_PLACEHOLDER}
                    value={sub.text}
                    onChange={(e) => handleUpdateSubtitleField(sub.id, 'text', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder={text.TRANSLATION_PLACEHOLDER}
                    value={sub.translation}
                    onChange={(e) => handleUpdateSubtitleField(sub.id, 'translation', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-muted-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Step Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground font-bold"
          >
            {text.BACK_CTA}
          </button>
          <button
            onClick={onNextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold active:scale-98 transition-all"
          >
            {text.CONTINUE_CTA}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default ContributeSubtitlesStep;
