import { FC, useRef } from 'react';
import { Bold, Italic, List, Sparkles } from 'lucide-react';

interface TextBlockEditorProps {
  content: string;
  onChange: (content: string) => void;
}

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

    const replacement = prefix + (selectedText || 'văn bản') + suffix;
    const newContent =
      text.substring(0, start) + replacement + text.substring(end);

    onChange(newContent);

    // Đặt lại con trỏ chuột tập trung vào textarea sau khi click định dạng
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText || 'văn bản').length
      );
    }, 50);
  };

  return (
    <div className="space-y-3">
      {/* Markdown Quick Toolbar */}
      <div className="flex items-center justify-between bg-[#0c1020] border border-slate-850 rounded-xl px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 transition-all font-black text-xs flex items-center justify-center"
            title="In đậm (Bold)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 transition-all italic text-xs flex items-center justify-center"
            title="In nghiêng (Italic)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n- ', '')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 transition-all text-xs flex items-center justify-center"
            title="Danh sách (List)"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <Sparkles className="h-3 w-3 text-blue-500" />
          <span>HỖ TRỢ MARKDOWN</span>
        </div>
      </div>

      {/* Editor textarea wrapped in a spacious card container */}
      <div className="bg-[#0c1020]/30 border border-slate-850 rounded-2xl p-4 focus-within:border-blue-500/60 focus-within:bg-[#0c1020]/50 transition-all">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-base text-slate-200 leading-relaxed resize-none placeholder-slate-650"
          placeholder="Nhập nội dung lý thuyết ngữ pháp chi tiết tại đây (Hỗ trợ tiêu đề ###, văn bản in đậm **chữ**, nghiêng *chữ*...)"
        />
      </div>
    </div>
  );
};
export default TextBlockEditor;
