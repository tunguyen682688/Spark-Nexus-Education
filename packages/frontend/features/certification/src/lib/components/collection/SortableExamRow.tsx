import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, X } from 'lucide-react';
import { Badge } from '@spark-nest-ed/frontend-shared-components';
import type { EditorExam } from '../../types/collection-editor.types';

interface SortableExamRowProps {
  exam: EditorExam;
  index: number;
  isSaving: boolean;
  onEdit: (examId: string) => void;
  onDelete: (examId: string) => void;
}

export function SortableExamRow({ exam, index, isSaving, onEdit, onDelete }: SortableExamRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exam.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <tr ref={setNodeRef} style={style} className={`hover:bg-secondary/40 transition-colors ${isDragging ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}`}>
      <td className="py-3 px-2">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="py-3 px-2 font-bold text-muted-foreground">{index + 1}</td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-[9px] flex items-center justify-center flex-shrink-0">
            {(exam.iconType ?? 'GEN').toUpperCase().slice(0, 6)}
          </div>
          <div>
            <div className="font-extrabold text-foreground">{exam.title}</div>
            <div className="text-[10px] text-muted-foreground font-medium">
              {exam.subTitle}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-center font-bold text-foreground">
        {exam.questionsCount}
      </td>
      <td className="py-3 px-2 text-center font-bold text-foreground">
        {exam.durationMinutes} min
      </td>
      <td className="py-3 px-2 text-center">
        <Badge
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border-none ${
            exam.difficulty === 'Easy'
              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
              : exam.difficulty === 'Medium'
              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
          }`}
        >
          {exam.difficulty}
        </Badge>
      </td>
      <td className="py-3 px-2 text-center">
        <Badge
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border-none ${
            exam.status === 'Published'
              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
          }`}
        >
          {exam.status}
        </Badge>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(exam.id)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(exam.id)}
            disabled={isSaving}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-rose-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
