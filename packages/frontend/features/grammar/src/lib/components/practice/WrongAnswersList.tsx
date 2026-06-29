import { FC } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../../constants';
import type { ExamQuestion } from '../../types';

interface WrongAnswersListProps {
  wrongQuestionIds: string[];
  questions: ExamQuestion[];
  savedTrapIds: string[];
  onSaveTrap: (q: ExamQuestion) => void;
}

export const WrongAnswersList: FC<WrongAnswersListProps> = ({
  wrongQuestionIds,
  questions,
  savedTrapIds,
  onSaveTrap,
}) => {
  if (wrongQuestionIds.length === 0) return null;

  return (
    <div className="mt-8 space-y-4 text-left w-full animate-fadeIn">
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">
        {GRAMMAR_UI_TEXT.assessmentQuiz.detailedMistakes.replace(
          '{count}',
          wrongQuestionIds.length.toString()
        )}
      </h3>
      <div className="space-y-4">
        {wrongQuestionIds.map((qId) => {
          const q = questions.find((x) => x.id === qId);
          if (!q) return null;
          return (
            <div
              key={q.id}
              className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between items-start gap-4">
                <p className="text-sm font-bold text-foreground leading-relaxed">
                  {q.type === 'ERROR_SPOTLIGHT' ? q.sentence : q.text}
                </p>
                <Button
                  onClick={() => onSaveTrap(q)}
                  disabled={savedTrapIds.includes(q.id)}
                  className="bg-muted border border-border hover:border-muted-foreground/30 text-[9px] font-black text-rose-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer transition active:scale-95 flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 disabled:text-muted-foreground disabled:border-border disabled:cursor-default"
                >
                  <Bookmark className="h-3 w-3" />
                  {savedTrapIds.includes(q.id)
                    ? GRAMMAR_UI_TEXT.assessmentQuiz.btnSaved
                    : GRAMMAR_UI_TEXT.assessmentQuiz.btnSave}
                </Button>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {GRAMMAR_UI_TEXT.assessmentQuiz.correctAnswerLabel}{' '}
                <span className="text-emerald-500 dark:text-emerald-300">{q.answer}</span>
              </p>
              <div className="bg-primary/5 p-3 rounded-lg mt-2 border border-primary/20">
                <span className="text-[10px] font-black text-primary uppercase block mb-1">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.explanationLabel}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
