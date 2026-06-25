import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@spark-nest-ed/frontend-shared-components';
import { SUGGESTED_FORMULA_ELEMENTS } from '../constants';

interface FormulaBuilderProps {
  elements: string[];
  note?: string;
  isEditable?: boolean;
  onChangeElements?: (elements: string[]) => void;
  onChangeNote?: (note: string) => void;
}

export const FormulaBuilder: FC<FormulaBuilderProps> = ({
  elements = [],
  note = '',
  isEditable = false,
  onChangeElements,
  onChangeNote,
}) => {
  // States for Element dialog & Delete confirmation using standard Dialog
  const [isElementDialogOpen, setIsElementDialogOpen] = useState(false);
  const [elementValue, setElementValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const submitElementDialog = () => {
    if (elementValue && elementValue.trim().length > 0) {
      if (editingIndex !== null) {
        const copy = [...elements];
        copy[editingIndex] = elementValue.trim();
        onChangeElements && onChangeElements(copy);
      } else {
        onChangeElements && onChangeElements([...elements, elementValue.trim()]);
      }
      setIsElementDialogOpen(false);
    }
  };

  const submitDeleteElement = () => {
    if (deleteIndex !== null) {
      const copy = elements.filter((_, i) => i !== deleteIndex);
      onChangeElements && onChangeElements(copy);
      setDeleteIndex(null);
    }
  };

  const handleAddElement = () => {
    if (!isEditable || !onChangeElements) return;
    setEditingIndex(null);
    setElementValue('');
    setIsElementDialogOpen(true);
  };

  const handleEditElement = (index: number) => {
    if (!isEditable || !onChangeElements) return;
    setEditingIndex(index);
    setElementValue(elements[index]);
    setIsElementDialogOpen(true);
  };

  const handleDeleteElement = (index: number) => {
    if (!isEditable || !onChangeElements) return;
    setDeleteIndex(index);
  };

  const SUGGESTED_ELEMENTS = SUGGESTED_FORMULA_ELEMENTS;

  return (
    <div className="bg-[#0b1022]/80 border border-blue-500/20 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[80px]">
        {elements.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            Chưa có công thức nào được thiết lập.
          </p>
        )}

        {elements.map((el, index) => {
          const isPrimary =
            el.includes('Have') ||
            el.includes('Has') ||
            el.includes('would') ||
            el.includes('V3');
          const isPlus = el === '+' || el === ',';

          return (
            <div key={index} className="flex items-center gap-2">
              {isPlus ? (
                <span className="text-blue-500 font-black text-lg px-1">
                  {el}
                </span>
              ) : (
                <div
                  onClick={() => isEditable && handleEditElement(index)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all group ${
                    isPrimary
                      ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/15'
                      : 'bg-[#0c1020] text-slate-200 border-slate-850 hover:border-slate-700'
                  } ${
                    isEditable
                      ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                      : ''
                  }`}
                >
                  <span>{el}</span>
                  {isEditable && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5">
                      <span
                        className={`text-[10px] ${
                          isPrimary ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        ✎
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(index);
                        }}
                        className={`text-[10px] hover:text-red-500 ${
                          isPrimary ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isEditable && (
          <button
            onClick={handleAddElement}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-dashed border-slate-850 text-blue-500 bg-[#0c1020] hover:bg-slate-900/60 hover:border-slate-700 transition-all shadow-sm ml-2 cursor-pointer"
            title="Thêm thành phần"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggested elements */}
      {isEditable && (
        <div className="space-y-2 pt-3 border-t border-slate-900/40">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Gợi ý nhanh thành phần:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ELEMENTS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeElements && onChangeElements([...elements, sug.value])}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wide transition-all hover:scale-[1.03] active:scale-95 cursor-pointer bg-transparent ${sug.color}`}
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note input/label */}
      {isEditable ? (
        <input
          type="text"
          value={note}
          onChange={(e) => onChangeNote && onChangeNote(e.target.value)}
          className="w-full bg-[#0c1020]/40 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-400 italic outline-none focus:border-blue-500/50 focus:bg-[#0c1020]/60 transition-all placeholder-slate-650"
          placeholder="Thêm ghi chú/giải thích tùy chọn cho công thức..."
        />
      ) : (
        note && (
          <p className="text-xs text-slate-450 italic text-center mt-1">
            * {note}
          </p>
        )
      )}

      {/* Dialog Thêm/Sửa thành phần công thức */}
      <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
        <DialogContent className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 max-w-md w-full text-slate-100">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-extrabold text-white uppercase tracking-wider">
              {editingIndex !== null ? 'Sửa thành phần' : 'Thêm thành phần'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Nhập thành phần công thức mới (ví dụ: + [Object] hoặc have / has).
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <input
              type="text"
              value={elementValue}
              onChange={(e) => setElementValue(e.target.value)}
              placeholder="+ [Object]"
              className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-655 shadow-inner"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitElementDialog();
                }
              }}
            />
          </div>
          <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-slate-900/60">
            <Button
              onClick={() => setIsElementDialogOpen(false)}
              variant="outline"
              className="border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-2 rounded-xl font-bold"
            >
              Hủy
            </Button>
            <Button
              onClick={submitElementDialog}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              Đồng ý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Phần Tử */}
      <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <DialogContent className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 max-w-md w-full text-slate-100">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span role="img" aria-label="warning">⚠️</span> Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Bạn có chắc chắn muốn xóa phần tử này khỏi công thức?
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
              onClick={submitDeleteElement}
              className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-red-500/20 active:scale-[0.98] transition-all"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormulaBuilder;
