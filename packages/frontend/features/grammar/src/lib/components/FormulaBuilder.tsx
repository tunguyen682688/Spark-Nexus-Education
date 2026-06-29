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
  Input,
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
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[80px]">
        {elements.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
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
                <span className="text-primary font-black text-lg px-1">
                  {el}
                </span>
              ) : (
                <div
                  onClick={() => isEditable && handleEditElement(index)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all group ${
                    isPrimary
                      ? 'bg-primary text-primary-foreground border-primary shadow-primary/15'
                      : 'bg-muted text-foreground border-border hover:border-muted-foreground/30'
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
                          isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        ✎
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(index);
                        }}
                        className={`text-[10px] hover:text-destructive ${
                          isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
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
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-dashed border-border text-primary bg-muted hover:bg-muted/80 hover:border-muted-foreground/30 transition-all shadow-sm ml-2 cursor-pointer"
            title="Thêm thành phần"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggested elements */}
      {isEditable && (
        <div className="space-y-2 pt-3 border-t border-border/60">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
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
        <Input
          type="text"
          value={note}
          onChange={(e) => onChangeNote && onChangeNote(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-muted-foreground italic outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
          placeholder="Thêm ghi chú/giải thích tùy chọn cho công thức..."
        />
      ) : (
        note && (
          <p className="text-xs text-muted-foreground italic text-center mt-1">
            * {note}
          </p>
        )
      )}

      {/* Dialog Thêm/Sửa thành phần công thức */}
      <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
        <DialogContent className="bg-card border border-border rounded-3xl p-6 max-w-md w-full text-foreground">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-extrabold text-foreground uppercase tracking-wider">
              {editingIndex !== null ? 'Sửa thành phần' : 'Thêm thành phần'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Nhập thành phần công thức mới (ví dụ: + [Object] hoặc have / has).
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Input
              type="text"
              value={elementValue}
              onChange={(e) => setElementValue(e.target.value)}
              placeholder="+ [Object]"
              className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50 shadow-inner"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitElementDialog();
                }
              }}
            />
          </div>
          <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-border/60">
            <Button
              onClick={() => setIsElementDialogOpen(false)}
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs py-2 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={submitElementDialog}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              Đồng ý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Phần Tử */}
      <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <DialogContent className="bg-card border border-border rounded-3xl p-6 max-w-md w-full text-foreground">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span role="img" aria-label="warning">⚠️</span> Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa phần tử này khỏi công thức?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-border/60 mt-4">
            <Button
              onClick={() => setDeleteIndex(null)}
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs py-2 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={submitDeleteElement}
              className="bg-destructive hover:bg-destructive/90 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-destructive/20 active:scale-[0.98] transition-all cursor-pointer"
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
