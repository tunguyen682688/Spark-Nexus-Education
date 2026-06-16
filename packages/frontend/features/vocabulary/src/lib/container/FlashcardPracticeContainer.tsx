import React, { useState, useEffect } from 'react';
import { useFlashcardSession, useReviewFlashcard } from '../hooks/use-vocabulary-sets';
import { useFlashcardPractice } from '../hooks/use-flashcard-practice';
import { FlashcardPractice } from '../components/learning/FlashcardPractice';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';

export interface FlashcardPracticeContainerProps {
  setId: string;
}

export const FlashcardPracticeContainer: React.FC<FlashcardPracticeContainerProps> = ({
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

  // Delegate all state and logic to the specialized custom hook
  const practiceState = useFlashcardPractice({
    setId,
    sessionData,
    reviewAll,
    setReviewAll,
    reviewMutation,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400 bg-[#070b15] rounded-2xl p-8 border border-slate-800 animate-pulse">
        <div className="h-10 w-40 bg-slate-800 rounded-lg mb-8" />
        <div className="h-[380px] w-full bg-slate-800/50 rounded-2xl mb-6" />
        <div className="h-16 w-full bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-400 bg-[#070b15] rounded-2xl p-8 border border-red-950/20 text-center">
        <p className="text-xl font-bold mb-2">{VOCABULARY_UI_TEXT.FLASHCARD.LOAD_ERROR}</p>
        <p className="text-sm text-slate-500 mb-6">
          {error instanceof Error ? error.message : VOCABULARY_UI_TEXT.FLASHCARD.LOAD_ERROR_DESC}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
        >
          {VOCABULARY_UI_TEXT.FLASHCARD.RELOAD}
        </button>
      </div>
    );
  }

  return (
    <FlashcardPractice
      title={sessionData.title}
      currentCard={practiceState.currentCard}
      currentIndex={practiceState.currentIndex}
      totalCards={practiceState.sessionCards.length}
      isFlipped={practiceState.isFlipped}
      showHint={practiceState.showHint}
      focusMode={practiceState.focusMode}
      autoPlayAudio={practiceState.autoPlayAudio}
      autoShowHint={practiceState.autoShowHint}
      elapsedTime={practiceState.elapsedTime}
      remainingTime={practiceState.remainingTime}
      stats={practiceState.stats}
      userStreak={sessionData.streak || 0}
      onFlip={practiceState.handleFlip}
      onGrade={practiceState.handleGrade}
      onPrev={practiceState.handlePrev}
      onNext={practiceState.handleNext}
      onToggleFocusMode={() => practiceState.setFocusMode((prev) => !prev)}
      onToggleAutoPlay={practiceState.handleToggleAutoPlay}
      onToggleAutoShowHint={practiceState.handleToggleAutoShowHint}
      onToggleShowHint={() => practiceState.setShowHint((prev) => !prev)}
      onPlayAudio={practiceState.handlePlayAudio}
      isCompleted={practiceState.isCompleted}
      onRestart={practiceState.handleRestart}
      onRestartFailedCards={practiceState.handleRestartFailedCards}
      sessionCards={practiceState.sessionCards}
      sessionGrades={practiceState.sessionGrades}
      onPageSelect={practiceState.handlePageSelect}
      onReviewAll={() => setReviewAll(true)}
      activeStudyMode={practiceState.activeStudyMode}
      statsDashboard={practiceState.statsDashboard}
      onStartStudyMode={practiceState.handleStartStudyMode}
      onNavigateToQuiz={practiceState.handleNavigateToQuiz}
      onChangeStudyMode={practiceState.handleChangeStudyMode}
      onGoHome={practiceState.handleGoHome}
    />
  );
};

export default FlashcardPracticeContainer;
