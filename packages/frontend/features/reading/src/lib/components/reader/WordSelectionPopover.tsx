import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@spark-nest-ed/frontend-shared-components';
import { BookOpen, Check, Loader2, Network, Plus, X, FolderPlus } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import {
  useAddWordToPackage,
  useContextTranslation,
  useParseSyntax,
  useUserVocabularyPackages,
  useVocabularyEntryDetail,
  useCreateVocabularyPackage,
} from '../../hooks/use-reading';
import { SyntaxTreeVisualizer } from './SyntaxTreeVisualizer';

const isCefrLevel = (level: string) => {
  return /^[a-c][1-2]$/i.test(level.trim());
};

const getCefrBadgeColor = (level: string) => {
  const clean = level.trim().toUpperCase();
  switch (clean) {
    case 'A1':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/50';
    case 'A2':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50';
    case 'B1':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50';
    case 'B2':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50';
    case 'C1':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50';
    case 'C2':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  }
};

interface WordSelectionPopoverProps {
  word: string;
  sentenceContext: string;
  x: number;
  y: number;
  onClose: () => void;
  initialDefinition?: string;
  initialPronunciation?: string;
  initialPartOfSpeech?: string;
  initialExample?: string;
  initialExampleTrans?: string;
}

export const WordSelectionPopover: React.FC<WordSelectionPopoverProps> = ({
  word,
  sentenceContext,
  x,
  y,
  onClose,
  initialDefinition,
  initialPronunciation,
  initialPartOfSpeech,
  initialExample,
  initialExampleTrans,
}) => {
  const panelWidth = 336;
  const viewportWidth =
    typeof window === 'undefined' ? panelWidth + 32 : window.innerWidth;
  const viewportHeight =
    typeof window === 'undefined' ? 720 : window.innerHeight;
  const fixedX = typeof window === 'undefined' ? x : x - window.scrollX;
  const fixedY = typeof window === 'undefined' ? y : y - window.scrollY;
  
  const left = Math.min(
    Math.max(16, fixedX - panelWidth / 2),
    Math.max(16, viewportWidth - panelWidth - 16)
  );
  const top = Math.min(
    Math.max(76, fixedY + 16),
    Math.max(76, viewportHeight - 450)
  );

  const [activeTab, setActiveTab] = useState<'definition' | 'syntax'>(
    'definition'
  );
  const [definition, setDefinition] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [userSets, setUserSets] = useState<Array<{ id: string; title: string }>>(
    []
  );
  const [selectedSetId, setSelectedSetId] = useState('');
  const [saved, setSaved] = useState(false);
  const [contextTranslation, setContextTranslation] = useState('');
  const [contextExplanation, setContextExplanation] = useState('');

  // Quick Set Creation States
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');

  const queryEnabled = !initialDefinition;
  const { data: dictData, isFetching: isFetchingDict } =
    useVocabularyEntryDetail(queryEnabled ? word : undefined);
  const { data: contextData, isFetching: isFetchingContext } =
    useContextTranslation(
      queryEnabled ? word : undefined,
      queryEnabled ? sentenceContext : undefined
    );
  const { data: packagesData, isFetching: isFetchingPackages } =
    useUserVocabularyPackages();
  const addWordMutation = useAddWordToPackage();
  const createPackageMutation = useCreateVocabularyPackage();
  const { data: syntaxTreeData, isFetching: isFetchingSyntax } = useParseSyntax(
    activeTab === 'syntax' ? sentenceContext : undefined
  );

  useEffect(() => {
    if (!initialDefinition) return;

    setDefinition(initialDefinition);
    setPronunciation(initialPronunciation || '');
    if (initialPartOfSpeech) {
      if (isCefrLevel(initialPartOfSpeech)) {
        setPartOfSpeech('noun');
      } else {
        setPartOfSpeech(initialPartOfSpeech);
      }
    } else {
      setPartOfSpeech('noun');
    }
  }, [initialDefinition, initialPronunciation, initialPartOfSpeech]);

  useEffect(() => {
    if (dictData && !initialDefinition) {
      setDefinition(dictData.senses?.[0]?.definition || dictData.notes || '');
      setPronunciation(dictData.pronunciation || '');
      setPartOfSpeech(dictData.partOfSpeech || 'noun');
    }
  }, [dictData, initialDefinition]);

  useEffect(() => {
    if (contextData && !initialDefinition) {
      setContextTranslation(contextData.translation);
      setContextExplanation(contextData.explanation);
      setDefinition((previous) => previous || contextData.translation || '');
    }
  }, [contextData, initialDefinition]);

  useEffect(() => {
    if (!packagesData?.data) return;

    const sets = packagesData.data.map((item) => ({
      id: item.id,
      title: item.title,
    }));
    setUserSets(sets);
    if (sets.length > 0) {
      setSelectedSetId((current) => current || sets[0].id);
    }
  }, [packagesData]);

  const handleCreatePackage = async () => {
    if (!newSetTitle.trim()) return;
    try {
      const newSet = await createPackageMutation.mutateAsync({
        title: newSetTitle.trim(),
        language: 'en',
        type: 'general',
      });
      setSelectedSetId(newSet.id);
      setNewSetTitle('');
      setShowCreateSet(false);
    } catch (err) {
      console.error('Failed to create package', err);
    }
  };

  const handleSaveWord = async () => {
    if (!selectedSetId) return;

    const payload = {
      word: {
        word: word.trim(),
        definition: definition.trim() || `Definition for ${word}`,
        example: initialExample || sentenceContext.trim() || null,
        partOfSpeech: partOfSpeech || null,
        notes: initialExampleTrans 
          ? `Bản dịch ví dụ: ${initialExampleTrans}` 
          : 'Added from Interactive Reader',
      },
    };

    try {
      await addWordMutation.mutateAsync({
        packageId: selectedSetId,
        payload,
      });
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error('Failed to save word', err);
    }
  };

  const saving = addWordMutation.isPending;
  const creatingPackage = createPackageMutation.isPending;

  return (
    <Card
      className="fixed z-50 max-h-[460px] w-[336px] space-y-3.5 overflow-y-auto border border-slate-200 bg-white p-3.5 shadow-2xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-950"
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
          <BookOpen className="h-3.5 w-3.5 text-blue-500" />
          Word lookup
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex border-b border-slate-100 select-none dark:border-slate-800">
        {[
          { id: 'definition', label: 'Definition', icon: null },
          { id: 'syntax', label: 'Syntax', icon: Network },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'definition' | 'syntax')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 border-b-2 pb-1.5 text-center text-xs font-bold transition-colors duration-150',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'definition' ? (
        <div className="space-y-3.5">
          {/* Header section with word details (always visible immediately) */}
          <div className="space-y-1.5 select-text">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {word}
              </span>
              {initialPartOfSpeech && isCefrLevel(initialPartOfSpeech) && (
                <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider select-none", getCefrBadgeColor(initialPartOfSpeech))}>
                  {initialPartOfSpeech.toUpperCase()}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">/</span>
              <Input
                value={pronunciation}
                onChange={(e) => setPronunciation((e.target as HTMLInputElement).value)}
                placeholder="pronunciation"
                className="h-6 w-24 text-[10px] border-none bg-slate-50 dark:bg-slate-900 focus-visible:ring-blue-500 font-mono py-0 px-1 text-slate-600 dark:text-slate-300"
              />
              <span className="text-[10px] text-slate-400 font-mono">/</span>
            </div>
          </div>

          {/* Context translation (asynchronous local loading) */}
          {isFetchingContext ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              <span className="font-semibold text-[10px]">Đang dịch nghĩa ngữ cảnh...</span>
            </div>
          ) : contextTranslation ? (
            <div className="space-y-0.5 rounded-lg border border-amber-100/70 bg-amber-50/80 p-2 text-xs select-text dark:border-amber-900/40 dark:bg-amber-950/30">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Context meaning
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {contextTranslation}
              </p>
              {contextExplanation && (
                <p className="font-sans text-[10px] leading-normal text-slate-500 dark:text-slate-400">
                  {contextExplanation}
                </p>
              )}
            </div>
          ) : null}

          {/* Teacher's Example & Translation */}
          {initialExample && (
            <div className="space-y-1 rounded-lg border border-blue-100/70 bg-blue-50/50 p-2.5 text-xs select-text dark:border-blue-900/40 dark:bg-blue-950/20">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 select-none">
                Teacher's Example
              </span>
              <p className="font-serif italic text-slate-800 dark:text-slate-100">
                "{initialExample}"
              </p>
              {initialExampleTrans && (
                <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400 border-t border-blue-100/30 dark:border-blue-900/20 pt-1 mt-1">
                  {initialExampleTrans}
                </p>
              )}
            </div>
          )}

          {/* Definition editing and saving fields */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Save definition
              </label>
              {isFetchingDict ? (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 py-1">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  <span>Đang tra cứu từ điển...</span>
                </div>
              ) : (
                <Input
                  value={definition}
                  onChange={(event) =>
                    setDefinition((event.target as HTMLInputElement).value)
                  }
                  placeholder="No definition found. Enter custom definition..."
                  className="h-8 w-full border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                />
              )}
            </div>

            {/* Part of Speech select field */}
            <div>
              <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Part of speech
              </label>
              <Select value={partOfSpeech} onValueChange={setPartOfSpeech}>
                <SelectTrigger className="h-8 w-full border-slate-200 text-xs dark:border-slate-800 dark:bg-slate-900">
                  <SelectValue placeholder="Select Part of speech" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 dark:border-slate-800">
                  {['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'].map((pos) => (
                    <SelectItem key={pos} value={pos} className="capitalize text-xs">
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save to Set / Create Set logic */}
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <div className="flex justify-between items-center select-none">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Vocabulary Package
                </label>
                <button
                  type="button"
                  onClick={() => setShowCreateSet(!showCreateSet)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  {showCreateSet ? 'Chọn bộ có sẵn' : 'Tạo bộ mới'}
                </button>
              </div>

              {showCreateSet ? (
                <div className="flex gap-1.5">
                  <Input
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle((e.target as HTMLInputElement).value)}
                    placeholder="Nhập tên bộ từ vựng..."
                    className="h-8 flex-1 border-slate-200 text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                  <Button
                    size="sm"
                    disabled={creatingPackage || !newSetTitle.trim()}
                    onClick={handleCreatePackage}
                    className="h-8 px-3 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {creatingPackage ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Tạo'
                    )}
                  </Button>
                </div>
              ) : isFetchingPackages ? (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 py-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  <span>Đang tải các bộ từ...</span>
                </div>
              ) : userSets.length === 0 ? (
                <div className="text-[10px] text-slate-500 italic py-1.5 select-none text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  Chưa có bộ từ nào. Vui lòng tạo bộ mới!
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                    <SelectTrigger className="h-8 flex-1 border-slate-200 text-xs dark:border-slate-800 dark:bg-slate-900">
                      <SelectValue placeholder="Select set" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 dark:border-slate-800">
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
                      'h-8 w-16 text-xs font-bold shrink-0',
                      saved
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
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
              )}
            </div>
          </div>
        </div>
      ) : isFetchingSyntax ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">
            Analyzing sentence structure...
          </span>
        </div>
      ) : (
        <SyntaxTreeVisualizer
          tree={syntaxTreeData || null}
          sentence={sentenceContext}
        />
      )}
    </Card>
  );
};

export default WordSelectionPopover;
