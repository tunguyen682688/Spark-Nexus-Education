import React from 'react';
import { X } from 'lucide-react';

interface SentenceRebuilderPresenterProps {
  rebuiltWords: string[];
  rebuilderPool: string[];
  isEvaluated: boolean;
  isCorrectAnswer: boolean;
  handleRemoveRebuiltWord: (word: string) => void;
  handleRebuilderPillClick: (word: string) => void;
}

export const SentenceRebuilderPresenter: React.FC<SentenceRebuilderPresenterProps> = ({
  rebuiltWords,
  rebuilderPool,
  isEvaluated,
  isCorrectAnswer,
  handleRemoveRebuiltWord,
  handleRebuilderPillClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Answer Tray */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
          KHAY CÂU TRẢ LỜI
        </p>
        <div
          className={`min-h-[60px] w-full bg-muted/20 border border-dashed rounded-2xl p-4 flex flex-wrap gap-2 transition-all ${
            isEvaluated
              ? isCorrectAnswer
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-destructive/30 bg-destructive/5'
              : 'border-border'
          }`}
        >
          {rebuiltWords.length === 0 ? (
            <span className="text-xs text-muted-foreground italic font-medium flex items-center">
              Click chọn các viên thuốc từ bên dưới để ghép câu...
            </span>
          ) : (
            rebuiltWords.map((word, idx) => (
              <button
                key={idx}
                disabled={isEvaluated}
                onClick={() => handleRemoveRebuiltWord(word)}
                className={`bg-primary/10 border font-extrabold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1 active:scale-[0.95] transition-all ${
                  isEvaluated
                    ? isCorrectAnswer
                      ? 'border-emerald-500/40 text-emerald-655 dark:text-emerald-450'
                      : 'border-destructive/40 text-destructive'
                    : 'border-primary/30 text-primary'
                }`}
              >
                <span>{word}</span>
                {!isEvaluated && (
                  <X className="h-3 w-3 text-primary hover:text-destructive" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Word Pool */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
          DANH SÁCH TỪ VỰNG
        </p>
        <div className="flex flex-wrap gap-2">
          {rebuilderPool.length === 0 && !isEvaluated ? (
            <span className="text-xs text-muted-foreground italic font-medium">
              Bấm "Kiểm tra" để so khớp câu hoàn chỉnh!
            </span>
          ) : (
            rebuilderPool.map((word, idx) => (
              <button
                key={idx}
                disabled={isEvaluated}
                onClick={() => handleRebuilderPillClick(word)}
                className="bg-accent/10 hover:bg-secondary border border-border text-foreground font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow-md"
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SentenceRebuilderPresenter;
