import { Check, Plus } from 'lucide-react';
import { AnswerOptionRow } from '../exam-builder/AnswerOptionRow';
import type { AnswerOptionItem } from '../../../hooks/container-logic/exam/use-question-builder-container-logic';

interface ChoiceAnswerEditorProps {
  options: AnswerOptionItem[];
  requiresCorrectAnswer?: boolean;
  minOptions?: number;
  maxOptions?: number;
  onSelectCorrect: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onAddOption: () => void;
  onAddOtherOption: () => void;
}

export function ChoiceAnswerEditor({
  options,
  requiresCorrectAnswer = true,
  minOptions = 2,
  maxOptions = 6,
  onSelectCorrect,
  onUpdateText,
  onRemove,
  onAddOption,
  onAddOtherOption,
}: ChoiceAnswerEditorProps) {
  const canAddMore = options.length < maxOptions;

  return (
    <>
      <div className="space-y-2.5">
        {options.map((opt) => (
          <AnswerOptionRow
            key={opt.id}
            option={opt}
            onSelectCorrect={onSelectCorrect}
            onUpdateText={onUpdateText}
            onRemove={onRemove}
          />
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-xs font-medium">No options yet. Click "Add Option" below.</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        {canAddMore && (
          <button
            onClick={onAddOption}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Option</span>
          </button>
        )}

        {canAddMore && (
          <button
            onClick={onAddOtherOption}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add "Other" Option</span>
          </button>
        )}
      </div>

      {requiresCorrectAnswer && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold pt-1">
          <Check className="w-3.5 h-3.5" />
          <span>Select one correct answer above</span>
        </div>
      )}
    </>
  );
}
