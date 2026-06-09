import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlashcardSession, useVocabularySet } from '../hooks/use-vocabulary-sets';
import { useTestPractice } from '../hooks/use-test-practice';
import { TestPractice } from '../components/learning/TestPractice';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import type { QuizWord, TestSessionConfig } from '../types';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';

export interface TestPracticeContainerProps {
  setId: string;
}

/**
 * TestPracticeContainer
 *
 * Orchestrates the advanced exam-mode test:
 * 1. Fetches flashcard session (words + progress) from API
 * 2. Derives QuizWord[] usable by the test hook
 * 3. Wires all test practice hook actions to the TestPractice UI component
 */
export const TestPracticeContainer: React.FC<TestPracticeContainerProps> = ({ setId }) => {
  const navigate = useNavigate();

  // --- Data fetching ---
  const { data: vocabularySet } = useVocabularySet(setId);
  const { data: sessionData, isLoading, error } = useFlashcardSession(setId, true /* reviewAll */);

  // --- Test practice hook ---
  const test = useTestPractice();

  // Derive QuizWord[] from flashcard session
  const allWords: QuizWord[] = useMemo(() => {
    if (!sessionData?.words) return [];
    return sessionData.words;
  }, [sessionData]);

  // Compute dashboard stats from session words
  const statsDashboard = useMemo(() => {
    const total = allWords.length;
    let mastered = 0;
    let learning = 0;
    let newCount = 0;
    for (const w of allWords) {
      const mastery = w.progress?.masteryLevel ?? 0;
      if (mastery >= 0.8) mastered++;
      else if (mastery > 0) learning++;
      else newCount++;
    }
    return { total, mastered, learning, newCount };
  }, [allWords]);

  // --- Navigation ---
  const handleGoHome = useCallback(() => {
    navigate(
      ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(':id', setId)
    );
  }, [navigate, setId]);

  const handleNavigateToFlashcards = useCallback(() => {
    navigate(ROUTES.VOCABULARIES.FLASHCARD.replace(':id', setId));
  }, [navigate, setId]);

  // --- Session start ---
  const handleStartTest = useCallback(
    (config: TestSessionConfig) => {
      test.startSession(allWords, config);
    },
    [test, allWords]
  );

  // --- Audio Playback ---
  const handlePlayAudio = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const currentQ = test.currentQuestion;
    if (!currentQ) return;

    const wordDetails = currentQ.card.item.wordDetails;
    const wordMinimum = currentQ.card.item.wordMinimum;
    const audioUrl = wordDetails?.audioUrl;
    const wordText = currentQ.card.item.customWord || wordMinimum?.word || wordDetails?.word || '';

    const speakFallback = (text: string) => {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    };

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.warn('Audio URL playback failed, falling back to TTS speech:', err);
        speakFallback(wordText);
      });
    } else {
      speakFallback(wordText);
    }
  }, [test.currentQuestion]);

  // --- Loading / Error states ---
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
        <p className="text-xl font-bold mb-2">{VOCABULARY_UI_TEXT.ERRORS.TEST_LOAD_FAILED_TITLE}</p>
        <p className="text-sm text-slate-500 mb-6">
          {error instanceof Error ? error.message : VOCABULARY_UI_TEXT.ERRORS.TEST_LOAD_FAILED_DESC}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
        >
          {VOCABULARY_UI_TEXT.ERRORS.RELOAD_PAGE}
        </button>
      </div>
    );
  }

  return (
    <TestPractice
      title={vocabularySet?.title ?? sessionData.title ?? VOCABULARY_UI_TEXT.PRACTICE.TEST.DEFAULT_TITLE}
      activeConfig={test.activeConfig}
      isCompleted={test.isCompleted}
      isTimeUp={test.isTimeUp}
      currentQuestion={test.currentQuestion}
      currentIndex={test.currentIndex}
      totalQuestions={test.totalQuestions}
      elapsedTime={test.elapsedTime}
      remainingTime={test.remainingTime}
      isAnswered={test.isAnswered}
      selectedOption={test.selectedOption}
      fillInput={test.fillInput}
      matchSelections={test.matchSelections}
      score={test.score}
      answers={test.answers}
      completionStats={test.completionStats}
      sessionQuestions={test.sessionQuestions}
      statsDashboard={statsDashboard}
      onStartTest={handleStartTest}
      onSelectMCQ={test.selectMCQOption}
      onUpdateFill={test.updateFillInput}
      onSubmitFill={test.submitFillAnswer}
      onSetMatch={test.setMatchSelection}
      onSubmitMatch={test.submitMatchAnswer}
      onSkip={test.skipQuestion}
      onNext={test.goNext}
      onSubmitExam={test.submitExam}
      onRestartWrong={test.restartWithWrongAnswers}
      onRestart={test.resetSession}
      onGoHome={handleGoHome}
      onNavigateToFlashcards={handleNavigateToFlashcards}
      onPlayAudio={handlePlayAudio}
    />
  );
};

export default TestPracticeContainer;

/**
 * Convenience wrapper for use in router (reads :id from URL params)
 */
export function TestPracticeContainerFromParams() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <TestPracticeContainer setId={id} />;
}
