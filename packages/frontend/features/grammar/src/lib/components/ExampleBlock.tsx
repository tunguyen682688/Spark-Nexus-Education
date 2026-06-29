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
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface ExampleItem {
  text: string;
  explanation: string;
}

interface ExampleBlockProps {
  items: ExampleItem[];
  isEditable?: boolean;
  onChangeItems?: (items: ExampleItem[]) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.exampleBlock;

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
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {T.editorTitle}
            </span>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer"
            >
              <Plus className="h-3 w-3" /> {T.btnAddExample}
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                {T.emptyText}
              </p>
            )}

            {items.map((item, index) => (
              <div
                key={index}
                className="border border-border rounded-2xl p-4 space-y-3 bg-muted/20 relative group"
              >
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-xs border-none bg-transparent cursor-pointer"
                  title={T.btnDeleteExample}
                >
                  ✕
                </button>

                <div className="space-y-1.5 pr-6">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {T.labelExample}
                  </label>
                  <Input
                    type="text"
                    value={item.text}
                    onChange={(e) =>
                      handleItemChange(index, 'text', e.target.value)
                    }
                    className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50 shadow-inner"
                    placeholder={T.placeholderExample}
                  />
                </div>

                <div className="space-y-1.5 pr-6">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {T.labelExplanation}
                  </label>
                  <Input
                    type="text"
                    value={item.explanation}
                    onChange={(e) =>
                      handleItemChange(index, 'explanation', e.target.value)
                    }
                    className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50 shadow-inner"
                    placeholder={T.placeholderExplanation}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dialog Xác Nhận Xóa Ví Dụ */}
        <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
          <DialogContent className="bg-card border border-border rounded-3xl p-6 max-w-md w-full text-foreground">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span role="img" aria-label="warning">⚠️</span> {T.dialogDeleteTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {T.dialogDeleteDesc}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-border/60 mt-4">
              <Button
                onClick={() => setDeleteIndex(null)}
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 text-xs py-2 rounded-xl font-bold"
              >
                {T.btnCancel}
              </Button>
              <Button
                onClick={submitDeleteItem}
                className="bg-destructive hover:bg-destructive/90 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-destructive/20 active:scale-[0.98] transition-all"
              >
                {T.btnDelete}
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
            <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10 transition-transform group-hover:scale-110 duration-200" />
          </div>

          <div className="space-y-1 flex-1">
            <p className="text-sm font-bold text-foreground leading-relaxed">
              {item.text}
            </p>
            {item.explanation && (
              <div className="bg-muted/30 border border-border rounded-xl px-4 py-2 mt-1 self-start inline-block">
                <p className="text-xs text-muted-foreground italic font-medium leading-relaxed">
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
