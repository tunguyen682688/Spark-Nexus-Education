import { Plus } from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableChapterCard } from './SortableChapterCard';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorLogicState } from '../../types/container-collection-editor.types';

const shared = CERTIFICATION_UI_TEXT.shared;
const text = CERTIFICATION_UI_TEXT.collectionEditor;

type Props = Pick<EditorLogicState, 'chapters' | 'activeChapterId' | 'setActiveChapterId' | 'handleAddChapter' | 'handleDeleteChapter' | 'handleReorderChapters' | 'isSaving'>;

export function StructureSidebar({ chapters, activeChapterId, setActiveChapterId, handleAddChapter, handleDeleteChapter, handleReorderChapters, isSaving }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleChapterDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
    const newIndex = chapters.findIndex((ch) => ch.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      handleReorderChapters(oldIndex, newIndex);
    }
  };

  return (
    <div className="xl:col-span-3 space-y-4">
      <Card className="border-border shadow-sm bg-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">{text.structureSidebar.title}</h3>
          <button onClick={handleAddChapter} disabled={isSaving} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="w-3.5 h-3.5" />
            <span>{shared.add}</span>
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChapterDragEnd}>
          <SortableContext items={chapters.map((ch) => ch.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {(chapters ?? []).map((chap) => (
                <SortableChapterCard
                  key={chap.id}
                  chapter={chap}
                  isActive={chap.id === activeChapterId}
                  isSaving={isSaving}
                  canDelete={chapters.length > 1}
                  onSelect={setActiveChapterId}
                  onDelete={handleDeleteChapter}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button onClick={handleAddChapter} disabled={isSaving} className="w-full py-4 border-2 border-dashed border-border rounded-xl text-center space-y-0.5 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="text-xs font-bold text-indigo-600 group-hover:underline block">{shared.addChapter}</span>
          <span className="text-[10px] text-muted-foreground font-medium block">{shared.dragToReorder}</span>
        </button>
      </Card>
    </div>
  );
}
