/**
 * Collection Editor — shared types for sub-hooks.
 *
 * Defines the contract between the orchestrator and each domain sub-hook.
 */
import type { Dispatch, SetStateAction } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { EditorChapter, CollectionDetailsForm, SyncStatus } from './collection-editor.types';

/** Subset of React Query mutations needed by sub-hooks */
export interface EditorMutations {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCollection: UseMutationResult<any, Error, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createExam: UseMutationResult<any, Error, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteExam: UseMutationResult<any, Error, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  syncChapters: UseMutationResult<any, Error, any>;
}

/** Subset of React Query query result */
export interface EditorQuery {
  refetch: () => Promise<{ data: unknown }>;
}

/** Core sync functions shared across sub-hooks */
export interface EditorSync {
  refetchAndHydrate: () => Promise<void>;
  syncChaptersToServer: (collectionId: string, chapters: EditorChapter[]) => Promise<void>;
}

/** State setters that sub-hooks need to mutate */
export interface EditorSetters {
  setChapters: Dispatch<SetStateAction<EditorChapter[]>>;
  setDetails: Dispatch<SetStateAction<CollectionDetailsForm>>;
  setActiveChapterId: Dispatch<SetStateAction<string>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  setLastSavedAt: Dispatch<SetStateAction<Date | null>>;
}
