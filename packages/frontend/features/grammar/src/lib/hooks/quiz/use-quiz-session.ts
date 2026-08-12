import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface QuizSessionData {
  currentIdx?: number;
  score?: number;
  wrongQuestionIds?: string[];
  timeLeft?: number;
  isAnswered?: boolean;
  isCorrect?: boolean | null;
  selectedOpt?: string | null;
  selectedWords?: string[];
  selectedErrorWord?: string | null;
  correctedText?: string;
  activeQuestionsIds?: string[];
}

interface UseQuizSessionParams {
  lessonId: string;
  isCompleted: boolean;
  showRecoveryModal: boolean;
  activeQuestionIds: string[];
  questions: { id: string }[];
}

interface UseQuizSessionReturn {
  showRecoveryModal: boolean;
  recoveryData: QuizSessionData | null;
  handleRecover: (restore: (data: QuizSessionData) => void) => void;
  handleDiscard: (reset: () => void) => void;
}

export function useQuizSession({
  lessonId,
  isCompleted,
  showRecoveryModal: showRecoveryModalProp,
  activeQuestionIds,
  questions,
}: UseQuizSessionParams): UseQuizSessionReturn {
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<QuizSessionData | null>(null);

  const sessionKey = `sne_quiz_session_${lessonId}`;

  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizSessionData;
        if (
          parsed &&
          parsed.timeLeft &&
          parsed.timeLeft > 0 &&
          ((parsed.currentIdx && parsed.currentIdx > 0) || (parsed.score && parsed.score > 0) || parsed.isAnswered)
        ) {
          setRecoveryData(parsed);
          setShowRecoveryModal(true);
        }
      } catch {
        console.error('Lỗi phân tích cú pháp phiên lưu trữ:');
      }
    }
  }, [sessionKey]);

  useEffect(() => {
    if (isCompleted) {
      localStorage.removeItem(sessionKey);
    }
  }, [isCompleted, sessionKey]);

  const handleRecover = (restore: (data: QuizSessionData) => void) => {
    if (recoveryData) {
      restore(recoveryData);
      toast.success('Đã khôi phục phiên làm bài quiz thành công!');
    }
    setShowRecoveryModal(false);
  };

  const handleDiscard = (reset: () => void) => {
    localStorage.removeItem(sessionKey);
    setShowRecoveryModal(false);
    reset();
    toast.info('Bắt đầu làm bài quiz mới!');
  };

  return {
    showRecoveryModal,
    recoveryData,
    handleRecover,
    handleDiscard,
  };
}

interface UseQuizAutosaveParams {
  lessonId: string;
  isCompleted: boolean;
  showRecoveryModal: boolean;
  state: QuizSessionData;
}

export function useQuizAutosave({
  lessonId,
  isCompleted,
  showRecoveryModal,
  state,
}: UseQuizAutosaveParams): void {
  const sessionKey = `sne_quiz_session_${lessonId}`;

  useEffect(() => {
    if (
      !isCompleted &&
      !showRecoveryModal &&
      state.timeLeft &&
      state.timeLeft > 0 &&
      ((state.currentIdx && state.currentIdx > 0) || (state.isAnswered) || (state.score && state.score > 0)) &&
      state.activeQuestionsIds &&
      state.activeQuestionsIds.length > 0
    ) {
      localStorage.setItem(sessionKey, JSON.stringify(state));
    }
  }, [state, isCompleted, showRecoveryModal, sessionKey]);
}
