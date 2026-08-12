import { ChevronDown } from 'lucide-react';
import type { QuestionTypeCategory, QuestionTypeConfig } from '../../../constants/question-type-config.constants';
import { CATEGORY_LABELS } from '../../../constants/question-type-config.constants';

interface QuestionTypeSelectorProps {
  selectedType: string;
  onSelect: (typeId: string) => void;
  grouped: Record<QuestionTypeCategory, QuestionTypeConfig[]>;
  activeConfig: QuestionTypeConfig | undefined;
  categories: QuestionTypeCategory[];
}

export function QuestionTypeSelector({ selectedType, onSelect, grouped, activeConfig, categories }: QuestionTypeSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
        Question Type
      </label>
      <div className="relative">
        <select
          value={selectedType}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-background border border-border text-xs font-bold text-foreground py-2.5 px-3 pr-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
        >
          {categories.map((cat) => (
            <optgroup key={cat} label={`${CATEGORY_LABELS[cat].icon} ${CATEGORY_LABELS[cat].label}`}>
              {grouped[cat].map((qt: QuestionTypeConfig) => (
                <option key={qt.id} value={qt.id}>
                  {qt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
      {activeConfig && (
        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
          {activeConfig.description}
        </p>
      )}
    </div>
  );
}
