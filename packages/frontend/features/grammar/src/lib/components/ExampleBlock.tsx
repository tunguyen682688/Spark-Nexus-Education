import { FC, useState } from 'react';
import { CheckCircle2, FileText, Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@spark-nest-ed/frontend-shared-components';

interface ExampleItem {
  text: string;
  explanation: string;
}

interface ExampleBlockProps {
  items: ExampleItem[];
  isEditable?: boolean;
  onChangeItems?: (items: ExampleItem[]) => void;
}

export const ExampleBlock: FC<ExampleBlockProps> = ({
  items = [],
  isEditable = false,
  onChangeItems,
}) => {
  // States for Delete confirmation using standard Dialog
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const submitDeleteItem = () => {
    if (deleteIndex !== null) {
      const copy = items.filter((_, i) => i !== deleteIndex);
      onChangeItems && onChangeItems(copy);
      setDeleteIndex(null);
    }
  };

  const handleItemChange = (
    index: number,
    key: keyof ExampleItem,
    value: string
  ) => {
    if (!isEditable || !onChangeItems) return;
    const copy = [...items];
    copy[index] = {
      ...copy[index],
      [key]: value,
    };
    onChangeItems(copy);
  };

  const handleAddItem = () => {
    if (!isEditable || !onChangeItems) return;
    onChangeItems([...items, { text: '', explanation: '' }]);
  };

  const handleDeleteItem = (index: number) => {
    if (!isEditable || !onChangeItems) return;
    setDeleteIndex(index);
  };

  if (isEditable) {
    return (
      <>
        <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Examples in Context (Editor)
            </span>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-450 transition-colors bg-transparent border-none cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Thêm ví dụ
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-xs text-slate-500 italic">
                Chưa có ví dụ nào. Nhấn "+ Thêm ví dụ" để bắt đầu.
              </p>
            )}

            {items.map((item, index) => (
              <div
                key={index}
                className="border border-slate-800 rounded-2xl p-4 space-y-3 bg-[#0c1020]/20 relative group"
              >
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all text-xs border-none bg-transparent cursor-pointer"
                  title="Xóa ví dụ"
                >
                  ✕
                </button>

                <div className="space-y-1.5 pr-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Câu ví dụ (English):
                  </label>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) =>
                      handleItemChange(index, 'text', e.target.value)
                    }
                    className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner"
                    placeholder="Ví dụ: If I had more time, I would..."
                  />
                </div>

                <div className="space-y-1.5 pr-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Giải thích / Dịch nghĩa (Vietnamese):
                  </label>
                  <input
                    type="text"
                    value={item.explanation}
                    onChange={(e) =>
                      handleItemChange(index, 'explanation', e.target.value)
                    }
                    className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner"
                    placeholder="Giải nghĩa: Thực tế là tôi không có thời gian..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dialog Xác Nhận Xóa Ví Dụ */}
        <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
          <DialogContent className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 max-w-md w-full text-slate-100">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span role="img" aria-label="warning">⚠️</span> Xác nhận xóa
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Bạn có chắc chắn muốn xóa ví dụ này?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-slate-900/60 mt-4">
              <Button
                onClick={() => setDeleteIndex(null)}
                variant="outline"
                className="border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-2 rounded-xl font-bold"
              >
                Hủy
              </Button>
              <Button
                onClick={submitDeleteItem}
                className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-red-500/20 active:scale-[0.98] transition-all"
              >
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-3 items-start group">
          <div className="flex-shrink-0 mt-1">
            <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10 transition-transform group-hover:scale-110 duration-200" />
          </div>

          <div className="space-y-1 flex-1">
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              {item.text}
            </p>
            {item.explanation && (
              <div className="bg-[#0b1022]/40 border border-slate-900/60 rounded-xl px-4 py-2 mt-1 self-start inline-block">
                <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExampleBlock;
