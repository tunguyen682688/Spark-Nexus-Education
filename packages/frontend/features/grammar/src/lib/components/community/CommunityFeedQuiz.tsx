import { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../../constants';
import type { GrammarBlock } from '../../types';

const T = GRAMMAR_UI_TEXT.communityFeedQuiz;

interface CommunityFeedQuizProps {
  postId: string;
  block: GrammarBlock;
}

interface FeedQuizState {
  selectedAnswer?: string;
  rebuiltWords?: string[];
  clickedWord?: string;
  correctedInput?: string;
  isCorrect?: boolean | null;
  isEvaluated?: boolean;
}

export function CommunityFeedQuiz({ postId, block }: CommunityFeedQuizProps) {
  const [quizState, setQuizState] = useState<FeedQuizState>({});

  const qType = block.quizType || 'MULTIPLE_CHOICE';
  const qQuestion = block.question || T.defaultQuestion;
  const qOptions = block.options || [];
  const qAnswer = block.answer || '';
  const qWords = block.words || [];
  const qSentence = block.sentence || '';
  const qIncorrect = block.incorrectWord || '';
  const qCorrect = block.correctWord || '';
  const qExplanation = block.explanation || '';

  const isEvaluated = !!quizState.isEvaluated;
  const isCorrect = quizState.isCorrect;

  const handleAnswerMultipleChoice = (selectedOption: string) => {
    const isAnsCorrect = selectedOption === qAnswer;
    setQuizState({
      selectedAnswer: selectedOption,
      isCorrect: isAnsCorrect,
      isEvaluated: true,
    });
    if (isAnsCorrect) {
      toast.success(T.toastCorrect);
    } else {
      toast.error(T.toastIncorrectMc);
    }
  };

  const handleWordClickFeed = (word: string) => {
    setQuizState((prev) => ({
      ...prev,
      rebuiltWords: [...(prev.rebuiltWords || []), word],
    }));
  };

  const handleRemoveWordFeed = (idx: number) => {
    setQuizState((prev) => ({
      ...prev,
      rebuiltWords: (prev.rebuiltWords || []).filter((_, i) => i !== idx),
    }));
  };

  const handleCheckSentenceFeed = () => {
    const assembled = (quizState.rebuiltWords || []).join(' ');
    const isAnsCorrect = assembled.toLowerCase().trim() === qAnswer.toLowerCase().trim();
    setQuizState((prev) => ({
      ...prev,
      isCorrect: isAnsCorrect,
      isEvaluated: true,
    }));
    if (isAnsCorrect) {
      toast.success(T.toastCorrect);
    } else {
      toast.error(T.toastIncorrectSentence);
    }
  };

  const handleWordClickSpotlightFeed = (word: string) => {
    const cleanWord = word.toLowerCase().replace(new RegExp('[.,/#!$%^&*;:{}=_`~()-]', 'g'), '');
    const isAnsCorrect = cleanWord === qIncorrect.toLowerCase();
    setQuizState((prev) => ({
      ...prev,
      clickedWord: word,
      isCorrect: isAnsCorrect ? null : false,
      isEvaluated: isAnsCorrect ? false : true,
    }));
    if (!isAnsCorrect) {
      toast.error(T.toastIncorrectWord);
    } else {
      toast.success(T.toastCorrectWord);
    }
  };

  const handleCheckCorrectionFeed = () => {
    const input = (quizState.correctedInput || '').trim().toLowerCase();
    const isAnsCorrect = input === qCorrect.toLowerCase();
    setQuizState((prev) => ({
      ...prev,
      isCorrect: isAnsCorrect,
      isEvaluated: true,
    }));
    if (isAnsCorrect) {
      toast.success(T.toastCorrectionSuccess);
    } else {
      toast.error(T.toastCorrectionFail);
    }
  };

  const handleResetFeedQuiz = () => {
    setQuizState({});
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-inner relative"
    >
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Sparkles className="h-4 w-4 fill-primary/20" />
          {T.title}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          {qType === 'MULTIPLE_CHOICE'
            ? T.typeMultipleChoice
            : qType === 'SENTENCE_BUILDER'
            ? T.typeSentenceBuilder
            : T.typeErrorSpotlight}
        </span>
      </div>

      <p className="text-xs font-semibold text-foreground bg-muted/30 px-3.5 py-2.5 rounded-xl border border-border/60">
        {qQuestion}
      </p>

      {/* 1. Multiple Choice */}
      {qType === 'MULTIPLE_CHOICE' && (
        <div className="space-y-2">
          {qOptions.map((option: string, idx: number) => {
            const isOptionSelected = quizState.selectedAnswer === option;
            const isOptionCorrect = option === qAnswer;

            let btnStyle =
              'bg-muted/40 hover:bg-muted/80 border-border hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground';
            let iconElement = null;

            if (isEvaluated) {
              if (isOptionSelected) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300 shadow-md';
                  iconElement = <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
                } else {
                  btnStyle =
                    'bg-destructive/10 border-destructive text-destructive shadow-md';
                  iconElement = <XCircle className="h-4 w-4 text-destructive shrink-0" />;
                }
              } else if (isOptionCorrect) {
                btnStyle = 'bg-emerald-500/5 border-emerald-600/50 text-emerald-600 dark:text-emerald-300';
                iconElement = <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
              } else {
                btnStyle = 'bg-muted/10 border-border text-muted-foreground opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isEvaluated}
                onClick={() => handleAnswerMultipleChoice(option)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all duration-300 flex items-center justify-between gap-3 bg-transparent cursor-pointer ${btnStyle}`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isEvaluated
                        ? isOptionSelected
                          ? isCorrect
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                            : 'bg-destructive/20 text-destructive'
                          : isOptionCorrect
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : 'bg-background text-muted-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </span>
                {iconElement}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Sentence Builder */}
      {qType === 'SENTENCE_BUILDER' && (
        <div className="space-y-3">
          <div className="min-h-12 bg-muted/30 rounded-xl border border-border p-3 flex flex-wrap gap-1.5 items-center">
            {!quizState.rebuiltWords || quizState.rebuiltWords.length === 0 ? (
              <span className="text-[10px] text-muted-foreground italic">
                {T.placeholderSentenceBuilder}
              </span>
            ) : (
              quizState.rebuiltWords.map((word, idx) => (
                <button
                  key={idx}
                  disabled={isEvaluated}
                  onClick={() => handleRemoveWordFeed(idx)}
                  className="px-2.5 py-1 text-xs font-semibold bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition cursor-pointer"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {!isEvaluated && qWords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-1 bg-muted/20 rounded-xl border border-border">
              {qWords.map((word: string, idx: number) => {
                const countInRebuilt =
                  quizState.rebuiltWords?.filter((w) => w === word).length || 0;
                const countInOriginal = qWords.filter((w: string) => w === word).length;
                const isUsed = countInRebuilt >= countInOriginal;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleWordClickFeed(word)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      isUsed
                        ? 'bg-muted/10 border-border text-muted-foreground/30 cursor-not-allowed opacity-30'
                        : 'bg-muted hover:bg-muted/80 border-border text-foreground cursor-pointer'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {isEvaluated ? (
              <button
                type="button"
                onClick={handleResetFeedQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-muted border border-border hover:bg-muted/85 text-foreground text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {T.btnReplay}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleResetFeedQuiz}
                  className="px-3 py-1.5 rounded-xl bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold transition cursor-pointer"
                >
                  {T.btnClear}
                </button>
                <button
                  type="button"
                  disabled={!quizState.rebuiltWords || quizState.rebuiltWords.length === 0}
                  onClick={handleCheckSentenceFeed}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold disabled:opacity-40 transition shadow-md shadow-primary/10 cursor-pointer"
                >
                  {T.btnCheck}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Error Spotlight */}
      {qType === 'ERROR_SPOTLIGHT' && (
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 border border-border rounded-xl leading-loose flex flex-wrap gap-1.5">
            {qSentence?.split(' ').map((word: string, idx: number) => {
              const isWordClicked = quizState.clickedWord === word;

              let style = 'bg-muted/40 hover:bg-muted/80 border-border text-foreground';
              if (isWordClicked) {
                if (isCorrect === true) {
                  style = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300';
                } else if (isCorrect === false) {
                  style = 'bg-destructive/10 border-destructive text-destructive';
                } else {
                  style = 'bg-primary/10 border-primary text-primary shadow-md';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isEvaluated}
                  onClick={() => handleWordClickSpotlightFeed(word)}
                  className={`px-2 py-0.5 rounded-md border text-xs font-medium transition duration-200 cursor-pointer ${style}`}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {quizState.clickedWord &&
            quizState.clickedWord.toLowerCase().replace(new RegExp('[.,/#!$%^&*;:{}=_`~()-]', 'g'), '') ===
              qIncorrect.toLowerCase() &&
            !isEvaluated && (
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-2 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold text-primary block">
                  {T.labelFoundWord}{' '}
                  <span className="underline font-extrabold">
                    "{quizState.clickedWord}"
                  </span>
                  {T.labelFixPrompt}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={T.placeholderFix}
                    value={quizState.correctedInput || ''}
                    onChange={(e) =>
                      setQuizState((prev) => ({ ...prev, correctedInput: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckCorrectionFeed()}
                    className="flex-1 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-1.5 text-xs text-foreground transition"
                  />
                  <button
                    type="button"
                    onClick={handleCheckCorrectionFeed}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    {T.btnConfirm}
                  </button>
                </div>
              </div>
            )}

          {isEvaluated && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetFeedQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {T.btnReplay}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phản hồi kết quả ĐÚNG / SAI chung */}
      {isEvaluated && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${
            isCorrect
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-350'
              : 'bg-destructive/10 border-destructive text-destructive'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="text-xs font-bold block">
              {isCorrect
                ? T.feedbackCorrect
                : T.feedbackIncorrect}
            </span>

            {qType !== 'MULTIPLE_CHOICE' && (
              <p className="text-[10px] text-muted-foreground">
                {T.correctAnswerLabel}{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{qAnswer || qCorrect}</span>
              </p>
            )}

            {/* pedagogical explanation */}
            <div className="pt-2 border-t border-border/60 mt-2 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-500 fill-amber-500/20" /> {T.explanationLabel}
              </span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{qExplanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
