import React from 'react';
import type { FlashcardWord } from '../../types';
import { FlashcardDashboard } from './flashcard/FlashcardDashboard';
import { FlashcardCompletion } from './flashcard/FlashcardCompletion';
import { FlashcardSession } from './flashcard/FlashcardSession';
import { VOCABULARY_UI_TEXT } from '../../constants/vocabulary-ui-text';

export interface FlashcardPracticeProps {
  title: string;
  currentCard: FlashcardWord | null;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  showHint: boolean;
  focusMode: boolean;
  autoPlayAudio: boolean;
  autoShowHint: boolean;
  elapsedTime: string;
  remainingTime: string;
  stats: {
    newCount: number;
    learningCount: number;
    masteredCount: number;
    accuracyRate: number;
    avgResponseTime: number;
  };
  userStreak: number;
  onFlip: () => void;
  onGrade: (quality: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFocusMode: () => void;
  onToggleAutoPlay: () => void;
  onToggleAutoShowHint: () => void;
  onToggleShowHint: () => void;
  onPlayAudio: (e?: React.MouseEvent) => void;
  isCompleted?: boolean;
  onRestart?: () => void;
  onRestartFailedCards?: () => void;
  sessionCards: FlashcardWord[];
  sessionGrades: { [itemId: string]: number };
  onPageSelect: (index: number) => void;
  onReviewAll?: () => void;
  activeStudyMode: 'due' | 'all' | 'difficult' | 'new' | null;
  statsDashboard: { total: number; mastered: number; learning: number; newCount: number; difficultCount: number };
  onStartStudyMode: (mode: 'all' | 'difficult' | 'new') => void;
  onNavigateToQuiz?: () => void;
  onChangeStudyMode?: () => void;
  onGoHome?: () => void;
}

export const FlashcardPractice: React.FC<FlashcardPracticeProps> = (props) => {
  const { isCompleted, activeStudyMode, currentCard, onGoHome } = props;

  // Custom 3D CSS styles
  const styles = `
    .flip-card-container {
      perspective: 1500px;
    }
    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .flip-card-inner.flipped {
      transform: rotateY(180deg);
    }
    .flip-card-front, .flip-card-back {
      backface-visibility: hidden;
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .flip-card-back {
      transform: rotateY(180deg);
    }
    .gradient-border {
      position: relative;
      border-radius: 1rem;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 1px;
    }
    .gradient-border::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 1rem;
      padding: 1.5px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      opacity: 0.4;
      transition: opacity 0.3s;
    }
    .gradient-border:hover::before {
      opacity: 0.8;
    }
  `;

  const safeGoHome = onGoHome || (() => window.history.back());

  if (isCompleted) {
    return (
      <>
        <style>{styles}</style>
        <FlashcardCompletion
          totalCards={props.totalCards}
          elapsedTime={props.elapsedTime}
          stats={props.stats}
          userStreak={props.userStreak}
          sessionCards={props.sessionCards}
          sessionGrades={props.sessionGrades}
          onRestart={props.onRestart || (() => { /* empty */ })}
          onRestartFailedCards={props.onRestartFailedCards || (() => { /* empty */ })}
          onGoHome={safeGoHome}
          onNavigateToQuiz={props.onNavigateToQuiz}
          onStartStudyMode={props.onStartStudyMode}
        />
      </>
    );
  }

  if (activeStudyMode === null) {
    return (
      <>
        <style>{styles}</style>
        <FlashcardDashboard
          title={props.title}
          statsDashboard={props.statsDashboard}
          onStartStudyMode={props.onStartStudyMode}
          onGoHome={safeGoHome}
        />
      </>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 bg-[#070b15] rounded-2xl p-8 border border-slate-800">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4" />
        <p className="text-lg">{VOCABULARY_UI_TEXT.FLASHCARD_PRACTICE.LOADING_SESSION}</p>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <FlashcardSession
        title={props.title}
        currentCard={currentCard}
        currentIndex={props.currentIndex}
        totalCards={props.totalCards}
        isFlipped={props.isFlipped}
        showHint={props.showHint}
        focusMode={props.focusMode}
        autoPlayAudio={props.autoPlayAudio}
        autoShowHint={props.autoShowHint}
        elapsedTime={props.elapsedTime}
        remainingTime={props.remainingTime}
        stats={props.stats}
        userStreak={props.userStreak}
        sessionCards={props.sessionCards}
        sessionGrades={props.sessionGrades}
        onFlip={props.onFlip}
        onGrade={props.onGrade}
        onPrev={props.onPrev}
        onNext={props.onNext}
        onToggleFocusMode={props.onToggleFocusMode}
        onToggleAutoPlay={props.onToggleAutoPlay}
        onToggleAutoShowHint={props.onToggleAutoShowHint}
        onToggleShowHint={props.onToggleShowHint}
        onPlayAudio={props.onPlayAudio}
        onPageSelect={props.onPageSelect}
        onChangeStudyMode={props.onChangeStudyMode}
      />
    </>
  );
};

export default FlashcardPractice;
