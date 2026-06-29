import { useState, useEffect, useRef } from 'react';
import { useGrammarRoadmap } from './use-grammar-lessons';

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface UseGrammarDailyQuizProps {
  questions?: Question[];
}

export function useGrammarDailyQuiz({ questions = [] }: UseGrammarDailyQuizProps) {
  const { data: roadmap } = useGrammarRoadmap();
  
  // Real user streak days from database
  const streak = roadmap?.streakDays ?? 0;

  const activeQuestions = questions;
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | 'none'>('none');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = activeQuestions[currentIdx] || null;

  const handleTimeOut = () => {
    setSelectedOpt('');
    setIsAnswered(true);
  };

  // Timer loop
  useEffect(() => {
    if (isCompleted || isAnswered || !currentQuestion) return;

    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const currentTimer = timerRef.current;
          if (currentTimer) {
            clearInterval(currentTimer);
          }
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, isAnswered, isCompleted, currentQuestion]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQuestion) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    if (timerRef.current) clearInterval(timerRef.current);

    if (opt === currentQuestion.answer) {
      setScore((prev) => prev + 1);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 1200);
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOpt(null);
        setIsAnswered(false);
        setSlideDirection('right');
        setTimeout(() => setSlideDirection('none'), 300);
      }, 300);
    } else {
      setIsCompleted(true);
    }
  };

  const xpEarned = score * 15;
  const strokeDashoffset = (timeLeft / 30) * 113;

  return {
    activeQuestions,
    currentIdx,
    currentQuestion,
    selectedOpt,
    isAnswered,
    score,
    streak,
    timeLeft,
    showXpPopup,
    isCompleted,
    slideDirection,
    xpEarned,
    strokeDashoffset,
    handleSelectOption,
    handleNext,
  };
}
