import { FC } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface LessonEditorDialogsProps {
  isAddTagOpen: boolean;
  setIsAddTagOpen: (open: boolean) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  submitAddTag: () => void;
  blockToDelete: string | null;
  setBlockToDelete: (id: string | null) => void;
  submitDeleteBlock: () => void;
}

export const LessonEditorDialogs: FC<LessonEditorDialogsProps> = ({
  isAddTagOpen,
  setIsAddTagOpen,
  newTag,
  setNewTag,
  submitAddTag,
  blockToDelete,
  setBlockToDelete,
  submitDeleteBlock,
}) => (
  <>
    <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
      <DialogContent className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 max-w-md w-full text-slate-100">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-extrabold text-white uppercase tracking-wider">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogAddTagTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogAddTagDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="py-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder={GRAMMAR_UI_TEXT.lessonEditor.dialogAddTagPlaceholder}
            className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') submitAddTag(); }}
          />
        </div>
        <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-slate-900/60">
          <Button onClick={() => setIsAddTagOpen(false)} variant="outline"
            className="border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-2 rounded-xl font-bold">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogAddTagBtnCancel}
          </Button>
          <Button onClick={submitAddTag}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogAddTagBtnConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={blockToDelete !== null} onOpenChange={(open) => !open && setBlockToDelete(null)}>
      <DialogContent className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 max-w-md w-full text-slate-100">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-extrabold text-white uppercase tracking-wider">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogDeleteTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogDeleteDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 pt-2 border-t border-slate-900/60">
          <Button onClick={() => setBlockToDelete(null)} variant="outline"
            className="border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs py-2 rounded-xl font-bold">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogDeleteBtnCancel}
          </Button>
          <Button onClick={submitDeleteBlock}
            className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-2 rounded-xl border-none text-xs shadow-md shadow-red-500/20 active:scale-[0.98] transition-all">
            {GRAMMAR_UI_TEXT.lessonEditor.dialogDeleteBtnConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);
