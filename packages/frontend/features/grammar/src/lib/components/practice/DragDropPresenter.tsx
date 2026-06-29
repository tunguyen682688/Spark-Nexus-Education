import React from 'react';
import { GRAMMAR_UI_TEXT } from '../../constants';

const T = GRAMMAR_UI_TEXT.practicePresenter;

interface DragDropPresenterProps {
  ddWordsPool: string[];
  dragDropAnswers: Record<string, string>;
  slotsCount: number;
  isEvaluated: boolean;
  handleWordPillClick: (word: string) => void;
}

export const DragDropPresenter: React.FC<DragDropPresenterProps> = ({
  ddWordsPool,
  dragDropAnswers,
  slotsCount,
  isEvaluated,
  handleWordPillClick,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
        {isEvaluated
          ? T.evaluatedLabel
          : T.dragDropInstruction}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {ddWordsPool.length === 0 &&
        !isEvaluated &&
        Object.keys(dragDropAnswers).length === slotsCount ? (
          <span className="text-xs text-muted-foreground italic font-medium">
            {T.allPlacedMessage}
          </span>
        ) : (
          ddWordsPool.map((word, idx) => (
            <button
              key={idx}
              disabled={isEvaluated}
              onClick={() => handleWordPillClick(word)}
              className="bg-accent/10 hover:bg-secondary border border-border text-foreground font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow-md"
            >
              {word}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DragDropPresenter;
