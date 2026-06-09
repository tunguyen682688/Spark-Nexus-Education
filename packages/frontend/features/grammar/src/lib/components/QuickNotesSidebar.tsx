import { FC, useState, useEffect, useRef, ChangeEvent } from 'react';
import { useUpdateGrammarProgress } from '../hooks';
import { BookOpen } from 'lucide-react';

interface QuickNotesSidebarProps {
  lessonId: string;
  initialNotes?: string;
}

export const QuickNotesSidebar: FC<QuickNotesSidebarProps> = ({
  lessonId,
  initialNotes = '',
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const updateProgress = useUpdateGrammarProgress();
  
  // Ref để lưu trữ timer của debounce
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Đồng bộ notes khi dữ liệu ban đầu từ database trả về
  useEffect(() => {
    if (initialNotes !== undefined) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  // Cleanup timer khi unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus('saving');

    // Hủy bỏ timer cũ nếu người dùng vẫn đang gõ tiếp
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Thiết lập timer mới cho auto-save (800ms debounced)
    debounceTimer.current = setTimeout(async () => {
      try {
        await updateProgress.mutateAsync({
          id: lessonId,
          payload: { quickNotes: val },
        });
        setSaveStatus('saved');
        
        // Reset status về idle sau 2 giây
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (err) {
        console.error('Lỗi khi tự động lưu ghi chú:', err);
        setSaveStatus('error');
      }
    }, 800);
  };

  return (
    <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 tracking-wider uppercase">
          <BookOpen className="h-4 w-4 text-blue-500" />
          Quick Notes
        </div>
        <span className="text-[9px] font-extrabold bg-[#0b1022] text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
          PERSONAL NOTES
        </span>
      </div>

      {/* Editor Box */}
      <div className="relative space-y-2">
        <textarea
          value={notes}
          onChange={handleChange}
          rows={5}
          className="w-full bg-[#0c1020] border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-2xl p-4 text-xs font-medium text-slate-350 leading-relaxed outline-none transition-all resize-none placeholder-slate-650"
          placeholder="Jot down key takeaways here..."
        />
        
        {/* Status Indicator */}
        <div className="flex justify-end pr-1 min-h-[14px]">
          {saveStatus === 'saving' && (
            <span className="text-[10px] font-bold text-blue-500 animate-pulse">
              ● Đang tự động lưu...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[10px] font-bold text-emerald-500">
              ✓ Đã tự động lưu thành công
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[10px] font-bold text-rose-500">
              ⚠ Lỗi tự động lưu!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default QuickNotesSidebar;
