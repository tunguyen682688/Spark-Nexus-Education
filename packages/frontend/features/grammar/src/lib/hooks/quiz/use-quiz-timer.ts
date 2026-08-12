import { useState, useEffect, useRef } from 'react';

interface UseQuizTimerParams {
  isCompleted: boolean;
  isPaused: boolean;
  initialTime: number;
  onComplete: () => void;
}

interface UseQuizTimerReturn {
  timeLeft: number;
  setTimeLeft: (time: number) => void;
}

export function useQuizTimer({
  isCompleted,
  isPaused,
  initialTime,
  onComplete,
}: UseQuizTimerParams): UseQuizTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCompleted || isPaused || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted, isPaused, timeLeft, onComplete]);

  return { timeLeft, setTimeLeft };
}
