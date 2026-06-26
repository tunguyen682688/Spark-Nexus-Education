import React from 'react';
import { Volume2, X, Plus, Check, Loader2, Bookmark } from 'lucide-react';
import { useWordLookup } from '../hooks/useWordLookup';
import { WORD_LOOKUP_TEXT } from '../constants';
import { Badge, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@spark-nest-ed/frontend-shared-components';

interface WordLookupPopoverProps {
  word: string;
  x: number;
  y: number;
  onClose: () => void;
}

export const WordLookupPopover: React.FC<WordLookupPopoverProps> = ({
  word,
  x,
  y,
  onClose,
}) => {
  const {
    popoverRef,
    cleanWord,
    wordData,
    isLoading,
    error,
    userSets,
    selectedSetId,
    setSelectedSetId,
    isSaved,
    addWordMutation,
    handlePlayAudio,
    handleAddWord,
    posX,
    posY,
  } = useWordLookup({ word, x, y, onClose });

  return (
    <TooltipProvider>
      <div
        ref={popoverRef}
        style={{
          position: 'fixed',
          left: `${posX}px`,
          top: `${posY}px`,
          zIndex: 999,
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-80 bg-card border border-border backdrop-blur-md shadow-2xl rounded-2xl p-5 text-foreground flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-foreground tracking-tight capitalize">
                {cleanWord}
              </h3>
              {wordData?.partOfSpeech && (
                <Badge className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {wordData.partOfSpeech}
                </Badge>
              )}
            </div>
            {wordData?.pronunciation && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                /{wordData.pronunciation}/
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayAudio}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[10px] font-bold">{WORD_LOOKUP_TEXT.PLAY_AUDIO_TOOLTIP}</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex flex-col justify-center min-h-[90px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-wider animate-pulse">
                {WORD_LOOKUP_TEXT.LOADING}
              </p>
            </div>
          ) : error || !wordData ? (
            <div className="text-center py-4 space-y-1">
              <p className="text-sm font-semibold text-muted-foreground">
                {WORD_LOOKUP_TEXT.NOT_FOUND_TITLE}
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {WORD_LOOKUP_TEXT.NOT_FOUND_DESC}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Definition */}
              <div>
                <p className="text-xs text-muted-foreground font-extrabold uppercase tracking-wide">
                  {WORD_LOOKUP_TEXT.DEFINITION_LABEL}
                </p>
                <p className="text-sm text-foreground font-medium leading-relaxed mt-0.5">
                  {wordData.definition}
                </p>
              </div>

              {/* Example sentence */}
              {wordData.example && (
                <div className="border-t border-border pt-2.5 space-y-0.5">
                  <p className="text-xs text-muted-foreground font-extrabold uppercase tracking-wide">
                    {WORD_LOOKUP_TEXT.EXAMPLE_LABEL}
                  </p>
                  <p className="text-xs text-foreground italic font-semibold leading-relaxed">
                    "{wordData.example}"
                  </p>
                  {wordData.exampleTranslation && (
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
                      {wordData.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add word to set Section */}
        {wordData && (
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            {userSets.length > 0 ? (
              <div className="flex items-center gap-2">
                <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                  <SelectTrigger className="flex-1 text-xs bg-background border border-border rounded-xl px-3 py-2 text-foreground h-9 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userSets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.title} ({set.entryCount} từ)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddWord}
                      disabled={isSaved || addWordMutation.isPending}
                      className={`flex items-center justify-center p-2 h-9 w-9 rounded-xl border transition-all ${
                        isSaved
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20'
                          : 'bg-primary hover:bg-primary/90 border-primary text-primary-foreground hover:scale-102 active:scale-98 disabled:opacity-50'
                      }`}
                    >
                      {addWordMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSaved ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px] font-bold">{WORD_LOOKUP_TEXT.SAVE_TO_SET_TOOLTIP}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center py-1">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{WORD_LOOKUP_TEXT.CREATE_SET_WARNING}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default WordLookupPopover;
