import { Mic } from 'lucide-react';

interface SpeakingTaskEditorProps {
  speakingPrompt?: string;
  prompt?: string;
  onSpeakingPromptChange?: (value: string) => void;
  onPromptChange?: (value: string) => void;
}

export function SpeakingTaskEditor({
  speakingPrompt = '',
  prompt = '',
  onSpeakingPromptChange,
  onPromptChange,
}: SpeakingTaskEditorProps) {
  const handleChange = onSpeakingPromptChange || onPromptChange;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Mic className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          Speaking Task
        </h3>
      </div>

      {handleChange && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Speaking Prompt / Instructions
          </label>
          <textarea
            value={speakingPrompt || prompt}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            placeholder="Enter the speaking prompt or instructions for the candidate..."
            className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground font-medium">
            {(speakingPrompt || prompt).length} / 2000
          </p>
        </div>
      )}
    </div>
  );
}
