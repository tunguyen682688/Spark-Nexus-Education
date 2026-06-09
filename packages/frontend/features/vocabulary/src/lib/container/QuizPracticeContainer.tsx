import React, { useState, useEffect } from 'react';
import { useFlashcardSession, useReviewFlashcard } from '../hooks/use-vocabulary-sets';
import { useQuizPractice } from '../hooks/use-quiz-practice';
import { QuizPractice } from '../components/learning/QuizPractice';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';

export interface QuizPracticeContainerProps {
  setId: string;
}

export const QuizPracticeContainer: React.FC<QuizPracticeContainerProps> = ({
  setId,
}) => {
  const [reviewAll, setReviewAll] = useState<boolean>(false);
  const { data: sessionData, isLoading, error } = useFlashcardSession(setId, reviewAll);
  const reviewMutation = useReviewFlashcard(setId);

  // Automatically switch to reviewAll mode if the standard SRS due session is empty
  useEffect(() => {
    if (sessionData && sessionData.words.length === 0 && !reviewAll) {
      setReviewAll(true);
    }
  }, [sessionData, reviewAll]);

  // Delegate all state, logic and keyboard key handlers to the specialized custom hook
  const quizState = useQuizPractice({
    setId,
    sessionData,
    reviewAll,
    setReviewAll,
    reviewMutation,
  });

  // Keyboard Hotkeys Listener inside container for window focus binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );
      if (isInput || quizState.isCompleted) return;

      if (!quizState.isAnswered) {
        if (e.key === '1') {
          e.preventDefault();
          quizState.handleSelectOption(0);
        } else if (e.key === '2') {
          e.preventDefault();
          quizState.handleSelectOption(1);
        } else if (e.key === '3') {
          e.preventDefault();
          quizState.handleSelectOption(2);
        } else if (e.key === '4') {
          e.preventDefault();
          quizState.handleSelectOption(3);
        }
      } else {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          quizState.handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState.isAnswered, quizState.isCompleted, quizState.handleSelectOption, quizState.handleNext]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400 bg-[#070b15] rounded-2xl p-8 border border-slate-800 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg mb-8" />
        <div className="h-[260px] w-full bg-slate-800/50 rounded-2xl mb-6" />
        <div className="h-16 w-full bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-400 bg-[#070b15] rounded-2xl p-8 border border-red-950/20 text-center">
        <p className="text-xl font-bold mb-2">{VOCABULARY_UI_TEXT.ERRORS.TEST_LOAD_FAILED_TITLE}</p>
        <p className="text-sm text-slate-500 mb-6">
          {error instanceof Error ? error.message : VOCABULARY_UI_TEXT.ERRORS.QUIZ_LOAD_FAILED_DESC}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
        >
          {VOCABULARY_UI_TEXT.ERRORS.RELOAD_PAGE}
        </button>
      </div>
    );
  }

  return (
    <QuizPractice
      title={sessionData.title}
      currentQuestion={quizState.currentQuestion}
      currentIndex={quizState.currentIndex}
      totalQuestions={quizState.questions.length}
      selectedOption={quizState.selectedOption}
      isAnswered={quizState.isAnswered}
      score={{
        correct: Object.values(quizState.sessionAnswers).filter(a => a.isCorrect).length,
        total: quizState.questions.length,
      }}
      currentStreak={quizState.currentStreak}
      autoPlayAudio={quizState.autoPlayAudio}
      isLoading={isLoading}
      activeStudyMode={quizState.activeStudyMode}
      statsDashboard={quizState.statsDashboard}
      onStartStudyMode={quizState.handleStartStudyMode}
      elapsedTime={quizState.elapsedTime}
      avgResponseTime={quizState.avgResponseTime}
      onSelectOption={quizState.handleSelectOption}
      onNext={quizState.handleNext}
      onPlayAudio={quizState.handlePlayAudio}
      onToggleAutoPlay={quizState.handleToggleAutoPlay}
      onReviewAll={() => setReviewAll(true)}
      isCompleted={quizState.isCompleted}
      onRestart={quizState.handleRestart}
      onRestartFailedQuestions={quizState.handleRestartFailedQuestions}
      onGoHome={quizState.handleGoHome}
      sessionQuestions={quizState.questions}
      sessionAnswers={quizState.sessionAnswers}
      onNavigateToFlashcards={quizState.handleNavigateToFlashcards}
      onChangeStudyMode={quizState.handleChangeStudyMode}
    />
  );
};

export default QuizPracticeContainer;