import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@spark-nest-ed/frontend-shared-components';
import { BookOpen, Plus, Check, Loader2, X } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface WordSelectionPopoverProps {
  word: string;
  sentenceContext: string;
  x: number;
  y: number;
  onClose: () => void;
}

export const WordSelectionPopover: React.FC<WordSelectionPopoverProps> = ({
  word,
  sentenceContext,
  x,
  y,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [definition, setDefinition] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [userSets, setUserSets] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Context translation states
  const [contextTranslation, setContextTranslation] = useState('');
  const [contextExplanation, setContextExplanation] = useState('');

  useEffect(() => {
    const fetchWordDetailsAndSets = async () => {
      try {
        setLoading(true);
        const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
        const axios = getAxiosClient();

        let resolvedDefinition = '';

        // 1. Fetch word definition from dictionary
        try {
          const dictResponse = await axios.get(`/vocabulary/entries/${word.toLowerCase().trim()}`);
          if (dictResponse.data && dictResponse.data.data) {
            const attributes = dictResponse.data.data.attributes;
            resolvedDefinition = attributes.definition || attributes.notes || '';
            setDefinition(resolvedDefinition);
            setPronunciation(attributes.pronunciation || '');
            setPartOfSpeech(attributes.partOfSpeech || 'noun');
          }
        } catch {
          setDefinition('');
          setPronunciation('');
        }

        // 2. Fetch Contextual Translation
        if (sentenceContext) {
          try {
            const contextResponse = await axios.post('/reading/translate-context', {
              word,
              sentence: sentenceContext,
            });
            if (contextResponse.data && contextResponse.data.data) {
              const attrs = contextResponse.data.data.attributes;
              setContextTranslation(attrs.translation);
              setContextExplanation(attrs.explanation);
              // Auto-fill definition input if dictionary lookup returned empty
              if (!resolvedDefinition) {
                setDefinition(`${attrs.translation}`);
              }
            }
          } catch (err) {
            console.error('Failed to get contextual translation', err);
          }
        }

        // 3. Fetch user's vocabulary sets to populate selector
        const setsResponse = await axios.get('/vocabulary/packages/my/created');
        if (setsResponse.data && setsResponse.data.data) {
          const sets = setsResponse.data.data.map((item: { id: string; attributes: { title: string } }) => ({
            id: item.id,
            title: item.attributes.title,
          }));
          setUserSets(sets);
          if (sets.length > 0) {
            setSelectedSetId(sets[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching popover details', err);
      } finally {
        setLoading(false);
      }
    };

    if (word) {
      fetchWordDetailsAndSets();
    }
  }, [word, sentenceContext]);

  const handleSaveWord = async () => {
    if (!selectedSetId) return;

    try {
      setSaving(true);
      const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
      const axios = getAxiosClient();

      const payload = {
        word: {
          word: word.trim(),
          definition: definition.trim() || `Definition for ${word}`,
          example: sentenceContext.trim() || null,
          partOfSpeech: partOfSpeech || null,
          notes: 'Added from Interactive Reader',
        },
      };

      await axios.post(`/vocabulary/packages/${selectedSetId}/words`, payload);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save word', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card 
      className="absolute bg-white border border-slate-100 shadow-xl p-3 z-50 w-72 space-y-3 transition-all duration-200"
      style={{ left: `${x}px`, top: `${y - 10}px`, transform: 'translateY(-100%)' }}
    >
      <div className="flex justify-between items-center pb-1 border-b border-slate-50">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Lookup Word
        </h4>
        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full text-slate-400 hover:text-slate-600" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Translating word...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-extrabold text-slate-800 text-base">{word}</span>
              {pronunciation && (
                <span className="text-[10px] text-slate-400 font-medium font-sans">
                  /{pronunciation}/
                </span>
              )}
            </div>
          </div>

          {/* Contextual Translation Highlight Box */}
          {contextTranslation && (
            <div className="bg-amber-50/50 border border-amber-100/70 rounded-lg p-2 text-xs space-y-0.5 select-text">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Contextual Meaning</span>
              <p className="font-bold text-slate-800">{contextTranslation}</p>
              {contextExplanation && (
                <p className="text-[10px] text-slate-500 font-sans leading-normal">{contextExplanation}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Save Definition
              </label>
              <Input
                value={definition}
                onChange={(e) => setDefinition((e.target as HTMLInputElement).value)}
                placeholder="No definition found. Enter custom definition..."
                className="h-8 border-slate-200 focus-visible:ring-blue-500 text-xs w-full bg-slate-50/50"
              />
            </div>

            {userSets.length > 0 && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Save to Vocabulary Set
                </label>
                <div className="flex gap-1.5">
                  <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                    <SelectTrigger className="h-8 border-slate-200 text-xs flex-1">
                      <SelectValue placeholder="Select Set" />
                    </SelectTrigger>
                    <SelectContent>
                      {userSets.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className={cn(
                      "h-8 w-16 text-xs font-bold",
                      saved 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                    onClick={handleSaveWord}
                    disabled={saving || saved || !definition.trim()}
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : saved ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
export default WordSelectionPopover;
