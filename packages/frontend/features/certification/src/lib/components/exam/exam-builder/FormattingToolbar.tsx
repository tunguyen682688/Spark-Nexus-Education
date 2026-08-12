import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Code, Quote, Image as ImageIcon } from 'lucide-react';

interface FormattingToolbarProps {
  variant?: 'full' | 'compact';
}

export function FormattingToolbar({ variant = 'full' }: FormattingToolbarProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 p-2 bg-secondary/30 rounded-xl border border-border">
        <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-secondary/30 rounded-xl border border-border">
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <Strikethrough className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-border mx-1" />
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <List className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <Code className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <Quote className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
      </button>
    </div>
  );
}
