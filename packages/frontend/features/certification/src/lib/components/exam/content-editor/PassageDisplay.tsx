import { FileText } from 'lucide-react';

interface PassageDisplayProps {
  passageText: string;
  activeBlankIndex?: number;
  blanks?: Array<{ index: number; label: string }>;
}

export function PassageDisplay({ passageText, activeBlankIndex, blanks }: PassageDisplayProps) {
  if (!passageText?.trim()) return null;

  // Split passage by blank markers (_____ or [blank N])
  const parts = passageText.split(/(_____|(?:\[blank\s*\d+\]))/gi);

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-indigo-600" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Đoạn văn阅读理解
        </span>
        {blanks && blanks.length > 0 && (
          <span className="text-[9px] text-muted-foreground ml-auto">
            {blanks.length} blank{blanks.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          const isBlankMarker = /_____/i.test(part) || /\[blank\s*\d+\]/i.test(part);
          if (isBlankMarker) {
            return (
              <span
                key={i}
                className="inline-flex items-center justify-center min-w-[60px] h-6 px-2 mx-0.5 rounded border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-[10px] font-bold text-indigo-600"
              >
                {activeBlankIndex !== undefined ? `(${activeBlankIndex})` : '_____'}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}
