import { useState, useEffect, useRef } from 'react';
import { useGrammarRoadmap } from './use-grammar-lessons';

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'dq-1',
    text: 'If she _____ harder, she would have passed the exam last week.',
    options: ['studied', 'had studied', 'would study', 'studies'],
    answer: 'had studied',
    explanation:
      'Đây là câu điều kiện loại 3 (vế IF dùng Past Perfect) để diễn tả giả định trái ngược với quá khứ.',
  },
  {
    id: 'dq-2',
    text: 'He insists that his secretary _____ present at the formal board meeting.',
    options: ['is', 'be', 'was', 'should been'],
    answer: 'be',
    explanation:
      'Cấu trúc giả định (Subjunctive Mood): Subject + insist + that + Subject + bare infinitive (be).',
  },
  {
    id: 'dq-3',
    text: 'I _____ in Hanoi for five years before I moved to Saigon in 2024.',
    options: ['lived', 'have lived', 'had lived', 'was living'],
    answer: 'had lived',
    explanation:
      'Hành động sống ở Hà Nội kết thúc trước hành động chuyển vào Sài Gòn (quá khứ đơn), nên dùng Quá khứ hoàn thành.',
  },
  {
    id: 'dq-4',
    text: 'No sooner _____ the classroom than the bell rang.',
    options: ['had we entered', 'we entered', 'did we entered', 'had we enter'],
    answer: 'had we entered',
    explanation:
      'Cấu trúc đảo ngữ với No sooner: No sooner + trợ động từ (had) + S + V3/ed + than + S + V2/ed.',
  },
  {
    id: 'dq-5',
    text: 'I would rather you _____ all the grammar homework tonight.',
    options: ['finish', 'finished', 'had finished', 'would finish'],
    answer: 'finished',
    explanation:
      'Cấu trúc would rather ở hiện tại/tương lai đi kèm mệnh đề sau dùng Quá khứ đơn (giả định trái hiện tại).',
  },
];

interface UseGrammarDailyQuizProps {
  questions?: Question[];
}

export function useGrammarDailyQuiz({ questions = [] }: UseGrammarDailyQuizProps) {
  const { data: roadmap } = useGrammarRoadmap();
  
  // Real user streak days from database
  const streak = roadmap?.streakDays ?? 0;

  const activeQuestions = questions.length > 0 ? questions : MOCK_QUESTIONS;
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | 'none'>('none');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = activeQuestions[currentIdx];

  const handleTimeOut = () => {
    setSelectedOpt('');
    setIsAnswered(true);
  };

  // Timer loop
  useEffect(() => {
    if (isCompleted || isAnswered) return;

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
  }, [currentIdx, isAnswered, isCompleted]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
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
