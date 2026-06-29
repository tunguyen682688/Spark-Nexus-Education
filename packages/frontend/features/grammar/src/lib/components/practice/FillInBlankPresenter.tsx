import React from 'react';
import { GRAMMAR_UI_TEXT } from '../../constants';

const T = GRAMMAR_UI_TEXT.practicePresenter;

interface FillInBlankPresenterProps {
  fillValue: string;
  setFillValue: (val: string) => void;
  isEvaluated: boolean;
  isCorrectAnswer: boolean;
}

export const FillInBlankPresenter: React.FC<FillInBlankPresenterProps> = ({
  fillValue,
  setFillValue,
  isEvaluated,
  isCorrectAnswer,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
        {T.fillInLabel}
      </p>
      <input
        type="text"
        disabled={isEvaluated}
        value={fillValue}
        onChange={(e) => setFillValue(e.target.value)}
        placeholder={T.fillInPlaceholder}
        className={`w-full max-w-md bg-muted/30 border rounded-xl py-3 px-4 text-sm focus:outline-none transition-all ${
          isEvaluated
            ? isCorrectAnswer
              ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-650 dark:text-emerald-450'
              : 'border-destructive/40 bg-destructive/5 text-destructive'
            : 'border-border focus:border-indigo-500/50 text-foreground'
        }`}
      />
    </div>
  );
};

export default FillInBlankPresenter;
