import { FC, useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { GRAMMAR_UI_TEXT } from '../constants';

interface QuizBlockProps {
  question: string;
  options: string[];
  answer: string;
  isEditable?: boolean;
  onChangeQuestion?: (question: string) => void;
  onChangeOptions?: (options: string[]) => void;
  onChangeAnswer?: (answer: string) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.quizBlock;

export const QuizBlock: FC<QuizBlockProps> = ({
  question = '',
  options = [],
  answer = '',
  isEditable = false,
  onChangeQuestion,
  onChangeOptions,
  onChangeAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    const correct = selectedOption === answer;
    setIsCorrect(correct);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const handleOptionChange = (idx: number, val: string) => {
    if (!isEditable || !onChangeOptions) return;
    const copy = [...options];
    copy[idx] = val;
    onChangeOptions(copy);
  };

  const handleAddOption = () => {
    if (!isEditable || !onChangeOptions) return;
    onChangeOptions([...options, '']);
  };

  const handleDeleteOption = (idx: number) => {
    if (!isEditable || !onChangeOptions) return;
    const copy = options.filter((_, i) => i !== idx);
    onChangeOptions(copy);
  };

  if (isEditable) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
          <HelpCircle className="h-4 w-4 text-primary" />
          {T.editorTitle}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground">{T.questionLabel}</label>
          <textarea
            value={question}
            onChange={(e) => onChangeQuestion && onChangeQuestion(e.target.value)}
            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all resize-none placeholder:text-muted-foreground/50 shadow-inner"
            rows={3}
            placeholder={T.placeholderQuestion}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground">{T.optionsLabel}</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="flex-1 bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50 shadow-inner"
                placeholder={T.placeholderOption.replace('{index}', String(idx + 1))}
              />
              <button
                type="button"
                onClick={() => handleDeleteOption(idx)}
                className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs transition-colors border-none cursor-pointer"
                title={T.titleDeleteOption}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer"
          >
            {T.btnAddOption}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground">{T.answerLabel}</label>
          <select
            value={answer}
            onChange={(e) => onChangeAnswer && onChangeAnswer(e.target.value)}
            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all cursor-pointer"
          >
            <option value="">{T.placeholderAnswer}</option>
            {options.filter(o => o.trim() !== '').map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
          <HelpCircle className="h-4 w-4 text-primary" />
          Knowledge Check
        </div>
        <span className="text-[9px] font-extrabold bg-muted text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
          PRACTICE QUIZ
        </span>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground whitespace-pre-wrap leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          let containerClass =
            'border-border bg-card hover:bg-muted/30 hover:border-muted-foreground/30 text-foreground';

          if (isSelected) {
            containerClass =
              'border-primary/80 bg-primary/5 text-primary shadow-md shadow-primary/5';
          }

          if (submitted) {
            if (opt === answer) {
              containerClass =
                'border-emerald-500 bg-emerald-500/5 text-emerald-550 dark:text-emerald-400 shadow-md shadow-emerald-500/5';
            } else if (isSelected && opt !== answer) {
              containerClass =
                'border-destructive bg-destructive/5 text-destructive shadow-md shadow-destructive/5';
            }
          }

          return (
            <div
              key={idx}
              onClick={() => !submitted && setSelectedOption(opt)}
              className={`flex items-center justify-between border rounded-2xl px-5 py-4 text-xs font-bold transition-all cursor-pointer ${containerClass}`}
            >
              <div className="flex items-center gap-3">
                {/* Custom radio button icon */}
                <div
                  className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  }`}
                >
                  {isSelected && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span>{opt}</span>
              </div>

              {/* Status Visual Mark */}
              {submitted && opt === answer && (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              )}
              {submitted && isSelected && opt !== answer && (
                <XCircle className="h-4.5 w-4.5 text-destructive" />
              )}
              {!submitted && isSelected && (
                <CheckCircle2 className="h-4.5 w-4.5 text-primary animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          {submitted && isCorrect !== null && (
            <div className="flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">
                    {T.feedbackCorrect}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive">
                    {T.feedbackIncorrect}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {submitted && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors text-xs font-bold bg-transparent cursor-pointer"
            >
              {T.btnReset}
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedOption || submitted}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all border-none ${
              !selectedOption || submitted
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/15 active:scale-95 cursor-pointer'
            }`}
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
};
export default QuizBlock;
