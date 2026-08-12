import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@spark-nest-ed/frontend-shared-components';

interface DeleteDialogsProps {
  confirmDeleteChapterId: string | null;
  setConfirmDeleteChapterId: (id: string | null) => void;
  confirmDeleteExamId: string | null;
  setConfirmDeleteExamId: (id: string | null) => void;
  handleDeleteChapter: (chapterId: string) => void;
  handleRemoveExamFromChapter: (examId: string) => void;
}

export function DeleteDialogs({ confirmDeleteChapterId, setConfirmDeleteChapterId, confirmDeleteExamId, setConfirmDeleteExamId, handleDeleteChapter, handleRemoveExamFromChapter }: DeleteDialogsProps) {
  return (
    <>
      {/* CONFIRM DELETE CHAPTER */}
      <AlertDialog open={!!confirmDeleteChapterId} onOpenChange={(open) => { if (!open) setConfirmDeleteChapterId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa chương?</AlertDialogTitle>
            <AlertDialogDescription>Chương này sẽ bị xóa khỏi bộ sưu tập. Bạn có chắc chắn muốn thực hiện?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { if (confirmDeleteChapterId) { handleDeleteChapter(confirmDeleteChapterId); setConfirmDeleteChapterId(null); } }}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM DELETE EXAM */}
      <AlertDialog open={!!confirmDeleteExamId} onOpenChange={(open) => { if (!open) setConfirmDeleteExamId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài kiểm tra?</AlertDialogTitle>
            <AlertDialogDescription>Bài kiểm tra này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn thực hiện?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { if (confirmDeleteExamId) { handleRemoveExamFromChapter(confirmDeleteExamId); setConfirmDeleteExamId(null); } }}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
