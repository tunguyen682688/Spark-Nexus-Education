/**
 * Network & persistence — online/offline, localStorage draft, beforeunload.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { EditorChapter, CollectionDetailsForm } from './collection-editor.types';

const DRAFT_KEY = 'sne-collection-draft';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface NetworkDeps {
  activeCollectionId: string | null;
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
  isDirty: boolean;
  hydratedRef: React.RefObject<boolean>;
  showToast: (msg: { title: string; description: string; variant: string }) => void;
}

export function useNetworkState({ activeCollectionId, details, chapters, isDirty, hydratedRef, showToast }: NetworkDeps) {
  // ===== Online/offline =====
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isOnlineRef = useRef(navigator.onLine);
  isOnlineRef.current = isOnline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      isOnlineRef.current = true;
      showToast({ title: 'Đã khôi phục mạng', description: 'Kết nối internet đã trở lại.', variant: 'default' as never });
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

  // ===== localStorage draft =====
  const saveDraftToLocalStorage = useCallback(() => {
    if (!activeCollectionId) return;
    try {
      const draft = { collectionId: activeCollectionId, details, chapters, savedAt: Date.now() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch { /* quota exceeded or private browsing */ }
  }, [activeCollectionId, details, chapters]);

  const loadDraftFromLocalStorage = useCallback((collectionId: string) => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const draft = JSON.parse(raw);
      if (draft.collectionId !== collectionId) return null;
      if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  }, []);

  const clearDraftFromLocalStorage = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }, []);

  // Auto-save draft when dirty (debounced)
  useEffect(() => {
    if (!hydratedRef.current || !isDirty) return;
    const timer = setTimeout(saveDraftToLocalStorage, 1000);
    return () => clearTimeout(timer);
  }, [isDirty, saveDraftToLocalStorage, hydratedRef]);

  return {
    isOnline,
    isOnlineRef,
    isDirtyRef,
    saveDraftToLocalStorage,
    loadDraftFromLocalStorage,
    clearDraftFromLocalStorage,
  };
}
