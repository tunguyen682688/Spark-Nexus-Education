import { useEffect, useMemo, useRef } from 'react';
import { debounce, isEqual } from 'lodash';
import type { VocabularySetFormValues } from '../constants/editor';

interface UseEditorAutosaveDeps {
  watch: (callback: (value: any) => void) => { unsubscribe: () => void };
  isImporting: boolean;
  isAppendingRef: React.MutableRefObject<boolean>;
  lastSavedData: React.MutableRefObject<VocabularySetFormValues | undefined>;
  saveDraft: (
    data: VocabularySetFormValues,
    isExplicitPublish?: boolean
  ) => Promise<{ success: boolean; setId?: string }>;
}

export function useEditorAutosave(deps: UseEditorAutosaveDeps) {
  const saveDraftRef = useRef(deps.saveDraft);
  saveDraftRef.current = deps.saveDraft;

  const debouncedSave = useMemo(
    () =>
      debounce((data: VocabularySetFormValues) => {
        saveDraftRef.current(data);
      }, 2000),
    []
  );

  useEffect(() => {
    const subscription = deps.watch((value) => {
      const currentValues = value as VocabularySetFormValues;
      const hasChanges =
        !deps.lastSavedData.current ||
        !isEqual(deps.lastSavedData.current, currentValues);

      if (hasChanges && !deps.isImporting && !deps.isAppendingRef.current) {
        debouncedSave(currentValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [deps.watch, debouncedSave, deps.isImporting, deps.lastSavedData, deps.isAppendingRef]);

  return { debouncedSave };
}
