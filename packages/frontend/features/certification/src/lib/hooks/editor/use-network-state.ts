/**
 * Network & persistence — online/offline, localStorage draft, beforeunload.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { EditorChapter, CollectionDetailsForm } from '../../types/collection-editor.types';
import type { ToastVariant, NetworkDeps } from '../../types/editor-hook.types';
import {
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
} from '../../services/collection-editor-helpers.service';

export type { ToastVariant, NetworkDeps } from '../../types/editor-hook.types';

export function useNetworkState({ activeCollectionId, details, chapters, isDirty, hydratedRef, showToast }: NetworkDeps) {
  // ===== Online/offline =====
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isOnlineRef = useRef(navigator.onLine);
  isOnlineRef.current = isOnline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      isOnlineRef.current = true;
      showToast({ title: 'Đã khôi phục mạng', description: 'Kết nối internet đã trở lại.', variant: 'default' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      isOnlineRef.current = false;
      showToast({ title: 'Mất kết nối', description: 'Bạn đang offline. Thay đổi sẽ được lưu tạm vào trình duyệt.', variant: 'destructive' });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // ===== beforeunload =====
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ===== Auto-save draft when dirty =====
  useEffect(() => {
    if (!hydratedRef.current || !isDirty) return;
    const timer = setTimeout(() => {
      if (activeCollectionId) {
        saveDraftToStorage({ collectionId: activeCollectionId, details, chapters, savedAt: Date.now() });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isDirty, activeCollectionId, details, chapters, hydratedRef]);

  return {
    isOnline,
    isOnlineRef,
    isDirtyRef,
    saveDraftToLocalStorage: useCallback(() => {
      if (activeCollectionId) saveDraftToStorage({ collectionId: activeCollectionId, details, chapters, savedAt: Date.now() });
    }, [activeCollectionId, details, chapters]),
    loadDraftFromLocalStorage: useCallback((collectionId: string) => loadDraftFromStorage(collectionId), []),
    clearDraftFromLocalStorage: clearDraftFromStorage,
  };
}
