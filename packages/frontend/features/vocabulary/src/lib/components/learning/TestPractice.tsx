import React from 'react';
import type { TestQuestion, TestSessionAnswer, TestCompletionStats, TestSessionConfig } from '../../types';
import { TestDashboard } from './test/TestDashboard';
import { TestSession } from './test/TestSession';
import { TestCompletion } from './test/TestCompletion';

export interface TestPracticeProps {
  title: string;
  activeConfig: TestSessionConfig | null;
  isCompleted: boolean;
  isTimeUp: boolean;
  currentQuestion: TestQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  elapsedTime: string;
  remainingTime: string | null;
  isAnswered: boolean;
  selectedOption: number | null;
  fillInput: string;
  matchSelections: Record<string, string>;
  score: { correct: number; total: number };
  answers: Record<string, TestSessionAnswer>;
  completionStats: TestCompletionStats | null;
  sessionQuestions: TestQuestion[];
  statsDashboard: { total: number; mastered: number; learning: number; newCount: number };

  onStartTest: (config: TestSessionConfig) => void;
  onSelectMCQ: (index: number) => void;
  onUpdateFill: (value: string) => void;
  onSubmitFill: () => void;
  onSetMatch: (left: string, right: string) => void;
  onSubmitMatch: () => void;
  onSkip: () => void;
  onNext: () => void;
  onSubmitExam: () => void;
  onRestartWrong: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  onNavigateToFlashcards?: () => void;
  onPlayAudio?: (e?: React.MouseEvent) => void;
}

export const TestPractice: React.FC<TestPracticeProps> = (props) => {
  const { activeConfig, isCompleted, currentQuestion } = props;

  // 1. Completion screen
  if (isCompleted && props.completionStats) {
    return (
      <TestCompletion
        title={props.title}
        completionStats={props.completionStats}
        sessionQuestions={props.sessionQuestions}
        answers={props.answers}
        onRestart={props.onRestart}
        onRestartWrong={props.onRestartWrong}
        onGoHome={props.onGoHome}
        onNavigateToFlashcards={props.onNavigateToFlashcards}
      />
    );
  }

  // 2. Dashboard (config) screen – no active session yet
  if (activeConfig === null) {
    return (
      <TestDashboard
        title={props.title}
        statsDashboard={props.statsDashboard}
        onStartTest={props.onStartTest}
        onGoHome={props.onGoHome}
      />
    );
  }

  // 3. Loading state
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-gray-400 bg-[#070b15] rounded-2xl p-8 border border-slate-850 text-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-2" />
        <p className="text-lg font-bold">Đang tạo bài kiểm tra...</p>
      </div>
    );
  }

  // 4. Active session
  return (
    <TestSession
      title={props.title}
      currentQuestion={currentQuestion}
      currentIndex={props.currentIndex}
      totalQuestions={props.totalQuestions}
      elapsedTime={props.elapsedTime}
      remainingTime={props.remainingTime}
      isTimeUp={props.isTimeUp}
      isAnswered={props.isAnswered}
      selectedOption={props.selectedOption}
      fillInput={props.fillInput}
      matchSelections={props.matchSelections}
      score={props.score}
      answers={props.answers}
      onSelectMCQ={props.onSelectMCQ}
      onUpdateFill={props.onUpdateFill}
      onSubmitFill={props.onSubmitFill}
      onSetMatch={props.onSetMatch}
      onSubmitMatch={props.onSubmitMatch}
      onSkip={props.onSkip}
      onNext={props.onNext}
      onSubmitExam={props.onSubmitExam}
      onPlayAudio={props.onPlayAudio}
    />
  );
};

export default TestPractice;
