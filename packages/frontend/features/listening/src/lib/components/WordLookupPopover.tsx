import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Volume2, X, Plus, Check, Loader2, Bookmark } from 'lucide-react';
import { useMyCreatedSets, useAddWordToSet } from '@spark-nest-ed/feature-vocabulary';
import { useToast } from '@spark-nest-ed/frontend-shared-components';

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
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Clean word string: lowercase and remove punctuation without useless escapes
  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim().toLowerCase();

  // Fetch word definition using standard query
  const { data: wordData, isLoading, error } = useQuery({
    queryKey: ['vocabulary', 'entry-lookup', cleanWord],
    queryFn: async () => {
      const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
      const axios = await getAxiosClient();
      const response = await axios.get(`/vocabulary/entries/${cleanWord}`);
      
      // JSON:API resource mapper
      const raw = response.data;
      if (raw && raw.data) {
        return {
          id: raw.data.id,
          word: raw.data.attributes?.word || cleanWord,
          definition: raw.data.attributes?.definition || 'Chưa có định nghĩa',
          pronunciation: raw.data.attributes?.pronunciation || '',
          partOfSpeech: raw.data.attributes?.partOfSpeech || 'noun',
          example: raw.data.attributes?.example || '',
          exampleTranslation: raw.data.attributes?.exampleTranslation || '',
        };
      }
      throw new Error('Word not found');
    },
    enabled: !!cleanWord,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch user vocabulary sets
  const { data: setsData } = useMyCreatedSets({ limit: 100 });
  const addWordMutation = useAddWordToSet();

  const userSets = useMemo(() => setsData?.data || [], [setsData?.data]);

  // Auto select the first set if available
  useEffect(() => {
    if (userSets.length > 0 && !selectedSetId) {
      setSelectedSetId(userSets[0].id);
    }
  }, [userSets, selectedSetId]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Text-To-Speech pronunciation audio
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddWord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSetId || !cleanWord || !wordData) return;

    try {
      await addWordMutation.mutateAsync({
        setId: selectedSetId,
        payload: {
          word: {
            word: wordData.word,
            definition: wordData.definition,
            example: wordData.example,
            partOfSpeech: wordData.partOfSpeech,
          },
        },
      });

      setIsSaved(true);
      const selectedSet = userSets.find((s) => s.id === selectedSetId);
      toast({
        title: 'Đã lưu từ vựng! 🎯',
        description: `Đã thêm từ "${wordData.word}" vào bộ "${selectedSet?.title || ''}"`,
      });
    } catch (err) {
      console.error('Failed to add word to set:', err);
      toast({
        title: 'Thao tác thất bại',
        description: 'Không thể thêm từ vào bộ từ vựng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  // Compute position (keep in bounds)
  const panelWidth = 320;
  const panelHeight = 240;
  const posX = Math.max(10, Math.min(window.innerWidth - panelWidth - 20, x - panelWidth / 2));
  const posY = Math.max(10, Math.min(window.innerHeight - panelHeight - 20, y + 10));

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        left: `${posX}px`,
        top: `${posY}px`,
        zIndex: 999,
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-80 bg-slate-900/95 border border-slate-800 backdrop-blur-md shadow-2xl rounded-2xl p-5 text-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-50 tracking-tight capitalize">
              {cleanWord}
            </h3>
            {wordData?.partOfSpeech && (
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {wordData.partOfSpeech}
              </span>
            )}
          </div>
          {wordData?.pronunciation && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              /{wordData.pronunciation}/
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlayAudio}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-all"
            title="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 flex flex-col justify-center min-h-[90px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-500">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-wider animate-pulse">
              Đang tra từ điển...
            </p>
          </div>
        ) : error || !wordData ? (
          <div className="text-center py-4 space-y-1">
            <p className="text-sm font-semibold text-slate-400">
              Không tìm thấy từ này
            </p>
            <p className="text-xs text-slate-505 leading-relaxed">
              Từ vựng hiện chưa có trong cơ sở dữ liệu từ điển. Bạn có muốn nghe phát âm?
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Definition */}
            <div>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">
                Định nghĩa
              </p>
              <p className="text-sm text-slate-205 font-medium leading-relaxed mt-0.5">
                {wordData.definition}
              </p>
            </div>

            {/* Example sentence */}
            {wordData.example && (
              <div className="border-t border-slate-850 pt-2.5 space-y-0.5">
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">
                  Ví dụ
                </p>
                <p className="text-xs text-slate-300 italic font-semibold leading-relaxed">
                  "{wordData.example}"
                </p>
                {wordData.exampleTranslation && (
                  <p className="text-[11px] text-slate-505 leading-relaxed font-medium">
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
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          {userSets.length > 0 ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
                className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500/50"
              >
                {userSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title} ({set.entryCount} từ)
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddWord}
                disabled={isSaved || addWordMutation.isPending}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-purple-650 hover:bg-purple-600 border-purple-500 text-white hover:scale-102 active:scale-98 disabled:opacity-50'
                }`}
                title="Lưu từ vào bộ"
              >
                {addWordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSaved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-505 flex items-center gap-1.5 justify-center py-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Hãy tạo một bộ từ vựng trước để lưu từ.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordLookupPopover;
