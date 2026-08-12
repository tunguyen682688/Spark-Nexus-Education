import { useState, useCallback } from 'react';
import type { ExamQuestion } from '../../types';

interface UseQuizHandlersParams {
  currentQuestion: ExamQuestion | undefined;
  isAnswered: boolean;
}

interface UseQuizHandlersReturn {
  selectedOpt: string | null;
  selectedWords: string[];
  selectedErrorWord: string | null;
  correctedText: string;
  isCorrect: boolean | null;
  setCorrectedText: (text: string) => void;
  handleSelectOption: (opt: string) => boolean;
  handleWordClick: (word: string) => void;
  handleRemoveWord: (wordIndex: number) => void;
  handleClearWords: () => void;
  handleCheckSentenceBuilder: () => boolean;
  handleSelectErrorWord: (word: string) => void;
  handleCheckErrorSpotlight: () => boolean;
  resetAnswer: () => void;
}

export function useQuizHandlers({
  currentQuestion,
  isAnswered,
}: UseQuizHandlersParams): UseQuizHandlersReturn {
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedErrorWord, setSelectedErrorWord] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelectOption = useCallback(
    (opt: string): boolean => {
      if (isAnswered || !currentQuestion) return false;
      setSelectedOpt(opt);
      const correct = opt === currentQuestion.answer;
      setIsCorrect(correct);
      return correct;
    },
    [isAnswered, currentQuestion]
  );

  const handleWordClick = useCallback(
    (word: string) => {
      if (isAnswered) return;
      setSelectedWords((prev) => [...prev, word]);
    },
    [isAnswered]
  );

  const handleRemoveWord = useCallback(
    (wordIndex: number) => {
      if (isAnswered) return;
      setSelectedWords((prev) => prev.filter((_, idx) => idx !== wordIndex));
    },
    [isAnswered]
  );

  const handleClearWords = useCallback(() => {
    if (isAnswered) return;
    setSelectedWords([]);
  }, [isAnswered]);

  const handleCheckSentenceBuilder = useCallback((): boolean => {
    if (isAnswered || !currentQuestion) return false;
    const rawAnswer = selectedWords.join(' ').replace(/\s+/g, ' ').trim();
    const cleanAnswer = rawAnswer.replace(/\s+([.,!?;])/g, '$1');
    const correct = cleanAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
    setIsCorrect(correct);
    return correct;
  }, [isAnswered, currentQuestion, selectedWords]);

  const handleSelectErrorWord = useCallback(
    (word: string) => {
      if (isAnswered) return;
      const cleanWord = word.replace(/[.,!?;]/g, '');
      setSelectedErrorWord(cleanWord);
    },
    [isAnswered]
  );

  const handleCheckErrorSpotlight = useCallback((): boolean => {
    if (isAnswered || !selectedErrorWord || !correctedText || !currentQuestion) return false;
    const isTargetCorrect =
      selectedErrorWord.toLowerCase() === currentQuestion.incorrectWord?.toLowerCase();
    const isCorrectionCorrect =
      correctedText.trim().toLowerCase() === currentQuestion.correctWord?.toLowerCase();
    const correct = isTargetCorrect && isCorrectionCorrect;
    setIsCorrect(correct);
    return correct;
  }, [isAnswered, selectedErrorWord, correctedText, currentQuestion]);

  const resetAnswer = useCallback(() => {
    setSelectedOpt(null);
    setSelectedWords([]);
    setSelectedErrorWord(null);
    setCorrectedText('');
    setIsCorrect(null);
  }, []);

  return {
    selectedOpt,
    selectedWords,
    selectedErrorWord,
    correctedText,
    isCorrect,
    setCorrectedText,
    handleSelectOption,
    handleWordClick,
    handleRemoveWord,
    handleClearWords,
    handleCheckSentenceBuilder,
    handleSelectErrorWord,
    handleCheckErrorSpotlight,
    resetAnswer,
  };
}
