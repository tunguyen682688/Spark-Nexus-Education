import {
  Plus,
  Edit2,
  MoreVertical,
  ArrowUpDown,
  Upload,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  GripVertical,
} from 'lucide-react';
import { Card, Button, useToast } from '@spark-nest-ed/frontend-shared-components';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableExamRow } from './SortableExamRow';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorLogicState } from '../../types/container-collection-editor.types';

const text = CERTIFICATION_UI_TEXT.collectionEditor;

type Props = Pick<EditorLogicState, 'activeChapter' | 'handleUpdateActiveChapterTitle' | 'handleUpdateActiveChapterDescription' | 'handleAddExamToChapter' | 'handleRemoveExamFromChapter' | 'handleReorderExams' | 'handleEditExam' | 'summary' | 'isSaving' | 'setIsAddExamModalOpen'> & {
  isReorderMode: boolean;
  onToggleReorder: () => void;
};

export function ChapterDetailPanel(props: Props) {
  const { activeChapter, handleUpdateActiveChapterTitle, handleUpdateActiveChapterDescription, handleAddExamToChapter, handleRemoveExamFromChapter, handleReorderExams, handleEditExam, summary, isSaving, isReorderMode, onToggleReorder } = props;
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const exams = activeChapter?.exams ?? [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = exams.findIndex((ex) => ex.id === active.id);
    const newIndex = exams.findIndex((ex) => ex.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      handleReorderExams(oldIndex, newIndex);
    }
  };

  return (
    <div className="xl:col-span-6 space-y-6">
      <Card className="border-border shadow-sm bg-card p-5 space-y-4">
        {/* CHAPTER TITLE HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <input
              value={activeChapter?.title || ''}
              onChange={(e) => handleUpdateActiveChapterTitle(e.target.value)}
              className="font-extrabold text-base text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none py-0.5 px-1 rounded"
            />
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <button className="text-muted-foreground hover:text-foreground cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* CHAPTER DESCRIPTION TEXTAREA */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{text.chapterDetail.descriptionPlaceholder}</label>
          <textarea
            value={activeChapter?.description || ''}
            onChange={(e) => handleUpdateActiveChapterDescription(e.target.value)}
            placeholder="Build a strong foundation with essential topics..."
            rows={2}
            className="w-full text-xs font-medium text-foreground bg-secondary/30 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* ACTION CONTROLS BAR & STATS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Button onClick={handleAddExamToChapter} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50">
              <Plus className="w-3.5 h-3.5" />
              <span>{text.chapterDetail.addExam}</span>
            </Button>
            <Button onClick={onToggleReorder} variant={isReorderMode ? 'default' : 'outline'} className={`text-xs font-bold py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer ${isReorderMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border-border hover:bg-secondary'}`}>
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{isReorderMode ? 'Done' : text.chapterDetail.reorder}</span>
            </Button>
            <Button onClick={() => toast({ title: 'Nhập đề thi', description: 'Tính năng nhập đề thi sẽ sớm ra mắt.', variant: 'default' as never })} variant="outline" className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{text.chapterDetail.importExams}</span>
            </Button>
          </div>
          <div className="text-xs text-muted-foreground font-bold">
            {exams.length} exams • {exams.reduce((sum, exam) => sum + exam.questionsCount, 0)} questions
          </div>
        </div>

        {/* EXAMS TABLE */}
        <div className="overflow-x-auto pt-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  {isReorderMode && <th className="py-2.5 px-2 w-8"></th>}
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">{text.tableHeaders.title}</th>
                  <th className="py-2.5 px-2 text-center">{text.tableHeaders.questions}</th>
                  <th className="py-2.5 px-2 text-center">{text.tableHeaders.duration}</th>
                  <th className="py-2.5 px-2 text-center">{text.tableHeaders.difficulty}</th>
                  <th className="py-2.5 px-2 text-center">{text.tableHeaders.status}</th>
                  <th className="py-2.5 px-2 text-right">{text.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={isReorderMode ? 9 : 8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-muted-foreground">No exams yet</p>
                        <p className="text-xs text-muted-foreground">Click "Add Exam" to create the first exam in this chapter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <SortableContext items={exams.map((exam) => exam.id)} strategy={verticalListSortingStrategy}>
                    {exams.map((exam, idx) => (
                      <SortableExamRow
                        key={exam.id}
                        exam={exam}
                        index={idx}
                        isSaving={isSaving}
                        onEdit={handleEditExam}
                        onDelete={(examId) => handleRemoveExamFromChapter(examId)}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>

        {/* DRAG & DROP EXAMS FOOTER */}
        <div className={`py-3 border-2 border-dashed rounded-xl text-center flex items-center justify-center gap-2 text-xs font-semibold ${isReorderMode ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600' : 'border-border text-muted-foreground'}`}>
          <GripVertical className="w-4 h-4" />
          <span>{isReorderMode ? 'Drag exams to reorder them within this chapter' : text.chapterDetail.dragDropFooter}</span>
        </div>
      </Card>

      {/* BOTTOM SUMMARY ROW */}
      <Card className="border-border shadow-sm bg-card p-5 space-y-4">
        <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">{text.summary.title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto"><BookOpen className="w-4 h-4" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{text.summary.totalChapters}</span>
            <div className="text-xl font-black text-foreground">{summary.totalChapters}</div>
          </div>
          <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto"><FileText className="w-4 h-4" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{text.summary.totalExams}</span>
            <div className="text-xl font-black text-foreground">{summary.totalExams}</div>
          </div>
          <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto"><HelpCircle className="w-4 h-4" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{text.summary.totalQuestions}</span>
            <div className="text-xl font-black text-foreground">{summary.totalQuestions.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto"><Clock className="w-4 h-4" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{text.summary.estimatedDuration}</span>
            <div className="text-xl font-black text-foreground">{summary.estimatedDurationText}</div>
          </div>
          <div className="p-3 bg-secondary/30 rounded-xl space-y-1 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{text.summary.difficultyMix}</span>
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-foreground">
              <span className="text-emerald-600">• Easy {summary.difficultyMix.easy}%</span>
              <span className="text-amber-600">• Med {summary.difficultyMix.medium}%</span>
              <span className="text-rose-600">• Hard {summary.difficultyMix.hard}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
