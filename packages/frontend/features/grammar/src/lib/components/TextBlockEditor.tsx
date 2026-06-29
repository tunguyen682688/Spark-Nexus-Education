import { FC, useRef } from 'react';
import { Bold, Italic, List, Sparkles } from 'lucide-react';
import { Textarea } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface TextBlockEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.textBlockEditor;

export const TextBlockEditor: FC<TextBlockEditorProps> = ({
  content = '',
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper để chèn định dạng Markdown tại vị trí con trỏ
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = prefix + (selectedText || T.fallbackText) + suffix;
    const newContent =
      text.substring(0, start) + replacement + text.substring(end);

    onChange(newContent);

    // Đặt lại con trỏ chuột tập trung vào textarea sau khi click định dạng
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText || T.fallbackText).length
      );
    }, 50);
  };

  return (
    <div className="space-y-3">
      {/* Markdown Quick Toolbar */}
      <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-black text-xs flex items-center justify-center bg-transparent border-none cursor-pointer"
            title={T.titleBold}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all italic text-xs flex items-center justify-center bg-transparent border-none cursor-pointer"
            title={T.titleItalic}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n- ', '')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-xs flex items-center justify-center bg-transparent border-none cursor-pointer"
            title={T.titleList}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>{T.markdownSupport}</span>
        </div>
      </div>

      {/* Editor textarea using custom Textarea component */}
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full bg-background border border-border rounded-2xl p-4 focus:border-primary/60 focus:bg-muted/10 transition-all text-base text-foreground leading-relaxed resize-none placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:outline-none"
        placeholder={T.placeholder}
      />
    </div>
  );
};
export default TextBlockEditor;
