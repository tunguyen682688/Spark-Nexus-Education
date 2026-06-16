import React from 'react';
import { READING_UI_TEXT } from '../../constants';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@spark-nest-ed/frontend-shared-components';
import { ArrowLeft, Brain, Eye, Type, Check, Play, Pause, Square, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface ReaderToolbarProps {
  scrollProgress: number; // 0-100
  isBionicMode: boolean;
  onToggleBionicMode: () => void;
  fixation: number;
  onChangeFixation: (val: number) => void;
  saccade: number;
  onChangeSaccade: (val: number) => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  fontSize: 'sm' | 'md' | 'lg';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg') => void;
  
  // TTS
  isPlayingTts: boolean;
  onTogglePlayTts: () => void;
  onStopTts: () => void;
  ttsRate: number;
  onChangeTtsRate: (rate: number) => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  scrollProgress,
  isBionicMode,
  onToggleBionicMode,
  fixation,
  onChangeFixation,
  saccade,
  onChangeSaccade,
  isFocusMode,
  onToggleFocusMode,
  fontSize,
  onChangeFontSize,
  
  // TTS
  isPlayingTts,
  onTogglePlayTts,
  onStopTts,
  ttsRate,
  onChangeTtsRate,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm w-full select-none">
      {/* Scroll Progress Line */}
      <div 
        className="h-1 bg-blue-600 transition-all duration-150" 
        style={{ width: `${scrollProgress}%` }} 
      />

      <div className="max-w-[800px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="text-slate-600 font-bold gap-1 text-xs pl-2 rounded flex-shrink-0" asChild>
          <Link to="/reading">
            <ArrowLeft className="h-4 w-4" /> {READING_UI_TEXT.components.reader.TOOLBAR_BACK}
          </Link>
        </Button>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {/* TTS Player Controller */}
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5 mr-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2.5 gap-1.5 text-xs font-bold rounded-md",
                isPlayingTts ? 'text-blue-600' : 'text-slate-600'
              )}
              onClick={onTogglePlayTts}
            >
              {isPlayingTts ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              TTS
            </Button>
            
            {isPlayingTts && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-md"
                onClick={onStopTts}
              >
                <Square className="h-3 w-3 fill-current" />
              </Button>
            )}

            {/* TTS Rate Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:bg-slate-200/50 rounded-md">
                  <Volume2 className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-2 border-slate-100 shadow-md space-y-0.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1.5 block">{READING_UI_TEXT.components.reader.TOOLBAR_SPEED_RATE}</label>
                {[
                  { label: '0.8x Slow', value: 0.8 },
                  { label: '1.0x Normal', value: 1.0 },
                  { label: '1.2x Fast', value: 1.2 },
                  { label: '1.5x Rapid', value: 1.5 },
                ].map((rate) => (
                  <Button
                    key={rate.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between font-medium text-xs px-2.5 text-slate-700"
                    onClick={() => onChangeTtsRate(rate.value)}
                  >
                    {rate.label}
                    {ttsRate === rate.value && <Check className="h-3 w-3 text-blue-500" />}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Bionic Mode Popover (For tuning fixation/saccade) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isBionicMode ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "h-8 gap-1.5 text-xs font-bold rounded",
                  isBionicMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Brain className="h-4 w-4" /> {READING_UI_TEXT.components.reader.TOOLBAR_BIONIC}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 border-slate-100 shadow-md space-y-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-700">{READING_UI_TEXT.components.reader.TOOLBAR_BIONIC_SETTINGS}</span>
                <Button 
                  size="sm" 
                  variant={isBionicMode ? 'destructive' : 'default'} 
                  className="h-6 px-2 text-[10px] font-extrabold uppercase"
                  onClick={onToggleBionicMode}
                >
                  {isBionicMode ? 'Disable' : 'Enable'}
                </Button>
              </div>

              {/* Fixation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>{READING_UI_TEXT.components.reader.TOOLBAR_BIONIC_FIXATION}</span>
                  <span className="text-blue-500 font-extrabold">{Math.round(fixation * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.3" 
                  max="0.7" 
                  step="0.05"
                  value={fixation} 
                  disabled={!isBionicMode}
                  onChange={(e) => onChangeFixation(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                />
              </div>

              {/* Saccade Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>{READING_UI_TEXT.components.reader.TOOLBAR_BIONIC_SACCADE}</span>
                  <span className="text-blue-500 font-extrabold">{Math.round(saccade * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="1.0" 
                  step="0.1"
                  value={saccade} 
                  disabled={!isBionicMode}
                  onChange={(e) => onChangeSaccade(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Focus Mode Toggle */}
          <Button
            variant={isFocusMode ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-bold rounded flex-shrink-0",
              isFocusMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            )}
            onClick={onToggleFocusMode}
          >
            <Eye className="h-4 w-4" /> {READING_UI_TEXT.components.reader.TOOLBAR_FOCUS}
          </Button>

          {/* Font Size Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-50 rounded flex-shrink-0">
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 border-slate-100 shadow-md space-y-0.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1.5 block">{READING_UI_TEXT.components.reader.TOOLBAR_FONT_SIZE}</label>
              {[
                { label: 'Small', value: 'sm' },
                { label: 'Medium', value: 'md' },
                { label: 'Large', value: 'lg' },
              ].map((size) => (
                <Button
                  key={size.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between font-medium text-xs px-2.5 text-slate-700"
                  onClick={() => onChangeFontSize(size.value as 'sm' | 'md' | 'lg')}
                >
                  {size.label}
                  {fontSize === size.value && <Check className="h-3.5 w-3.5 text-blue-500" />}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
export default ReaderToolbar;
