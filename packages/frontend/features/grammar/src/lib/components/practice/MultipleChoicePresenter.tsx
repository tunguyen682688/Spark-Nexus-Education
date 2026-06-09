import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MultipleChoicePresenterProps {
  options: string[];
  correctAnswer: string;
  selectedOption: string | null;
  setSelectedOption: (opt: string) => void;
  isEvaluated: boolean;
}

export const MultipleChoicePresenter: React.FC<MultipleChoicePresenterProps> = ({
  options,
  correctAnswer,
  selectedOption,
  setSelectedOption,
  isEvaluated,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {(options || []).map((opt: string, idx: number) => {
        const isSelected = selectedOption === opt;

        // Style configurations
        let optionStyle =
          'border-border bg-muted/20 text-muted-foreground hover:border-border/80 hover:bg-muted/30';

        if (isSelected) {
          optionStyle = 'border-primary/50 bg-primary/5 text-primary';
        }

        if (isEvaluated) {
          const isCorrect = opt === correctAnswer;
          if (isCorrect) {
            optionStyle =
              'border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20';
          } else if (isSelected) {
            optionStyle =
              'border-destructive/50 bg-destructive/5 text-destructive shadow-[0_0_12px_rgba(239,68,68,0.15)] ring-1 ring-destructive/20';
          } else {
            optionStyle =
              'border-border bg-muted/10 text-muted-foreground/60 opacity-60';
          }
        }

        return (
          <button
            key={idx}
            disabled={isEvaluated}
            onClick={() => setSelectedOption(opt)}
            className={`w-full py-3.5 px-5 rounded-2xl text-left text-xs sm:text-sm font-bold flex items-center justify-between border transition-all cursor-pointer active:scale-[0.99] ${optionStyle}`}
          >
            <div className="flex items-center gap-3.5">
              <span
                className={`h-6 w-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center border ${
                  isEvaluated && opt === correctAnswer
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : isEvaluated && isSelected
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : isSelected
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-secondary border-border text-muted-foreground'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </div>

            {isEvaluated && opt === correctAnswer && (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            )}
            {isEvaluated && isSelected && opt !== correctAnswer && (
              <XCircle className="h-4.5 w-4.5 text-destructive" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoicePresenter;
