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

export type ToastVariant = 'default' | 'destructive';

export interface ChapterDeps {
  activeCollectionId: string | null;
  activeChapterId: string;
  chapters: EditorChapter[];
  setChapters: Dispatch<SetStateAction<EditorChapter[]>>;
  setActiveChapterId: Dispatch<SetStateAction<string>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
  syncChaptersToServer: (collectionId: string, chapters: EditorChapter[]) => Promise<void>;
}

export interface ExamDeps {
  activeCollectionId: string | null;
  activeChapter: EditorChapter | undefined;
  chapters: EditorChapter[];
  mutations: Pick<EditorMutations, 'createExam' | 'deleteExam'>;
  setChapters: Dispatch<SetStateAction<EditorChapter[]>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
  setLastSavedAt: Dispatch<SetStateAction<Date | null>>;
  syncChaptersToServer: (collectionId: string, chapters: EditorChapter[]) => Promise<void>;
  refetchAndHydrate: () => Promise<void>;
  showToast: (msg: { title: string; description: string; variant: string }) => void;
  navigate: (path: string) => void;
}

export interface HydrationSetters {
  setDetails: Dispatch<SetStateAction<CollectionDetailsForm>>;
  setChapters: Dispatch<SetStateAction<EditorChapter[]>>;
  setActiveChapterId: Dispatch<SetStateAction<string>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
}

export interface HydrationRefs {
  hydratedRef: React.MutableRefObject<boolean>;
  lastSyncedSnapshotRef: React.MutableRefObject<string>;
  creationInitiatedRef: React.MutableRefObject<boolean>;
  createdCollectionIdRef: React.MutableRefObject<string | null>;
}

export interface ShowToast {
  (msg: { title: string; description: string; variant: string }): void;
}

export interface NavigationDeps {
  activeCollectionId: string | null;
  isDirtyRef: React.RefObject<boolean>;
  handlePersist: (publishStatus?: 'draft' | 'published') => Promise<boolean>;
  refetchAndHydrate: () => Promise<void>;
}

export interface NetworkDeps {
  activeCollectionId: string | null;
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
  isDirty: boolean;
  hydratedRef: React.RefObject<boolean>;
  showToast: (msg: { title: string; description: string; variant: ToastVariant }) => void;
}

export interface PersistDeps {
  activeCollectionId: string | null;
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
  mutations: {
    updateCollection: EditorMutations['updateCollection'];
    syncChapters: EditorMutations['syncChapters'];
  };
  syncChaptersToServer: (collectionId: string, chapters: EditorChapter[]) => Promise<void>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
  setLastSavedAt: Dispatch<SetStateAction<Date | null>>;
  isOnlineRef: React.RefObject<boolean>;
  showToast: (msg: { title: string; description: string; variant: string }) => void;
}

export interface SettingsDeps {
  activeCollectionId: string | null;
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
  apiData: unknown;
  newTagInput: string;
  updateCollection: EditorMutations['updateCollection'];
  setDetails: Dispatch<SetStateAction<CollectionDetailsForm>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  setLastSavedAt: Dispatch<SetStateAction<Date | null>>;
  refetchAndHydrate: () => Promise<void>;
  takeSnapshot: (d: CollectionDetailsForm, ch: EditorChapter[]) => string;
  lastSyncedSnapshotRef: React.MutableRefObject<string>;
  showToast: (msg: { title: string; description: string; variant: ToastVariant }) => void;
}
