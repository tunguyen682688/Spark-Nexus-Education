import React from 'react';
import type { LearningQuizQuestion } from '../../types';
import { QuizDashboard } from './quiz/QuizDashboard';
import { QuizCompletion } from './quiz/QuizCompletion';
import { QuizSession } from './quiz/QuizSession';
import { VOCABULARY_UI_TEXT } from '../../constants/vocabulary-ui-text';

export interface QuizPracticeProps {
  title: string;
  currentQuestion: LearningQuizQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  isAnswered: boolean;
  score: { correct: number; total: number };
  currentStreak: number;
  autoPlayAudio: boolean;
  isLoading?: boolean;
  activeStudyMode: 'due' | 'all' | 'difficult' | 'new' | null;
  statsDashboard: { total: number; mastered: number; learning: number; newCount: number; difficultCount: number };
  onStartStudyMode: (mode: 'all' | 'difficult' | 'new') => void;
  elapsedTime: string;
  avgResponseTime: number;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onPlayAudio: (e?: React.MouseEvent) => void;
  onToggleAutoPlay: () => void;
  onReviewAll?: () => void;
  isCompleted?: boolean;
  onRestart: () => void;
  onRestartFailedQuestions?: () => void;
  onGoHome: () => void;
  sessionQuestions: LearningQuizQuestion[];
  sessionAnswers: { [questionIndex: number]: { selected: number; correct: number; isCorrect: boolean } };
  onNavigateToFlashcards?: () => void;
  onChangeStudyMode?: () => void;
}

export const QuizPractice: React.FC<QuizPracticeProps> = (props) => {
  const { isCompleted, activeStudyMode, currentQuestion } = props;

  // Custom visual styles injection
  const customStyles = `
    .gradient-border-quiz {
      position: relative;
      border-radius: 1.5rem;
      background: linear-gradient(135deg, #131a2e 0%, #0b0f19 100%);
      padding: 1px;
    }
    .gradient-border-quiz::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 1.5rem;
      padding: 2px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      opacity: 0.3;
      transition: opacity 0.3s;
    }
    .gradient-border-quiz:hover::before {
      opacity: 0.6;
    }
  `;

  if (isCompleted) {
    return (
      <>
        <style>{customStyles}</style>
        <QuizCompletion
          title={props.title}
          elapsedTime={props.elapsedTime}
          avgResponseTime={props.avgResponseTime}
          score={props.score}
          sessionQuestions={props.sessionQuestions}
          sessionAnswers={props.sessionAnswers}
          onRestart={props.onRestart}
          onRestartFailedQuestions={props.onRestartFailedQuestions}
          onGoHome={props.onGoHome}
          onNavigateToFlashcards={props.onNavigateToFlashcards}
          onStartStudyMode={props.onStartStudyMode}
        />
      </>
    );
  }

  if (activeStudyMode === null) {
    return (
      <>
        <style>{customStyles}</style>
        <QuizDashboard
          title={props.title}
          statsDashboard={props.statsDashboard}
          onStartStudyMode={props.onStartStudyMode}
          onGoHome={props.onGoHome}
        />
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-gray-400 bg-[#070b15] rounded-2xl p-8 border border-slate-850 text-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-2" />
        <p className="text-lg font-bold">{VOCABULARY_UI_TEXT.LOADING.QUIZ}</p>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <QuizSession
        title={props.title}
        currentQuestion={currentQuestion}
        currentIndex={props.currentIndex}
        totalQuestions={props.totalQuestions}
        selectedOption={props.selectedOption}
        isAnswered={props.isAnswered}
        score={props.score}
        currentStreak={props.currentStreak}
        elapsedTime={props.elapsedTime}
        avgResponseTime={props.avgResponseTime}
        sessionAnswers={props.sessionAnswers}
        onSelectOption={props.onSelectOption}
        onNext={props.onNext}
        onPlayAudio={props.onPlayAudio}
        onChangeStudyMode={props.onChangeStudyMode}
      />
    </>
  );
};

export default QuizPractice;
