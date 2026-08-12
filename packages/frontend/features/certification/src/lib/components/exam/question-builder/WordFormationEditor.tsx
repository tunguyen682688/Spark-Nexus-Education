import { BookMarked } from 'lucide-react';

interface WordFormationEditorProps {
  rootWord?: string;
  onRootWordChange?: (value: string) => void;
}

export function WordFormationEditor({ rootWord = '', onRootWordChange }: WordFormationEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <BookMarked className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          Word Formation
        </h3>
      </div>

      {onRootWordChange && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Root Word
          </label>
          <input
            value={rootWord}
            onChange={(e) => onRootWordChange(e.target.value)}
            placeholder="e.g., 'develop' (candidates form correct derivative)"
            className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-muted-foreground font-medium">
            Provide the root word. Candidates must form the correct derivative (e.g., development, developmental, developed).
          </p>
        </div>
      )}
    </div>
  );
}
