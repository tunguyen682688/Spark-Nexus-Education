import type { FC } from 'react';
import type { ExamQuestion } from '../types';
import { Input } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface QuestionEditorProps {
  idx: number;
  question: Partial<ExamQuestion>;
  handleUpdateQuestion: (idx: number, fields: Partial<ExamQuestion>) => void;
}

interface MultipleChoiceProps extends QuestionEditorProps {
  handleUpdateOption: (qIdx: number, optIdx: number, val: string) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.examQuestionEditor;

export const MultipleChoiceQuestionEditor: FC<MultipleChoiceProps> = ({
  idx,
  question,
  handleUpdateQuestion,
  handleUpdateOption,
}) => {
  return (
    <>
      <div className="space-y-1 md:col-span-3">
        <label className="text-[9px] font-black text-muted-foreground uppercase block">
          {T.mcTitle}
        </label>
        <Input
          type="text"
          value={question.text || ''}
          onChange={(e) => handleUpdateQuestion(idx, { text: e.target.value })}
          placeholder={T.mcPlaceholder}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
          required
        />
      </div>

      {question.options && (
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/10 border border-border p-4 rounded-xl">
          <span className="text-[9px] font-black text-muted-foreground block uppercase md:col-span-2">
            {T.optionsTitle}
          </span>
          {question.options.map((opt, oIdx) => (
            <div key={oIdx} className="space-y-1">
              <label className="text-[8px] font-bold text-muted-foreground uppercase block">
                {T.optionLabel.replace(
                  '{label}',
                  String.fromCharCode(65 + oIdx)
                )}
              </label>
              <Input
                type="text"
                value={opt}
                onChange={(e) => handleUpdateOption(idx, oIdx, e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                required
              />
            </div>
          ))}
          <div className="space-y-1 md:col-span-2 pt-2">
            <label className="text-[8px] font-bold uppercase block text-emerald-500">
              {T.mcAnswerLabel}
            </label>
            <Input
              type="text"
              value={question.answer || ''}
              onChange={(e) =>
                handleUpdateQuestion(idx, {
                  answer: e.target.value,
                })
              }
              placeholder={T.mcAnswerPlaceholder}
              className="w-full bg-background border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500/50 placeholder:text-muted-foreground/50"
              required
            />
          </div>
        </div>
      )}
    </>
  );
};

export const SentenceBuilderQuestionEditor: FC<QuestionEditorProps> = ({
  idx,
  question,
  handleUpdateQuestion,
}) => {
  return (
    <>
      <div className="space-y-1 md:col-span-3">
        <label className="text-[9px] font-black text-muted-foreground uppercase block">
          {T.sbTitle}
        </label>
        <Input
          type="text"
          value={question.text || ''}
          onChange={(e) => handleUpdateQuestion(idx, { text: e.target.value })}
          placeholder={T.sbPlaceholder}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
          required
        />
      </div>

      <div className="space-y-1 md:col-span-3 bg-muted/10 border border-border p-4 rounded-xl">
        <label className="text-[8px] font-black text-muted-foreground uppercase block">
          {T.sbWordsLabel}
        </label>
        <Input
          type="text"
          value={question.words?.join(', ') || ''}
          onChange={(e) => {
            const val = e.target.value;
            const splitWords = val.split(',').map((w) => w.trim());
            handleUpdateQuestion(idx, { words: splitWords });
          }}
          placeholder={T.sbWordsPlaceholder}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
          required
        />
        <div className="space-y-1 pt-3">
          <label className="text-[8px] font-bold uppercase block text-emerald-500">
            {T.sbAnswerLabel}
          </label>
          <Input
            type="text"
            value={question.answer || ''}
            onChange={(e) =>
              handleUpdateQuestion(idx, {
                answer: e.target.value,
              })
            }
            placeholder={T.sbAnswerPlaceholder}
            className="w-full bg-background border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500/50 placeholder:text-muted-foreground/50"
            required
          />
        </div>
      </div>
    </>
  );
};

export const ErrorSpotlightQuestionEditor: FC<QuestionEditorProps> = ({
  idx,
  question,
  handleUpdateQuestion,
}) => {
  return (
    <>
      <div className="space-y-1 md:col-span-3">
        <label className="text-[9px] font-black text-muted-foreground uppercase block">
          {T.esTitle}
        </label>
        <Input
          type="text"
          value={question.text || ''}
          onChange={(e) => handleUpdateQuestion(idx, { text: e.target.value })}
          placeholder={T.esPlaceholder}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
          required
        />
      </div>

      <div className="md:col-span-3 bg-muted/10 border border-border p-4 rounded-xl space-y-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-muted-foreground uppercase block">
            {T.esSentenceLabel}
          </label>
          <Input
            type="text"
            value={question.sentence || ''}
            onChange={(e) =>
              handleUpdateQuestion(idx, {
                sentence: e.target.value,
              })
            }
            placeholder={T.esSentencePlaceholder}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-rose-500 uppercase block">
              {T.esIncorrectLabel}
            </label>
            <Input
              type="text"
              value={question.incorrectWord || ''}
              onChange={(e) =>
                handleUpdateQuestion(idx, {
                  incorrectWord: e.target.value,
                })
              }
              placeholder={T.esIncorrectPlaceholder}
              className="w-full bg-background border border-rose-500/25 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-rose-500/50 placeholder:text-muted-foreground/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-emerald-500 uppercase block">
              {T.esCorrectLabel}
            </label>
            <Input
              type="text"
              value={question.correctWord || ''}
              onChange={(e) => {
                const val = e.target.value;
                handleUpdateQuestion(idx, {
                  correctWord: val,
                  answer: val,
                });
              }}
              placeholder={T.esCorrectPlaceholder}
              className="w-full bg-background border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500/50 placeholder:text-muted-foreground/50"
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};
