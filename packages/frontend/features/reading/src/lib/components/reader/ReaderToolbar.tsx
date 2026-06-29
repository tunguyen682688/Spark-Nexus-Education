import React from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@spark-nest-ed/frontend-shared-components';
import {
  ArrowLeft,
  Brain,
  Check,
  Eye,
  Pause,
  Play,
  Square,
  Type,
  Volume2,
  Zap,
  Languages,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { READING_UI_TEXT } from '../../constants/reading-ui-text';

interface ReaderToolbarProps {
  scrollProgress: number;
  isBionicMode: boolean;
  onToggleBionicMode: () => void;
  fixation: number;
  onChangeFixation: (val: number) => void;
  saccade: number;
  onChangeSaccade: (val: number) => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  focusHeightLines: 1 | 3;
  onChangeFocusHeightLines: (lines: 1 | 3) => void;
  fontSize: 'sm' | 'md' | 'lg';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg') => void;
  isPlayingTts: boolean;
  onTogglePlayTts: () => void;
  onStopTts: () => void;
  ttsRate: number;
  onChangeTtsRate: (rate: number) => void;
  isQuickSaveEnabled: boolean;
  onToggleQuickSave: () => void;
  isBilingualView: boolean;
  onToggleBilingualView: () => void;
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
  focusHeightLines,
  onChangeFocusHeightLines,
  fontSize,
  onChangeFontSize,
  isPlayingTts,
  onTogglePlayTts,
  onStopTts,
  ttsRate,
  onChangeTtsRate,
  isQuickSaveEnabled,
  onToggleQuickSave,
  isBilingualView,
  onToggleBilingualView,
}) => {
  return (
    <div className="sticky top-0 z-40 w-full select-none border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div
        className="h-1 bg-blue-600 transition-all duration-150 dark:bg-blue-400"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="mx-auto flex min-h-16 max-w-full w-full items-center justify-between gap-3 px-4 py-2 md:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 flex-shrink-0 gap-1.5 rounded-lg pl-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          asChild
        >
          <Link to="/reading">
            <ArrowLeft className="h-4 w-4" />
            {READING_UI_TEXT.components.reader.TOOLBAR_BACK}
          </Link>
        </Button>

        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-1">
          <div className="mr-1 flex flex-shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 gap-1.5 rounded-lg px-2.5 text-xs font-bold',
                isPlayingTts
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-300'
              )}
              onClick={onTogglePlayTts}
            >
              {isPlayingTts ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              TTS
            </Button>

            {isPlayingTts && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
                onClick={onStopTts}
              >
                <Square className="h-3 w-3 fill-current" />
              </Button>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-36 space-y-0.5 border-slate-200 p-2 shadow-md dark:border-slate-800 dark:bg-slate-950">
                <label className="block px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {READING_UI_TEXT.components.reader.TOOLBAR_SPEED_RATE}
                </label>
                {[
                  { label: '0.8x Chậm', value: 0.8 },
                  { label: '1.0x Thường', value: 1.0 },
                  { label: '1.2x Nhanh', value: 1.2 },
                  { label: '1.5x Rất nhanh', value: 1.5 },
                ].map((rate) => (
                  <Button
                    key={rate.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                    onClick={() => onChangeTtsRate(rate.value)}
                  >
                    {rate.label}
                    {ttsRate === rate.value && (
                      <Check className="h-3 w-3 text-blue-500" />
                    )}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isBionicMode ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-9 flex-shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-bold',
                  isBionicMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                )}
              >
                <Brain className="h-4 w-4" />
                Bionic
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 space-y-3 border-slate-200 p-3 shadow-md dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {READING_UI_TEXT.components.reader.TOOLBAR_BIONIC_SETTINGS}
                </span>
                <Button
                  size="sm"
                  variant={isBionicMode ? 'destructive' : 'default'}
                  className="h-6 px-2 text-[10px] font-extrabold uppercase"
                  onClick={onToggleBionicMode}
                >
                  {isBionicMode ? READING_UI_TEXT.components.reader.TOOLBAR_DISABLE : READING_UI_TEXT.components.reader.TOOLBAR_ENABLE}
                </Button>
              </div>

              <ReaderSlider
                label={READING_UI_TEXT.components.reader.TOOLBAR_BIONIC_FIXATION}
                value={fixation}
                min="0.3"
                max="0.7"
                step="0.05"
                disabled={!isBionicMode}
                onChange={onChangeFixation}
              />
              <ReaderSlider
                label={READING_UI_TEXT.components.reader.TOOLBAR_BIONIC_SACCADE}
                value={saccade}
                min="0.2"
                max="1"
                step="0.1"
                disabled={!isBionicMode}
                onChange={onChangeSaccade}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isFocusMode ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-9 flex-shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-bold',
                  isFocusMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                )}
              >
                <Eye className="h-4 w-4" />
                Focus
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 space-y-3 border-slate-200 p-3 shadow-md dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {READING_UI_TEXT.components.reader.TOOLBAR_FOCUS_GUIDE}
                </span>
                <Button
                  size="sm"
                  variant={isFocusMode ? 'destructive' : 'default'}
                  className="h-6 px-2 text-[10px] font-extrabold uppercase"
                  onClick={onToggleFocusMode}
                >
                  {isFocusMode ? READING_UI_TEXT.components.reader.TOOLBAR_DISABLE : READING_UI_TEXT.components.reader.TOOLBAR_ENABLE}
                </Button>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {READING_UI_TEXT.components.reader.TOOLBAR_FOCUS_HEIGHT}
                </span>
                <div className="flex gap-1.5">
                  {[1, 3].map((lineCount) => (
                    <Button
                      key={lineCount}
                      variant={
                        focusHeightLines === lineCount ? 'default' : 'outline'
                      }
                      size="sm"
                      className="h-7 flex-1 text-xs font-bold"
                      onClick={() =>
                        onChangeFocusHeightLines(lineCount as 1 | 3)
                      }
                      disabled={!isFocusMode}
                    >
                      {lineCount} {READING_UI_TEXT.components.reader.TOOLBAR_FOCUS_LINE}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant={isQuickSaveEnabled ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-9 flex-shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-bold',
              isQuickSaveEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
            )}
            onClick={onToggleQuickSave}
            title={isQuickSaveEnabled ? "Tắt Lưu nhanh 1-Click" : "Bật Lưu nhanh 1-Click (Alt + Click hoặc Double Click)"}
          >
            <Zap className="h-4 w-4" />
            Lưu nhanh
          </Button>

          <Button
            variant={isBilingualView ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-9 flex-shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-bold',
              isBilingualView
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
            )}
            onClick={onToggleBilingualView}
            title={isBilingualView ? "Ẩn dịch song ngữ toàn bài" : "Hiện dịch song ngữ toàn bài"}
          >
            <Languages className="h-4 w-4" />
            Song ngữ
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 flex-shrink-0 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 space-y-0.5 border-slate-200 p-2 shadow-md dark:border-slate-800 dark:bg-slate-950">
              <label className="block px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {READING_UI_TEXT.components.reader.TOOLBAR_FONT_SIZE}
              </label>
              {[
                { label: READING_UI_TEXT.components.reader.FONT_SIZE_SM, value: 'sm' },
                { label: READING_UI_TEXT.components.reader.FONT_SIZE_MD, value: 'md' },
                { label: READING_UI_TEXT.components.reader.FONT_SIZE_LG, value: 'lg' },
              ].map((size) => (
                <Button
                  key={size.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                  onClick={() =>
                    onChangeFontSize(size.value as 'sm' | 'md' | 'lg')
                  }
                >
                  {size.label}
                  {fontSize === size.value && (
                    <Check className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

interface ReaderSliderProps {
  label: string;
  value: number;
  min: string;
  max: string;
  step: string;
  disabled: boolean;
  onChange: (val: number) => void;
}

const ReaderSlider: React.FC<ReaderSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold text-slate-400">
      <span>{label}</span>
      <span className="font-extrabold text-blue-500">
        {Math.round(value * 100)}%
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(parseFloat(event.target.value))}
      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 disabled:opacity-50 dark:bg-slate-800"
    />
  </div>
);

export default ReaderToolbar;
