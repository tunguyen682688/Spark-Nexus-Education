import { PenLine } from 'lucide-react';

interface WritingTaskEditorProps {
  writingTaskType?: string;
  prompt?: string;
  onWritingTaskTypeChange?: (value: string) => void;
  onPromptChange?: (value: string) => void;
}

const WRITING_TASK_TYPES = [
  { value: 'essay', label: 'Essay (250+ words)' },
  { value: 'letter', label: 'Letter Writing' },
  { value: 'report', label: 'Report Writing' },
  { value: 'review', label: 'Review Writing' },
  { value: 'discussion', label: 'Discussion Essay' },
  { value: 'task1_academic', label: 'Task 1 Academic (Graph/Diagram)' },
  { value: 'task1_general', label: 'Task 1 General (Letter)' },
  { value: 'task2', label: 'Task 2 (Essay)' },
  { value: 'independent', label: 'Independent Writing' },
  { value: 'integrated', label: 'Integrated Writing' },
];

export function WritingTaskEditor({
  writingTaskType = '',
  prompt = '',
  onWritingTaskTypeChange,
  onPromptChange,
}: WritingTaskEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <PenLine className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          Writing Task
        </h3>
      </div>

      {onWritingTaskTypeChange && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Task Type
          </label>
          <select
            value={writingTaskType}
            onChange={(e) => onWritingTaskTypeChange(e.target.value)}
            className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">Select writing task type...</option>
            {WRITING_TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {onPromptChange && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Writing Prompt / Rubric
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={5}
            placeholder="Enter the writing task prompt, instructions, or scoring rubric..."
            className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground font-medium">
            {prompt.length} / 2000
          </p>
        </div>
      )}
    </div>
  );
}
