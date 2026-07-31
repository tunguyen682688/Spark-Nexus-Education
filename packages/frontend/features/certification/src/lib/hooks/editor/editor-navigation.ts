/**
 * Navigation handlers — save, publish, confirm-leave, preview, edit, back.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationDeps {
  activeCollectionId: string | null;
  isDirtyRef: React.RefObject<boolean>;
  handlePersist: (publishStatus?: 'draft' | 'published') => Promise<boolean>;
  refetchAndHydrate: () => Promise<void>;
}

export function useNavigationHandlers(deps: NavigationDeps) {
  const { activeCollectionId, isDirtyRef, handlePersist, refetchAndHydrate } = deps;
  const navigate = useNavigate();

  const handleSaveDraft = useCallback(() => handlePersist(), [handlePersist]);
  const handlePublishCollection = useCallback(() => handlePersist('published'), [handlePersist]);

  const handleRetrySync = useCallback(() => refetchAndHydrate(), [refetchAndHydrate]);

  const confirmLeave = useCallback(async (): Promise<boolean> => {
    if (!isDirtyRef.current) return true;
    const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi rời đi?');
    if (confirmed) {
      const saved = await handlePersist();
      if (!saved) {
        return window.confirm('Lưu thất bại. Dữ liệu đã được lưu tạm vào trình duyệt.\n\nBạn có muốn rời đi không?');
      }
    }
    return true;
  }, [handlePersist, isDirtyRef]);

  const handlePreviewCollection = useCallback(async () => {
    if (await confirmLeave() && activeCollectionId) navigate(`/certification/collections/${activeCollectionId}`);
  }, [confirmLeave, activeCollectionId, navigate]);

  const handleEditExam = useCallback(async (examId: string) => {
    if (await confirmLeave()) navigate(`/certification/exam-builder/${examId}`);
  }, [confirmLeave, navigate]);

  const handleBackToDashboard = useCallback(async () => {
    await confirmLeave();
    navigate('/certification/creator-dashboard');
  }, [confirmLeave, navigate]);

  return { handleSaveDraft, handlePublishCollection, handleRetrySync, confirmLeave, handlePreviewCollection, handleEditExam, handleBackToDashboard };
}
