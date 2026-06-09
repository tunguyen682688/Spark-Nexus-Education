import type { FC } from 'react';
import FormulaBuilder from './FormulaBuilder';

interface FormulaBlockEditorProps {
  elements: string[];
  note?: string;
  onChange: (fields: { elements?: string[]; note?: string }) => void;
}

export const FormulaBlockEditor: FC<FormulaBlockEditorProps> = ({
  elements = [],
  note = '',
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <FormulaBuilder
        elements={elements}
        note={note}
        isEditable={true}
        onChangeElements={(el) => onChange({ elements: el })}
        onChangeNote={(n) => onChange({ note: n })}
      />
    </div>
  );
};
export default FormulaBlockEditor;
