/**
 * Hydration & auto-create — initial data load, draft merge, refetch, auto-create draft.
 */
import { useEffect, useCallback } from 'react';
import type { SyncStatus } from '../../types/collection-editor.types';
import type { HydrationSetters, HydrationRefs, ShowToast } from '../../types/editor-hook.types';
import {
  parseApiDataToState,
  takeSnapshot,
  mergeDraftWithApiChapters,
  sanitizeChapterExamIds,
  resolveActiveChapterId,
  loadDraftFromStorage,
  saveDraftToStorage,
  clearDraftFromStorage,
} from '../../services/collection-editor-helpers.service';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export type { HydrationSetters, HydrationRefs, ShowToast } from '../../types/editor-hook.types';

// ===== Hook: Auto-create draft collection =====

export function useAutoCreate(opts: {
  isEditMode: boolean;
  refs: HydrationRefs;
  createCollection: (dto: { title: string; description: string | null; silent: boolean }) => Promise<{ id: string }>;
  syncChapters: (dto: { collectionId: string; chapters: Array<{ id: string; title: string; description: string | null; order: number }>; silent: boolean }) => Promise<unknown>;
  setSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
  navigate: (path: string, opts?: { replace?: boolean }) => void;
}) {
  const { isEditMode, refs, createCollection, syncChapters, setSyncStatus, navigate } = opts;

  useEffect(() => {
    if (isEditMode || refs.creationInitiatedRef.current) return;
    refs.creationInitiatedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const result = await createCollection({
          title: 'Untitled Collection',
          description: null,
          silent: true,
        });
        if (cancelled) return;
        refs.createdCollectionIdRef.current = result.id;

        await syncChapters({
          collectionId: result.id,
          chapters: [
            {
              id: crypto.randomUUID(),
              title: 'Part 1: Getting Started',
              description: 'Build a strong foundation.',
              order: 1,
            },
          ],
          silent: true,
        });
        if (cancelled) return;

        navigate(`/certification/collection-editor/${result.id}`, { replace: true });
      } catch {
        setSyncStatus('error');
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ===== Hook: Hydrate from API + draft =====

export function useHydrateEffect(opts: {
  isEditMode: boolean;
  id: string | undefined;
  apiData: unknown;
  refs: HydrationRefs;
  setters: HydrationSetters;
  showToast: ShowToast;
}) {
  const { isEditMode, id, apiData, refs, setters, showToast } = opts;
  const { setDetails, setChapters, setActiveChapterId, setSyncStatus } = setters;

  useEffect(() => {
    if (!isEditMode || refs.hydratedRef.current || !apiData) return;
    refs.hydratedRef.current = true;

    const parsed = parseApiDataToState(apiData);
    const sanitized = sanitizeChapterExamIds(parsed.chapters);
    const draft = id ? loadDraftFromStorage(id) : null;

    if (draft) {
      // Merge: draft metadata + API exams (exams are server-authoritative)
      const merged = mergeDraftWithApiChapters(draft, sanitized);
      const mergedSanitized = sanitizeChapterExamIds(merged);
      setDetails(draft.details);
      setChapters(mergedSanitized);
      setActiveChapterId(resolveActiveChapterId(mergedSanitized, ''));
      refs.lastSyncedSnapshotRef.current = takeSnapshot(draft.details, mergedSanitized);
      // Persist merged result so stale draft doesn't cause issues on next load
      saveDraftToStorage({ collectionId: id ?? '', details: draft.details, chapters: mergedSanitized, savedAt: Date.now() });
      showToast({
        title: CERTIFICATION_UI_TEXT.editor.draftRestored,
        description: CERTIFICATION_UI_TEXT.editor.draftRestoredDesc,
        variant: 'default',
      });
    } else {
      setDetails(parsed.details);
      setChapters(sanitized);
      setActiveChapterId(resolveActiveChapterId(sanitized, ''));
      refs.lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, sanitized);
    }
    setSyncStatus('synced');
  }, [apiData, isEditMode, id, refs, setters, showToast, setSyncStatus, setDetails, setChapters, setActiveChapterId]);
}

// ===== Hook: Refetch & rehydrate =====

export function useRefetchAndHydrate(  opts: {
  isEditMode: boolean;
  id: string | undefined;
  activeChapterId: string;
  refs: HydrationRefs;
  setters: HydrationSetters;
  refetch: () => Promise<{ data: unknown }>;
}) {
  const { isEditMode, id, activeChapterId, refs, setters, refetch } = opts;
  const { setDetails, setChapters, setActiveChapterId, setSyncStatus, setIsDirty } = setters;

  const refetchAndHydrate = useCallback(async () => {
    const collectionId = isEditMode ? id : refs.createdCollectionIdRef.current;
    if (!collectionId) return;

    setSyncStatus('syncing');
    const timeoutId = setTimeout(
      () => setSyncStatus((prev) => (prev === 'syncing' ? 'error' : prev)),
      30000,
    );

    try {
      const freshData = await refetch();
      clearTimeout(timeoutId);

      if (freshData.data) {
        const parsed = parseApiDataToState(freshData.data);
        const sanitized = sanitizeChapterExamIds(parsed.chapters);
        setDetails(parsed.details);
        setChapters(sanitized);
        setActiveChapterId(resolveActiveChapterId(sanitized, activeChapterId));
        refs.lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, sanitized);
        setIsDirty(false);
        clearDraftFromStorage();
        setSyncStatus('synced');
      } else {
        setSyncStatus('idle');
      }
    } catch {
      clearTimeout(timeoutId);
      setSyncStatus('error');
    }
  }, [isEditMode, id, refs.createdCollectionIdRef, refs.lastSyncedSnapshotRef, setSyncStatus, refetch, setDetails, setChapters, setActiveChapterId, activeChapterId, setIsDirty]);

  return refetchAndHydrate;
}
