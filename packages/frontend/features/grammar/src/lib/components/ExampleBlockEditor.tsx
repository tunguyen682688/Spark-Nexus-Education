import type { FC } from 'react';
import ExampleBlock from './ExampleBlock';

interface ExampleItem {
  text: string;
  explanation: string;
}

interface ExampleBlockEditorProps {
  items: ExampleItem[];
  onChange: (items: ExampleItem[]) => void;
}

export const ExampleBlockEditor: FC<ExampleBlockEditorProps> = ({
  items = [],
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <ExampleBlock
        items={items}
        isEditable={true}
        onChangeItems={onChange}
      />
    </div>
  );
};
export default ExampleBlockEditor;
