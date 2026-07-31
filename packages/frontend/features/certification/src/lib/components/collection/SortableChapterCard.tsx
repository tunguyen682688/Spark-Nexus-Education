import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { EditorChapter } from '../../hooks/editor/collection-editor.types';

interface SortableChapterCardProps {
  chapter: EditorChapter;
  isActive: boolean;
  isSaving: boolean;
  canDelete: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SortableChapterCard({
  chapter,
  isActive,
  isSaving,
  canDelete,
  onSelect,
  onDelete,
}: SortableChapterCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(chapter.id)}
      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
        isActive
          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
          : 'border-border bg-card hover:bg-secondary/40'
      } ${isDragging ? 'ring-2 ring-indigo-400' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <span className="font-black text-xs text-muted-foreground">{chapter.number}</span>
        <div>
          <div className="font-bold text-xs text-foreground leading-snug">
            {chapter.title}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">
            {chapter.exams.length} exams
          </div>
        </div>
      </div>

      {canDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
          disabled={isSaving}
          className="text-muted-foreground hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
