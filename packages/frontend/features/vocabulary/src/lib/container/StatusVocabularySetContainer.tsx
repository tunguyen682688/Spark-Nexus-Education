import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Volume2,
  Pencil,
  Search,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@spark-nest-ed/frontend-shared-components";
import { useToast } from "@spark-nest-ed/frontend-shared-components";
import { ROUTES } from "@spark-nest-ed/frontend-core-constants";
import VocabularyDetailsSet from "../components/manager/VocabularyDetailsSet";
import { useSetWords } from "../hooks/use-vocabulary-sets";
import type { VocabularyWord } from "../components/PersonalVocabularyCard";
import { VOCABULARY_UI_TEXT } from "../constants/vocabulary-ui-text";




interface StatusVocabulariesContainerProps {
  vocabularySetId?: string;
}

const StatusVocabulariesContainer: React.FC<
  StatusVocabulariesContainerProps
> = ({ vocabularySetId: propVocabularySetId }) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const vocabularySetId = propVocabularySetId || routeId || "";
  const { toast } = useToast();

  const {
    data: wordsData,
    isLoading: isWordsLoading,
    error: wordsError,
  } = useSetWords(vocabularySetId, { pageSize: 100 });

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL"); // ALL, MASTERED, LEARNING, NEW
  const [sortBy, setSortBy] = useState<"word" | "meaning" | "status" | "repetitions" | "nextReviewAt">("word");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // default 5 entries to match user screenshot

  // Selected word details modal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [isWordDetailsOpen, setIsWordDetailsOpen] = useState(false);

  // Transform API data to flat Table items with SRS stats
  const words = useMemo(() => {
    if (!wordsData?.data) return [];

    return wordsData.data.map((item) => {
      const base = item.wordDetails ?? item.wordMinimum;
      const word = item.customWord ?? base?.word ?? "";
      const meaning = item.customDefinition ?? base?.definition ?? "";
      const example = item.customExample ?? base?.example ?? "";
      const pronunciation = base?.pronunciation ?? "";

      // Mastery level (0 to 100)
      const rawMastery = item.userProgress?.masteryLevel ?? 0;
      const mastery = Math.round(rawMastery * 100);

      // Repetitions
      const repetitions = item.userProgress?.repetitions ?? 0;

      // Status matching (NEW, LEARNING, MASTERED)
      const rawStatus = item.userProgress?.status ?? 'NEW';
      const status: 'NEW' | 'LEARNING' | 'MASTERED' = 
        rawStatus === 'MASTERED' ? 'MASTERED' :
        rawStatus === 'LEARNING' ? 'LEARNING' : 'NEW';

      const nextReviewAt = item.userProgress?.nextReviewAt ?? null;

      return {
        id: item.id, // vocabulary set item id
        entryId: base?.id ?? item.entryId,
        word,
        meaning,
        example: example || "",
        level: "INTERMEDIATE" as VocabularyWord["level"],
        pronunciation,
        isFavorite: false,
        lastReviewed: item.addedAt || new Date().toISOString(),
        mastery,
        status,
        repetitions,
        nextReviewAt,
        tags: []
      };
    });
  }, [wordsData]);

  // Reset page when search or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Filtered and sorted words
  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(term) ||
          w.meaning.toLowerCase().includes(term) ||
          w.pronunciation.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (selectedStatus !== "ALL") {
      result = result.filter((w) => w.status === selectedStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valA = a[sortBy] as string | number;
      let valB = b[sortBy] as string | number;

      // Handle null/undefined values
      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        const numA = Number(valA);
        const numB = Number(valB);
        return sortOrder === "asc" ? numA - numB : numB - numA;
      }
    });

    return result;
  }, [words, searchTerm, selectedStatus, sortBy, sortOrder]);

  // Client-Side Pagination calculations
  const totalEntries = filteredAndSortedWords.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedWords.slice(start, start + pageSize);
  }, [filteredAndSortedWords, currentPage, pageSize]);

  const startEntryIndex = totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntryIndex = Math.min(currentPage * pageSize, totalEntries);

  // Next review format helper
  const formatNextReview = (nextReviewAtStr?: string | null): string => {
    if (!nextReviewAtStr) return '-';
    const nextDate = new Date(nextReviewAtStr);
    const now = new Date();
    
    // Strip time for simple date comparison
    const d1 = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return VOCABULARY_UI_TEXT.DATATABLE.TIME.OVERDUE;
    if (diffDays === 0) return VOCABULARY_UI_TEXT.DATATABLE.TIME.TODAY;
    if (diffDays === 1) return VOCABULARY_UI_TEXT.DATATABLE.TIME.TOMORROW;
    if (diffDays <= 7) return VOCABULARY_UI_TEXT.DATATABLE.TIME.IN_DAYS(diffDays);
    
    return nextDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Sorting handler for columns
  const handleSortHeader = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Handle errors
  useEffect(() => {
    if (wordsError) {
      toast({
        title: VOCABULARY_UI_TEXT.ERRORS.WORDS_LOAD_FAILED_TITLE,
        description: VOCABULARY_UI_TEXT.ERRORS.WORDS_LOAD_FAILED_DESC,
        variant: "destructive",
      });
    }
  }, [wordsError, toast]);

  // Text-To-Speech Pronunciation helper
  const handlePlayPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: VOCABULARY_UI_TEXT.ERRORS.AUDIO_NOT_SUPPORTED_TITLE,
        description: VOCABULARY_UI_TEXT.ERRORS.AUDIO_NOT_SUPPORTED_DESC,
        variant: "destructive",
      });
    }
  };

  // Handle word details modal open/close
  const handleWordDetailsOpenChange = (open: boolean) => {
    setIsWordDetailsOpen(open);
    if (!open) {
      setSelectedWord(null);
    }
  };

  // Handle add/edit word
  const handleAddNewWord = () => {
    if (!vocabularySetId) return;
    navigate(ROUTES.VOCABULARIES.UPDATE.replace(':id', vocabularySetId));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Heading and Actions Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Vocabulary List
          <span className="text-sm text-slate-400 font-normal ml-1">
            ({totalEntries})
          </span>
        </h2>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAddNewWord}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl px-4 py-2 border-0 cursor-pointer shadow-lg shadow-blue-600/10 transition-all duration-200"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {VOCABULARY_UI_TEXT.DATATABLE.ACTIONS.ADD_NEW}
          </Button>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="w-full bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* ── Datatable Control Filters ── */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 p-6 border-b border-white/10 bg-[#1e293b]/30">
          {/* Table Search */}
          <div className="flex items-center bg-[#283041] rounded-lg px-3 py-2 border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 transition-all w-full lg:w-auto flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input
              type="text"
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-400 focus:ring-0 focus:outline-none"
              placeholder="Filter list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Status Filter */}
            <div className="relative flex items-center bg-[#283041] rounded-lg px-3 py-2 border border-white/10 text-sm text-slate-400 hover:text-white transition-colors">
              <span className="flex items-center">
                <span className="text-xs mr-2">Status:</span>
              </span>
              <select
                className="bg-transparent border-none outline-none text-sm text-white font-medium pl-1 pr-4 cursor-pointer appearance-none focus:ring-0"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.STATUS.ALL}</option>
                <option value="MASTERED" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.STATUS.MASTERED}</option>
                <option value="LEARNING" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.STATUS.LEARNING}</option>
                <option value="NEW" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.STATUS.NEW}</option>
              </select>
            </div>

            {/* Alphabetical / Sort Filter */}
            <div className="relative flex items-center bg-[#283041] rounded-lg px-3 py-2 border border-white/10 text-sm text-slate-400 hover:text-white transition-colors">
              <span className="flex items-center">
                <span className="text-xs mr-2">Sort:</span>
              </span>
              <select
                className="bg-transparent border-none outline-none text-sm text-white font-medium pl-1 pr-4 cursor-pointer appearance-none focus:ring-0"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "word" | "meaning" | "status" | "repetitions" | "nextReviewAt")}
              >
                <option value="word" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.SORT.ALPHABETICAL}</option>
                <option value="repetitions" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.SORT.REPETITIONS}</option>
                <option value="status" className="bg-[#0f172a] text-white">{VOCABULARY_UI_TEXT.DATATABLE.SORT.STATUS}</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Words Table ── */}
        <div className="overflow-x-auto">
          {isWordsLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">{VOCABULARY_UI_TEXT.DATATABLE.LOADING}</p>
            </div>
          ) : paginatedWords.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-slate-800/30 rounded-full text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-semibold">{VOCABULARY_UI_TEXT.DATATABLE.EMPTY_STATE_TITLE}</p>
              <p className="text-[11px] text-slate-500 mt-[-6px]">{VOCABULARY_UI_TEXT.DATATABLE.EMPTY_STATE_DESC}</p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-[#1e293b]/80 backdrop-blur-md sticky top-0 z-10">
                  <th 
                    className="px-6 py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold cursor-pointer hover:text-white transition-colors w-1/5" 
                    onClick={() => handleSortHeader("word")}
                  >
                    <div className="flex items-center gap-1.5">
                      {VOCABULARY_UI_TEXT.DATATABLE.HEADERS.WORD} <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold cursor-pointer hover:text-white transition-colors w-2/5" 
                    onClick={() => handleSortHeader("meaning")}
                  >
                    <div className="flex items-center gap-1.5">
                      {VOCABULARY_UI_TEXT.DATATABLE.HEADERS.MEANING} <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center cursor-pointer hover:text-white transition-colors" 
                    onClick={() => handleSortHeader("status")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {VOCABULARY_UI_TEXT.DATATABLE.HEADERS.STATUS} <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center cursor-pointer hover:text-white transition-colors" 
                    onClick={() => handleSortHeader("repetitions")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {VOCABULARY_UI_TEXT.DATATABLE.HEADERS.REPETITIONS} <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center cursor-pointer hover:text-white transition-colors" 
                    onClick={() => handleSortHeader("nextReviewAt")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {VOCABULARY_UI_TEXT.DATATABLE.HEADERS.NEXT_REVIEW} <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold text-right">{VOCABULARY_UI_TEXT.DATATABLE.HEADERS.ACTIONS}</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {paginatedWords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer border-t border-white/5"
                    onClick={() => {
                      setSelectedWord(item);
                      setIsWordDetailsOpen(true);
                    }}
                  >
                    {/* Word and pronunciation */}
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col min-w-[120px]">
                        <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                          {item.word}
                        </span>
                        <span className="text-xs text-slate-400 font-mono mt-1">
                          {item.pronunciation || '/.../'}
                        </span>
                      </div>
                    </td>

                    {/* Meaning */}
                    <td className="px-6 py-4 align-middle">
                      <p className="text-sm text-slate-300 leading-normal max-w-sm truncate">
                        {item.meaning}
                      </p>
                    </td>

                    {/* Badge status */}
                    <td className="px-6 py-4 text-center align-middle">
                      <div className="flex justify-center">
                        {item.status === 'MASTERED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            {VOCABULARY_UI_TEXT.DATATABLE.STATUS.MASTERED}
                          </span>
                        ) : item.status === 'LEARNING' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {VOCABULARY_UI_TEXT.DATATABLE.STATUS.LEARNING}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
                            {VOCABULARY_UI_TEXT.DATATABLE.STATUS.NEW}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Repetitions */}
                    <td className="px-6 py-4 text-center align-middle font-bold text-sm text-slate-200">
                      {item.repetitions}
                    </td>

                    {/* Next review date */}
                    <td className="px-6 py-4 text-center align-middle">
                      <span className={`text-sm ${
                        item.status === 'MASTERED' ? 'text-slate-500' :
                        formatNextReview(item.nextReviewAt) === VOCABULARY_UI_TEXT.STATUS_UI.TODAY || formatNextReview(item.nextReviewAt) === VOCABULARY_UI_TEXT.STATUS_UI.TOMORROW
                          ? 'text-white font-medium animate-pulse-soft'
                          : 'text-slate-400'
                      }`}>
                        {formatNextReview(item.nextReviewAt)}
                      </span>
                    </td>

                    {/* Actions column */}
                    <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-3 text-slate-400">
                        {/* Audio speaker */}
                        <button
                          onClick={() => handlePlayPronunciation(item.word)}
                          className="hover:text-blue-400 transition-colors p-1"
                          title={VOCABULARY_UI_TEXT.STATUS_UI.PRONUNCIATION}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Edit card */}
                        <button
                          onClick={() => {
                            if (!vocabularySetId) return;
                            navigate(ROUTES.VOCABULARIES.UPDATE.replace(':id', vocabularySetId));
                          }}
                          className="hover:text-blue-400 transition-colors p-1"
                          title={VOCABULARY_UI_TEXT.STATUS_UI.EDIT_WORD}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Table Pagination Footer ── */}
        {!isWordsLoading && totalEntries > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#1e293b]/20 flex items-center justify-between text-sm text-slate-400">
            <span>
              {VOCABULARY_UI_TEXT.DATATABLE.PAGINATION.SHOWING(startEntryIndex, endEntryIndex, totalEntries)}
            </span>

            {/* Pagination Controls */}
            <div className="flex space-x-1">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-[#283041] border border-white/10 text-slate-350 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                {VOCABULARY_UI_TEXT.DATATABLE.PAGINATION.PREV}
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNum = index + 1;
                const isSelected = pageNum === currentPage;
                
                // Show pages around the current page to make it scalable
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded border transition-colors ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white font-bold"
                          : "bg-[#283041] border-white/10 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }

                // Ellipsis indicators
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <span key={pageNum} className="px-2 py-1 text-slate-500 select-none">
                      ...
                    </span>
                  );
                }

                return null;
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-[#283041] border border-white/10 text-slate-350 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                {VOCABULARY_UI_TEXT.DATATABLE.PAGINATION.NEXT}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Word Details Modal ── */}
      {selectedWord && (
        <VocabularyDetailsSet
          word={selectedWord}
          open={isWordDetailsOpen}
          onOpenChange={handleWordDetailsOpenChange}
          onFavoriteToggle={() => { /* Empty */ }}
          onPlayPronunciation={handlePlayPronunciation}
        />
      )}
    </div>
  );
};

export default StatusVocabulariesContainer;
