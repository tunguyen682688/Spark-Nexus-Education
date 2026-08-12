import { Hash } from 'lucide-react';

interface GridInAnswerEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function GridInAnswerEditor({ value, onChange, placeholder = 'Enter expected numeric answer...' }: GridInAnswerEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Hash className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          Grid-In Answer
        </h3>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase block">
          Expected Answer (Student Produced)
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-[10px] text-muted-foreground font-medium">
          Student enters their own response (no multiple choice options).
        </p>
      </div>
    </div>
  );
}
