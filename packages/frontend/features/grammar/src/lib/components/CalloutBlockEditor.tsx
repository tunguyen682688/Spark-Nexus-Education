import type { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface CalloutBlockEditorProps {
  title: string;
  content: string;
  onChange: (fields: { title?: string; content?: string }) => void;
}

export const CalloutBlockEditor: FC<CalloutBlockEditorProps> = ({
  title = '',
  content = '',
  onChange,
}) => {
  return (
    <div className="space-y-4 bg-[#0f1530]/20 border border-blue-500/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400 uppercase tracking-wider">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        Lưu ý nổi bật (Callout Editor)
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Tiêu đề lưu ý:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner font-bold"
          placeholder="Ví dụ: LƯU Ý QUAN TRỌNG, CẢNH BÁO..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Nội dung chi tiết:
        </label>
        <textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-350 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner resize-none leading-relaxed"
          rows={4}
          placeholder="Nhập nội dung lưu ý chi tiết..."
        />
      </div>
    </div>
  );
};

export default CalloutBlockEditor;
