/**
 * Persist — save/publish collection, isSaving, autosavedText.
 */
import { useCallback } from 'react';
import type { EditorChapter, CollectionDetailsForm, SyncStatus } from '../../types/collection-editor.types';
import type { PersistDeps } from '../../types/editor-hook.types';
import {
  buildCollectionDetailsPayload,
  withRetry,
  saveDraftToStorage,
  clearDraftFromStorage,
} from '../../services/collection-editor-helpers.service';
import { RETRY_COUNT, RETRY_DELAY_MS } from '../../constants/editor.constants';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export type { PersistDeps } from '../../types/editor-hook.types';
export { RETRY_COUNT, RETRY_DELAY_MS } from '../../constants/editor.constants';

export function computeIsSaving(opts: {
  isCreatePending: boolean;
  isUpdatePending: boolean;
  isCreateExamPending: boolean;
  isDeleteExamPending: boolean;
  isSyncPending: boolean;
  syncStatus: SyncStatus;
}): boolean {
  return (
    opts.isCreatePending ||
    opts.isUpdatePending ||
    opts.isCreateExamPending ||
    opts.isDeleteExamPending ||
    opts.isSyncPending ||
    opts.syncStatus === 'syncing' ||
    opts.syncStatus === 'retrying'
  );
}

export function usePersistHandler(deps: PersistDeps) {
  const {
    activeCollectionId,
    details,
    chapters,
    mutations,
    syncChaptersToServer,
    setSyncStatus,
    setLastSavedAt,
    isOnlineRef,
    showToast,
  } = deps;

  const handlePersist = useCallback(
    async (publishStatus?: 'draft' | 'published'): Promise<boolean> => {
      if (!activeCollectionId) {
        showToast({
          title: 'Lỗi',
          description: 'Không tìm thấy bộ sưu tập.',
          variant: 'destructive',
        });
        return false;
      }

      if (!isOnlineRef.current) {
        showToast({
          title: 'Offline',
          description: CERTIFICATION_UI_TEXT.editor.offlineSaveError,
          variant: 'destructive',
        });
        saveDraftToStorage({
          collectionId: activeCollectionId,
          details,
          chapters,
          savedAt: Date.now(),
        });
        return false;
      }

      setSyncStatus('retrying');
      try {
        await withRetry(
          () =>
            mutations.updateCollection.mutateAsync({
              collectionId: activeCollectionId,
              ...buildCollectionDetailsPayload(details),
              ...(publishStatus ? { publishStatus } : {}),
              silent: true,
            }),
          RETRY_COUNT,
          RETRY_DELAY_MS,
        );
        await syncChaptersToServer(activeCollectionId, chapters);
        setLastSavedAt(new Date());
        clearDraftFromStorage();
        showToast(
          publishStatus === 'published'
            ? {
                title: 'Đã xuất bản',
                description: 'Bộ sưu tập đã được xuất bản.',
                variant: 'default',
              }
            : {
                title: 'Đã lưu',
                description: 'Bản nháp đã được lưu.',
                variant: 'default',
              },
        );
        return true;
      } catch (err) {
        console.error('[CollectionEditor] Persist failed:', err);
        setSyncStatus('error');
        showToast({
          title: 'Thao tác thất bại',
          description:
            'Có lỗi kết nối xảy ra. Vui lòng kiểm tra lại đường truyền mạng.',
          variant: 'destructive',
        });
        saveDraftToStorage({
          collectionId: activeCollectionId,
          details,
          chapters,
          savedAt: Date.now(),
        });
        return false;
      }
    },
    [
      activeCollectionId,
      details,
      chapters,
      mutations,
      syncChaptersToServer,
      setSyncStatus,
      setLastSavedAt,
      isOnlineRef,
      showToast,
    ],
  );

  return { handlePersist };
}
