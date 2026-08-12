import {
  Grid,
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  Calculator,
  GripVertical,
  Trash2,
} from 'lucide-react';
import type { BuilderSection } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';

interface SectionListItemProps {
  section: BuilderSection;
  isActive: boolean;
  canDelete: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function getSectionIcon(sectionType: string) {
  switch (sectionType) {
    case 'listening':
      return Headphones;
    case 'reading':
      return BookOpen;
    case 'writing':
      return PenTool;
    case 'speaking':
      return Mic;
    case 'math':
      return Calculator;
    default:
      return Grid;
  }
}

function getSectionIconColor(sectionType: string): string {
  switch (sectionType) {
    case 'listening':
      return 'text-blue-500';
    case 'reading':
      return 'text-emerald-500';
    case 'writing':
      return 'text-amber-500';
    case 'speaking':
      return 'text-rose-500';
    case 'math':
      return 'text-purple-500';
    default:
      return 'text-muted-foreground';
  }
}

export function SectionListItem({ section, isActive, canDelete, onSelect, onDelete }: SectionListItemProps) {
  const SectionIcon = getSectionIcon(section.sectionType);
  const iconColor = getSectionIconColor(section.sectionType);

  return (
    <div
      onClick={() => onSelect?.(section.id)}
      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
        isActive
          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
          : 'border-border bg-card hover:bg-secondary/40'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <SectionIcon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
        <div>
          <div className="font-bold text-xs text-foreground leading-snug">
            {section.title}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">
            {section.subtitle}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right text-[10px] font-extrabold text-muted-foreground">
          {section.isBreak ? '---' : `${section.questionCount} Q`}
        </div>
        {!section.isBreak && canDelete && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(section.id);
            }}
            className="p-1 rounded hover:bg-rose-50 text-muted-foreground hover:text-rose-600 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
