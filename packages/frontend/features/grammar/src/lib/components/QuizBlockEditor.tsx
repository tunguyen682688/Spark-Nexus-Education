import type { FC } from 'react';
import QuizBlock from './QuizBlock';

interface QuizBlockEditorProps {
  question: string;
  options: string[];
  answer: string;
  onChange: (fields: { question?: string; options?: string[]; answer?: string }) => void;
}

export const QuizBlockEditor: FC<QuizBlockEditorProps> = ({
  question = '',
  options = [],
  answer = '',
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <QuizBlock
        question={question}
        options={options}
        answer={answer}
        isEditable={true}
        onChangeQuestion={(q) => onChange({ question: q })}
        onChangeOptions={(opts) => onChange({ options: opts })}
        onChangeAnswer={(ans) => onChange({ answer: ans })}
      />
    </div>
  );
};
export default QuizBlockEditor;
