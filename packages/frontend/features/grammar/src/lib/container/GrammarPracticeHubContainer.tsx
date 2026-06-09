import { FC } from 'react';
import {
  Sparkles,
  ArrowRight,
  Award,
  Layers,
  BookOpen,
  Check,
  X,
  Flame,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Progress,
} from '@spark-nest-ed/frontend-shared-components';
import { useGrammarPracticeHub } from '../hooks';
import {
  MultipleChoicePresenter,
  FillInBlankPresenter,
  DragDropPresenter,
  SentenceRebuilderPresenter,
} from '../components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { GRAMMAR_UI_TEXT } from '../constants';

interface GrammarPracticeHubContainerProps {
  onBackToRoadmap: () => void;
}

export const GrammarPracticeHubContainer: FC<
  GrammarPracticeHubContainerProps
> = ({ onBackToRoadmap }) => {
  const {
    level,
    setLevel,
    category,
    setCategory,
    type,
    setType,
    sessionState,
    setSessionState,
    questions,
    currentIdx,
    selectedOption,
    setSelectedOption,
    fillValue,
    setFillValue,
    dragDropAnswers,
    activeSlotIdx,
    ddWordsPool,
    rebuiltWords,
    rebuilderPool,
    isEvaluated,
    isCorrectAnswer,
    correctCount,
    earnedXP,
    isLoading,
    currentQuestion,
    handleStartSession,
    handleCheckAnswer,
    handleNextQuestion,
    handleSlotClick,
    handleWordPillClick,
    handleClearSlot,
    handleRebuilderPillClick,
    handleRemoveRebuiltWord,
  } = useGrammarPracticeHub(onBackToRoadmap);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Glow Shadows */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-full mx-auto space-y-6 relative z-10">
        {/* State 1: Practice configuration panel */}
        {sessionState === 'config' && (
          <div className="space-y-6">
            {/* Title Header */}
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div className="space-y-1">
                <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.practiceHub.hubTitleBadge}
                </span>
                <h1 className="text-3xl font-extrabold text-foreground">
                  {GRAMMAR_UI_TEXT.practiceHub.hubTitle}
                </h1>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  {GRAMMAR_UI_TEXT.practiceHub.hubDesc}
                </p>
              </div>
              <Button
                onClick={onBackToRoadmap}
                variant="outline"
                className="text-xs border-border hover:bg-secondary cursor-pointer"
              >
                {GRAMMAR_UI_TEXT.practiceHub.btnBackToRoadmap}
              </Button>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Level Selector */}
              <Card className="bg-card border-border rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  {GRAMMAR_UI_TEXT.practiceHub.labelLevel}
                </h3>
                <div className="flex flex-col gap-2">
                  {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map(
                    (lvl) => {
                      const isActive = level === lvl;
                      return (
                        <button
                          key={lvl}
                          onClick={() => setLevel(lvl)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs text-left font-bold transition-all flex items-center justify-between border cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 border-primary/30 text-primary shadow-md'
                              : 'bg-muted/40 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                          }`}
                        >
                          <span>
                            {lvl === 'ALL'
                              ? GRAMMAR_UI_TEXT.practiceHub.allLevels
                              : GRAMMAR_UI_TEXT.practiceHub.levelLabel.replace('{level}', lvl)}
                          </span>
                          {isActive && <Check className="h-3.5 w-3.5" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </Card>

              {/* Option 2: Category Selector */}
              <Card className="bg-card border-border rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  {GRAMMAR_UI_TEXT.practiceHub.labelTopic}
                </h3>
                <div className="flex flex-col gap-2">
                  {(
                    [
                      { id: 'ALL', label: GRAMMAR_UI_TEXT.practiceHub.allTopics },
                      { id: 'syntax', label: 'Syntax (Cú pháp)' },
                      { id: 'tenses', label: 'Tenses (Thì & Thể)' },
                      { id: 'morphology', label: 'Morphology (Hình thái)' },
                      { id: 'modality', label: 'Modality (Sắc thái)' },
                    ] as const
                  ).map((cat) => {
                    const isActive = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs text-left font-bold transition-all flex items-center justify-between border cursor-pointer ${
                          isActive
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-md'
                            : 'bg-muted/40 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isActive && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Option 3: Exercise Format Selector */}
              <Card className="bg-card border-border rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  {GRAMMAR_UI_TEXT.practiceHub.labelType}
                </h3>
                <div className="flex flex-col gap-2">
                  {(
                    [
                      {
                        id: 'ALL',
                        label: GRAMMAR_UI_TEXT.practiceHub.allTypes,
                        emoji: null,
                        aria: '',
                      },
                      {
                        id: 'MULTIPLE_CHOICE',
                        label: 'Trắc Nghiệm',
                        emoji: '📝',
                        aria: 'memo',
                      },
                      {
                        id: 'FILL_IN_BLANK',
                        label: 'Điền Chỗ Trống',
                        emoji: '✍️',
                        aria: 'write',
                      },
                      {
                        id: 'DRAG_DROP',
                        label: 'Kéo Thả Từ',
                        emoji: '🔍',
                        aria: 'search',
                      },
                      {
                        id: 'SENTENCE_REBUILDER',
                        label: 'Sắp Xếp Câu',
                        emoji: '🧩',
                        aria: 'puzzle',
                      },
                    ] as const
                  ).map((tp) => {
                    const isActive = type === tp.id;
                    return (
                      <button
                        key={tp.id}
                        onClick={() => setType(tp.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs text-left font-bold transition-all flex items-center justify-between border cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-md'
                            : 'bg-muted/40 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {tp.emoji && (
                            <span role="img" aria-label={tp.aria}>
                              {tp.emoji}
                            </span>
                          )}
                          <span>{tp.label}</span>
                        </span>
                        {isActive && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Action Bar */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStartSession}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold text-xs uppercase px-12 py-3.5 rounded-xl shadow-lg active:scale-95 transition-all w-full md:w-auto"
              >
                {GRAMMAR_UI_TEXT.practiceHub.btnStart}
              </Button>
            </div>
          </div>
        )}

        {/* State 2: Practice Arena */}
        {sessionState === 'practice' && currentQuestion && (
          <div className="space-y-6">
            {/* Arena Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[8px] font-black uppercase bg-primary/10 border-primary/20 text-primary"
                >
                  {currentQuestion.level}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[8px] font-black uppercase bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                >
                  {currentQuestion.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[8px] font-black uppercase border border-border text-muted-foreground"
                >
                  {currentIdx + 1} / {questions.length}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <Progress
                    value={Math.round(
                      ((currentIdx + 1) / questions.length) * 100
                    )}
                    className="h-2 w-32"
                  />
                </div>
                <button
                  onClick={() => setSessionState('config')}
                  className="text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest cursor-pointer border-none bg-transparent"
                >
                  {GRAMMAR_UI_TEXT.practiceHub.stopLearning}
                </button>
              </div>
            </div>

            {/* Arena Main Question Panel */}
            <Card className="bg-card border-border rounded-3xl p-6 shadow-xl space-y-6">
              {/* Question Text */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                  {GRAMMAR_UI_TEXT.practiceHub.labelQuestionText}
                </p>
                <div className="text-lg font-bold text-foreground leading-relaxed">
                  {currentQuestion.type === 'SENTENCE_REBUILDER' ? (
                    <span className="text-muted-foreground text-sm italic font-medium">
                      Sắp xếp các từ xáo trộn thành câu hoàn chỉnh:
                    </span>
                  ) : currentQuestion.type === 'DRAG_DROP' ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 leading-loose">
                      {currentQuestion.text
                        .split(/(\[slot\d+\])/g)
                        .map((part: string, idx: number) => {
                          const match = part.match(/\[slot(\d+)\]/);
                          if (match) {
                            const slotIndex = parseInt(match[1]) - 1;
                            const selectedWord = dragDropAnswers[slotIndex];
                            const isActive = activeSlotIdx === slotIndex;

                            // Style evaluation
                            let slotBorderColor =
                              'border-border bg-muted/40 text-muted-foreground';
                            if (isActive)
                              slotBorderColor =
                                'border-indigo-500/50 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/10';
                            if (isEvaluated) {
                              let parsedAnswers: string[] = [];
                              try {
                                parsedAnswers = JSON.parse(
                                  currentQuestion.correctAnswer
                                );
                              } catch {
                                parsedAnswers = [currentQuestion.correctAnswer];
                              }
                              const isCorrect =
                                selectedWord === parsedAnswers[slotIndex];
                              slotBorderColor = isCorrect
                                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-650 dark:text-emerald-455 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                                : 'border-destructive/40 bg-destructive/5 text-destructive shadow-[0_0_8px_rgba(239,68,68,0.1)]';
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSlotClick(slotIndex)}
                                className={`h-9 min-w-[100px] px-3.5 rounded-lg border text-xs font-black tracking-wide flex items-center justify-between gap-1 transition-all cursor-pointer ${slotBorderColor}`}
                              >
                                <span>
                                  {selectedWord || GRAMMAR_UI_TEXT.practiceHub.slotPrefix.replace('{index}', (slotIndex + 1).toString())}
                                </span>
                                {selectedWord && !isEvaluated && (
                                  <X
                                    onClick={(e) =>
                                      handleClearSlot(slotIndex, e)
                                    }
                                    className="h-3 w-3 hover:text-destructive cursor-pointer"
                                  />
                                )}
                              </button>
                            );
                          }
                          return <span key={idx}>{part}</span>;
                        })}
                    </div>
                  ) : (
                    currentQuestion.text
                  )}
                </div>
              </div>

              {/* Interaction Panel */}
              <div className="pt-2">
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <MultipleChoicePresenter
                    options={currentQuestion.options || []}
                    correctAnswer={currentQuestion.correctAnswer}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    isEvaluated={isEvaluated}
                  />
                )}

                {currentQuestion.type === 'FILL_IN_BLANK' && (
                  <FillInBlankPresenter
                    fillValue={fillValue}
                    setFillValue={setFillValue}
                    isEvaluated={isEvaluated}
                    isCorrectAnswer={isCorrectAnswer}
                  />
                )}

                {currentQuestion.type === 'DRAG_DROP' && (
                  <DragDropPresenter
                    ddWordsPool={ddWordsPool}
                    dragDropAnswers={dragDropAnswers}
                    slotsCount={(currentQuestion.slots || []).length}
                    isEvaluated={isEvaluated}
                    handleWordPillClick={handleWordPillClick}
                  />
                )}

                {currentQuestion.type === 'SENTENCE_REBUILDER' && (
                  <SentenceRebuilderPresenter
                    rebuiltWords={rebuiltWords}
                    rebuilderPool={rebuilderPool}
                    isEvaluated={isEvaluated}
                    isCorrectAnswer={isCorrectAnswer}
                    handleRemoveRebuiltWord={handleRemoveRebuiltWord}
                    handleRebuilderPillClick={handleRebuilderPillClick}
                  />
                )}
              </div>
            </Card>

            {/* Instant Feedback Panel (Resolves A/B/C/D option-level feedback) */}
            {isEvaluated && (
              <Card className="bg-card border-border rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-black uppercase px-2 py-0.5 rounded border',
                      isCorrectAnswer
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    )}
                  >
                    {isCorrectAnswer ? GRAMMAR_UI_TEXT.practiceHub.feedbackCorrect : GRAMMAR_UI_TEXT.practiceHub.feedbackIncorrect}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-bold">
                    •
                  </span>
                  <p className="text-xs text-muted-foreground font-extrabold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                    {GRAMMAR_UI_TEXT.practiceHub.feedbackLabel}
                  </p>
                </div>

                {/* Option-by-Option Breakdown for MULTIPLE_CHOICE */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' &&
                  currentQuestion.optionExplanations && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                        {GRAMMAR_UI_TEXT.practiceHub.feedbackAnalysis}
                      </p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {(currentQuestion.options || []).map(
                          (opt: string, idx: number) => {
                            const optExpl =
                              currentQuestion.optionExplanations?.[opt];
                            const isCorrect =
                              opt === currentQuestion.correctAnswer;
                            const isChosen = selectedOption === opt;

                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
                                    : isChosen
                                    ? 'bg-destructive/5 border-destructive/20'
                                    : 'bg-muted/10 border-border/40 opacity-80'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span
                                    className={`h-5 w-5 text-[9px] font-black rounded flex items-center justify-center border ${
                                      isCorrect
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                        : isChosen
                                        ? 'bg-destructive/10 border-destructive/30 text-destructive'
                                        : 'bg-secondary border-border text-muted-foreground'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      isCorrect
                                        ? 'text-emerald-500'
                                        : isChosen
                                        ? 'text-destructive'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {opt}{' '}
                                    {isCorrect
                                      ? GRAMMAR_UI_TEXT.practiceHub.optionCorrectSuffix
                                      : isChosen
                                      ? GRAMMAR_UI_TEXT.practiceHub.optionChosenSuffix
                                      : ''}
                                  </span>
                                </div>
                                <p className="text-muted-foreground font-medium pl-7">
                                  {optExpl ||
                                    GRAMMAR_UI_TEXT.practiceHub.feedbackUpdate}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                {/* Standard comprehensive explanation */}
                <div className="pt-2 space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                    {GRAMMAR_UI_TEXT.practiceHub.grammarRules}
                  </p>
                  <p className="text-xs text-foreground/80 leading-relaxed font-semibold bg-muted/30 border border-border p-4 rounded-2xl shadow-inner">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </Card>
            )}

            {/* Arena Footer Actions */}
            <div className="flex justify-end pt-3">
              {!isEvaluated ? (
                <Button
                  onClick={handleCheckAnswer}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold px-8 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  {GRAMMAR_UI_TEXT.practiceHub.btnCheckAnswer}
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold px-8 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>
                    {currentIdx + 1 < questions.length
                      ? GRAMMAR_UI_TEXT.practiceHub.btnNextQuestion
                      : GRAMMAR_UI_TEXT.practiceHub.btnFinishSession}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* State 3: Congratulation Screen */}
        {sessionState === 'results' && (
          <Card className="bg-card border-border rounded-3xl p-8 shadow-xl text-center space-y-6 max-w-md mx-auto">
            {/* Medals/Icons */}
            <div className="mx-auto h-20 w-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center text-4xl shadow-inner relative animate-bounce">
              <Award className="h-10 w-10 text-amber-500 mx-auto" />
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border border-background flex items-center justify-center text-[10px] font-black text-white">
                ✓
              </div>
            </div>

            {/* Status titles */}
            <div className="space-y-1">
              <Badge
                variant="outline"
                className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              >
                {GRAMMAR_UI_TEXT.practiceHub.resultsBadge}
              </Badge>
              <h2 className="text-2xl font-black text-foreground pt-1">
                {GRAMMAR_UI_TEXT.practiceHub.resultsTitle}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {GRAMMAR_UI_TEXT.practiceHub.resultsDesc}
              </p>
            </div>

            {/* Score box */}
            <div className="bg-muted/40 border border-border rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div className="border-r border-border text-center">
                <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.practiceHub.resultsCorrect}
                </p>
                <div className="text-2xl font-black text-emerald-500 mt-1">
                  {correctCount}{' '}
                  <span className="text-xs text-muted-foreground font-medium">
                    / {questions.length}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.practiceHub.resultsXP}
                </p>
                <div className="text-2xl font-black text-primary mt-1 flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-orange-500 fill-orange-500/10 animate-pulse" />
                  +{earnedXP}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={() => setSessionState('config')}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs uppercase py-3.5 rounded-xl cursor-pointer"
              >
                {GRAMMAR_UI_TEXT.practiceHub.btnPracticeMore}
              </Button>
              <Button
                onClick={onBackToRoadmap}
                variant="outline"
                className="border-slate-800 text-slate-355 hover:bg-slate-900 font-black text-xs uppercase py-3.5 rounded-xl cursor-pointer"
              >
                {GRAMMAR_UI_TEXT.practiceHub.btnBackToRoadmap}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
