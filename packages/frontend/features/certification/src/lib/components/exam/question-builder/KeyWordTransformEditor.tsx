import { Key } from 'lucide-react';

interface KeyWordTransformEditorProps {
  keyWord?: string;
  onKeyWordChange?: (value: string) => void;
}

export function KeyWordTransformEditor({ keyWord = '', onKeyWordChange }: KeyWordTransformEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Key className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          Key Word Transformation
        </h3>
      </div>

      {onKeyWordChange && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Key Word
          </label>
          <input
            value={keyWord}
            onChange={(e) => onKeyWordChange(e.target.value)}
            placeholder="e.g., 'interested' (candidates transform using this word)"
            className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-muted-foreground font-medium">
            Provide the key word. Candidates must complete a second sentence using 2-5 words including this word.
          </p>
        </div>
      )}
    </div>
  );
}
