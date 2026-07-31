/**
 * Settings & tag handlers — save settings, reset settings, add/remove tags.
 */
import { useCallback } from 'react';
import { withRetry, parseApiDataToState, buildCollectionDetailsPayload } from './collection-editor.helpers';
import type { EditorChapter, CollectionDetailsForm, SyncStatus } from './collection-editor.types';
import type { EditorMutations } from './editor-shared-types';

const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

interface SettingsDeps {
  activeCollectionId: string | null;
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
  apiData: unknown;
  newTagInput: string;
  updateCollection: EditorMutations['updateCollection'];
  setDetails: React.Dispatch<React.SetStateAction<CollectionDetailsForm>>;
  setSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setLastSavedAt: React.Dispatch<React.SetStateAction<Date | null>>;
  refetchAndHydrate: () => Promise<void>;
  takeSnapshot: (d: CollectionDetailsForm, ch: EditorChapter[]) => string;
  lastSyncedSnapshotRef: React.MutableRefObject<string>;
  showToast: (msg: { title: string; description: string; variant: string }) => void;
}

export function useSettingsHandlers(deps: SettingsDeps) {
  const { activeCollectionId, details, chapters, apiData, newTagInput, updateCollection, setDetails, setSyncStatus, setIsDirty, setLastSavedAt, refetchAndHydrate, takeSnapshot, lastSyncedSnapshotRef, showToast } = deps;

  const handleSaveSettings = useCallback(async () => {
    if (!activeCollectionId) {
      showToast({ title: 'Lỗi', description: 'Không tìm thấy bộ sưu tập.', variant: 'destructive' });
      return;
    }
    setSyncStatus('retrying');
    try {
      await withRetry(
        () => updateCollection.mutateAsync({ collectionId: activeCollectionId, ...buildCollectionDetailsPayload(details), silent: true }),
        RETRY_COUNT, RETRY_DELAY_MS,
      );
      await refetchAndHydrate();
      setLastSavedAt(new Date());
      showToast({ title: 'Đã lưu', description: 'Cài đặt đã được lưu thành công.', variant: 'default' as never });
    } catch {
      setSyncStatus('error');
    }
  }, [activeCollectionId, details, updateCollection, refetchAndHydrate, setSyncStatus, setLastSavedAt, showToast]);

  const handleResetSettings = useCallback(() => {
    if (!apiData) return;
    const parsed = parseApiDataToState(apiData);
    setDetails(parsed.details);
    lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, chapters);
    setIsDirty(false);
    setSyncStatus('synced');
  }, [apiData, chapters, takeSnapshot, lastSyncedSnapshotRef, setDetails, setIsDirty, setSyncStatus]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setDetails((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  }, [setDetails]);

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' || !newTagInput.trim()) return;
      e.preventDefault();
      const tag = newTagInput.trim();
      setDetails((prev) => (prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] }));
    },
    [newTagInput, setDetails],
  );

  return { handleSaveSettings, handleResetSettings, handleRemoveTag, handleAddTag };
}
