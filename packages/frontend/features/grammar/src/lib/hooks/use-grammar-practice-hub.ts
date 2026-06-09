import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGrammarPracticeQuestions } from './use-grammar-practice';
import type { PracticeQuestion } from '../types';

export function useGrammarPracticeHub(onBackToRoadmap: () => void) {
  // Practice configuration states
  const [level, setLevel] = useState<
    'ALL' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  >('ALL');
  const [category, setCategory] = useState<
    'ALL' | 'syntax' | 'tenses' | 'morphology' | 'modality'
  >('ALL');
  const [type, setType] = useState<
    | 'ALL'
    | 'MULTIPLE_CHOICE'
    | 'FILL_IN_BLANK'
    | 'DRAG_DROP'
    | 'SENTENCE_REBUILDER'
  >('ALL');

  // Session state machine: 'config' | 'practice' | 'results'
  const [sessionState, setSessionState] = useState<
    'config' | 'practice' | 'results'
  >('config');

  // Filtering parameters used for the hook query (only updated when clicking "Bắt đầu")
  const [activeFilters, setActiveFilters] = useState({
    level: level === 'ALL' ? undefined : level,
    category: category === 'ALL' ? undefined : category,
    type: type === 'ALL' ? undefined : type,
  });

  const {
    data: questions = [],
    isLoading,
    refetch,
  } = useGrammarPracticeQuestions(activeFilters);

  // Active quiz playing states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState('');

  // Word Pill states for Drag/Click Drop (DRAG_DROP)
  const [dragDropAnswers, setDragDropAnswers] = useState<
    Record<string, string>
  >({}); // slotIndex -> word
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
  const [ddWordsPool, setDdWordsPool] = useState<string[]>([]);

  // Word Pill states for Sentence Rebuilder (SENTENCE_REBUILDER)
  const [rebuiltWords, setRebuiltWords] = useState<string[]>([]);
  const [rebuilderPool, setRebuilderPool] = useState<string[]>([]);

  // Check state
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  const currentQuestion = questions[currentIdx];

  // Reset arena state for current question
  const resetArenaForQuestion = (q: PracticeQuestion | undefined) => {
    setSelectedOption(null);
    setFillValue('');
    setDragDropAnswers({});
    setActiveSlotIdx(q && q.slots && q.slots.length > 0 ? 0 : null);
    setIsEvaluated(false);
    setIsCorrectAnswer(false);

    if (q) {
      if (q.type === 'DRAG_DROP' && q.words) {
        setDdWordsPool([...q.words].sort(() => Math.random() - 0.5));
      } else if (q.type === 'SENTENCE_REBUILDER' && q.words) {
        setRebuiltWords([]);
        setRebuilderPool([...q.words].sort(() => Math.random() - 0.5));
      }
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      resetArenaForQuestion(currentQuestion);
    }
  }, [currentIdx, currentQuestion]);

  const handleStartSession = () => {
    setActiveFilters({
      level: level === 'ALL' ? undefined : level,
      category: category === 'ALL' ? undefined : category,
      type: type === 'ALL' ? undefined : type,
    });
    setCorrectCount(0);
    setEarnedXP(0);
    setCurrentIdx(0);

    refetch().then((res) => {
      const qs = res.data || [];
      if (qs.length === 0) {
        toast.error(
          'Không tìm thấy câu hỏi nào phù hợp với bộ lọc. Vui lòng thử chọn bộ lọc rộng hơn!'
        );
      } else {
        setSessionState('practice');
        toast.success(
          `Đã sẵn sàng! Kho thực hành có ${qs.length} câu hỏi dành cho bạn.`
        );
      }
    });
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      if (!selectedOption) {
        toast.warning('Vui lòng chọn một đáp án trước!');
        return;
      }
      correct = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'FILL_IN_BLANK') {
      if (!fillValue.trim()) {
        toast.warning('Vui lòng nhập câu trả lời vào ô trống!');
        return;
      }
      const cleanInput = fillValue.trim().toLowerCase().replace(/\s+/g, ' ');
      const cleanAnswer = currentQuestion.correctAnswer
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
      correct = cleanInput === cleanAnswer;
    } else if (currentQuestion.type === 'DRAG_DROP') {
      const filledCount = Object.keys(dragDropAnswers).length;
      if (filledCount < (currentQuestion.slots || []).length) {
        toast.warning('Vui lòng lấp đầy tất cả các khoảng trống!');
        return;
      }

      let parsedCorrectAnswers: string[] = [];
      try {
        parsedCorrectAnswers = JSON.parse(currentQuestion.correctAnswer);
      } catch {
        parsedCorrectAnswers = [currentQuestion.correctAnswer];
      }

      correct = (currentQuestion.slots || []).every(
        (_: unknown, idx: number) => {
          return dragDropAnswers[idx] === parsedCorrectAnswers[idx];
        }
      );
    } else if (currentQuestion.type === 'SENTENCE_REBUILDER') {
      if (rebuiltWords.length < rebuilderPool.length + rebuiltWords.length) {
        toast.warning('Vui lòng sắp xếp tất cả các từ trước!');
        return;
      }
      const assembled = rebuiltWords.join(' ');
      correct =
        assembled.toLowerCase().trim() ===
        currentQuestion.correctAnswer.toLowerCase().trim();
    }

    setIsCorrectAnswer(correct);
    setIsEvaluated(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      setEarnedXP((prev) => prev + 10);
      toast.success('Chính xác! +10 XP 🌟');
    } else {
      toast.error('Chưa chính xác! Hãy đọc kỹ giải thích chi tiết bên dưới.');
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setSessionState('results');
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    if (isEvaluated) return;
    setActiveSlotIdx(slotIdx);
  };

  const handleWordPillClick = (word: string) => {
    if (isEvaluated || activeSlotIdx === null) return;

    const oldWord = dragDropAnswers[activeSlotIdx];
    const newPool = ddWordsPool.filter((w) => w !== word);
    if (oldWord) {
      newPool.push(oldWord);
    }

    setDragDropAnswers((prev) => ({
      ...prev,
      [activeSlotIdx]: word,
    }));

    setDdWordsPool(newPool);

    const nextEmptySlotIdx = (currentQuestion.slots || []).findIndex(
      (_: unknown, idx: number) =>
        idx !== activeSlotIdx && !dragDropAnswers[idx]
    );
    if (nextEmptySlotIdx !== -1) {
      setActiveSlotIdx(nextEmptySlotIdx);
    } else {
      setActiveSlotIdx(null);
    }
  };

  const handleClearSlot = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEvaluated) return;

    const wordToRemove = dragDropAnswers[slotIdx];
    if (!wordToRemove) return;

    const newAnswers = { ...dragDropAnswers };
    delete newAnswers[slotIdx];
    setDragDropAnswers(newAnswers);

    setDdWordsPool((prev) => [...prev, wordToRemove]);
    setActiveSlotIdx(slotIdx);
  };

  const handleRebuilderPillClick = (word: string) => {
    if (isEvaluated) return;
    setRebuiltWords((prev) => [...prev, word]);
    setRebuilderPool((prev) => prev.filter((w) => w !== word));
  };

  const handleRemoveRebuiltWord = (word: string) => {
    if (isEvaluated) return;
    setRebuiltWords((prev) => prev.filter((w) => w !== word));
    setRebuilderPool((prev) => [...prev, word]);
  };

  return {
    level,
    setLevel,
    category,
    setCategory,
    type,
    setType,
    sessionState,
    setSessionState,
    questions,
    currentIdx,
    setCurrentIdx,
    selectedOption,
    setSelectedOption,
    fillValue,
    setFillValue,
    dragDropAnswers,
    activeSlotIdx,
    setActiveSlotIdx,
    ddWordsPool,
    rebuiltWords,
    rebuilderPool,
    isEvaluated,
    isCorrectAnswer,
    correctCount,
    earnedXP,
    isLoading,
    currentQuestion,
    handleStartSession,
    handleCheckAnswer,
    handleNextQuestion,
    handleSlotClick,
    handleWordPillClick,
    handleClearSlot,
    handleRebuilderPillClick,
    handleRemoveRebuiltWord,
  };
}
