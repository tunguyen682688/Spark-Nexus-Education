import { useState, useEffect, useRef } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import type { UseFormReturn } from 'react-hook-form';
import type { StudioFormValues } from '../types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseStudioAutosaveOptions {
  form: UseFormReturn<StudioFormValues>;
  dirtyRef: React.MutableRefObject<boolean>;
  draftId: string | null;
  isEditing: boolean;
  onSave: () => void;
}

export function useStudioAutosave({
  form,
  dirtyRef,
  draftId,
  isEditing,
  onSave,
}: UseStudioAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isManualSaveRef = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const debouncedSave = useDebounceCallback(() => {
    if (dirtyRef.current && draftId && isEditing) {
      onSaveRef.current();
    }
  }, 3000);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        dirtyRef.current = true;
        setSaveStatus('saving');
        debouncedSave();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedSave, dirtyRef]);

  return {
    saveStatus,
    setSaveStatus,
    lastSavedAt,
    setLastSavedAt,
    isManualSaveRef,
    debouncedSave,
  };
}
