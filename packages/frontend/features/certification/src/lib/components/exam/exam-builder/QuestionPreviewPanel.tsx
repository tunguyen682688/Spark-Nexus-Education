import {
  Monitor,
  Smartphone,
} from 'lucide-react';
import {
  Card,
} from '@spark-nest-ed/frontend-shared-components';
import { PreviewAdMock } from './PreviewAdMock';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface QuestionPreviewPanelProps {
  questionText: string;
  questionNumber: number;
  options: Array<{ id: string; label: string; text: string; isCorrect: boolean }>;
  previewViewport: 'desktop' | 'mobile';
  setPreviewViewport: (v: 'desktop' | 'mobile') => void;
}

const questionBuilderText = CERTIFICATION_UI_TEXT.questionBuilder;

export const QuestionPreviewPanel = ({
  questionText,
  questionNumber,
  options,
  previewViewport,
  setPreviewViewport,
}: QuestionPreviewPanelProps) => {
  return (
    <Card className="border-border shadow-sm bg-card p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          {questionBuilderText.previewSection.title}
        </h3>

        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
          <button
            onClick={() => setPreviewViewport('desktop')}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              previewViewport === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewViewport('mobile')}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              previewViewport === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PreviewAdMock
        questionText={questionText}
        questionNumber={questionNumber}
        options={options}
        viewport={previewViewport}
      />
    </Card>
  );
};
