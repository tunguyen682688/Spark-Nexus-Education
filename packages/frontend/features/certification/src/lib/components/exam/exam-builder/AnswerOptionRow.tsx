import { Check, MoreVertical, Image as ImageIcon, FileCode } from 'lucide-react';
import type { AnswerOptionItem } from '../../../hooks/container-logic/exam/use-question-builder-container-logic';

interface AnswerOptionRowProps {
  option: AnswerOptionItem;
  onSelectCorrect: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

export function AnswerOptionRow({ option, onSelectCorrect, onUpdateText, onRemove }: AnswerOptionRowProps) {
  return (
    <div
      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
        option.isCorrect
          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
            option.isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
          }`}
        >
          {option.label}
        </div>

        <input
          value={option.text}
          onChange={(e) => onUpdateText(option.id, e.target.value)}
          className="w-full text-xs font-semibold text-foreground bg-transparent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onSelectCorrect(option.id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
            option.isCorrect
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-muted-foreground/40 hover:border-emerald-500'
          }`}
        >
          {option.isCorrect && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <button className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
          <FileCode className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove(option.id)}
          className="p-1 text-muted-foreground hover:text-rose-600 cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
