/**
 * Collection Editor — orchestrator hook.
 *
 * Composes focused sub-hooks by domain:
 * - use-hydration-handlers: auto-create, hydrate, refetchAndHydrate
 * - use-network-state: online/offline, beforeunload
 * - use-persist-handler: save/publish, isSaving, autosavedText
 * - use-chapter-handlers: chapter CRUD + reorder
 * - use-exam-handlers: exam add/remove/reorder
 * - use-settings-handlers: settings save/reset, tags
 * - use-navigation-handlers: confirm-leave, preview, edit, back
 *
 * Pure functions → collection-editor-helpers.service.ts
 * Types → collection-editor.types.ts
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import {
  useCollectionEditorData,
  useCreateCollection,
  useUpdateCollection,
  useCreateExam,
  useDeleteExam,
  useSyncChapters,
} from '../use-certification';
import type {
  EditorChapter,
  CollectionDetailsForm,
  SyncStatus,
} from '../../types/collection-editor.types';
import { EMPTY_DETAILS } from '../../constants/collection-editor.constants';
import {
  takeSnapshot,
  computeSummary,
  formatAutosaveText,
} from '../../services/collection-editor-helpers.service';

import { useNetworkState } from './use-network-state';
import { useChapterHandlers } from './use-chapter-handlers';
import { useExamHandlers } from './use-exam-handlers';
import { useSettingsHandlers } from './use-settings-handlers';
import { useNavigationHandlers } from './use-navigation-handlers';
import { useAutoCreate, useHydrateEffect, useRefetchAndHydrate } from './use-hydration-handlers';
import { usePersistHandler, computeIsSaving } from './use-persist-handler';

type ShowToast = (msg: { title: string; description: string; variant: string }) => void;

export function useCollectionEditorContainerLogic() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { toast } = useToast();
  const showToast = toast as unknown as ShowToast;

  // ===== React Query =====
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useCollectionEditorData(id || '');
  const createCollectionMutation = useCreateCollection();
  const updateCollectionMutation = useUpdateCollection();
  const createExamMutation = useCreateExam();
  const deleteExamMutation = useDeleteExam();
  const syncChaptersMutation = useSyncChapters();

  // ===== UI state =====
  const [activeTab, setActiveTab] = useState<'Structure' | 'Settings' | 'Collaborators'>('Structure');
  const [activeChapterId, setActiveChapterId] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [confirmDeleteChapterId, setConfirmDeleteChapterId] = useState<string | null>(null);
  const [confirmDeleteExamId, setConfirmDeleteExamId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [details, setDetails] = useState<CollectionDetailsForm>(EMPTY_DETAILS);
  const [chapters, setChapters] = useState<EditorChapter[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // ===== Refs =====
  const createdCollectionIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const creationInitiatedRef = useRef(false);
  const lastSyncedSnapshotRef = useRef('');

  // ===== Derived =====
  const activeCollectionId = id || createdCollectionIdRef.current;
  const activeChapter = chapters.find((ch) => ch.id === activeChapterId) || chapters[0];
  const summary = computeSummary(chapters);

  // ===== Core: syncChaptersToServer =====
  const refetchAndHydrate = useRefetchAndHydrate({
    isEditMode, id, activeChapterId,
    refs: { hydratedRef, lastSyncedSnapshotRef, creationInitiatedRef, createdCollectionIdRef },
    setters: { setDetails, setChapters, setActiveChapterId, setSyncStatus, setIsDirty },
    refetch,
  });

  const syncChaptersToServer = useCallback(
    async (collectionId: string, currentChapters: EditorChapter[]) => {
      await syncChaptersMutation.mutateAsync({
        collectionId,
        chapters: currentChapters.map((ch, i) => ({
          id: ch.id, title: ch.title, description: ch.description || null, order: i + 1, examIds: ch.exams.map((e) => e.id),
        })),
        silent: true,
      });
      await refetchAndHydrate();
    },
    [syncChaptersMutation, refetchAndHydrate],
  );

  // ===== Sub-hook: Network =====
  const network = useNetworkState({ activeCollectionId, details, chapters, isDirty, hydratedRef, showToast });
  const { isOnline, isOnlineRef, isDirtyRef } = network;

  // ===== Sub-hook: Persist =====
  const { handlePersist } = usePersistHandler({
    activeCollectionId, details, chapters,
    mutations: { updateCollection: updateCollectionMutation, syncChapters: syncChaptersMutation },
    syncChaptersToServer, setSyncStatus, setLastSavedAt, isOnlineRef, showToast,
  });

  const isSaving = computeIsSaving({
    isCreatePending: createCollectionMutation.isPending,
    isUpdatePending: updateCollectionMutation.isPending,
    isCreateExamPending: createExamMutation.isPending,
    isDeleteExamPending: deleteExamMutation.isPending,
    isSyncPending: syncChaptersMutation.isPending,
    syncStatus,
  });

  // ===== Sub-hook: Chapters =====
  const chapterHandlers = useChapterHandlers({
    activeCollectionId, activeChapterId, chapters,
    setChapters, setActiveChapterId, setSyncStatus, syncChaptersToServer,
  });

  // ===== Sub-hook: Exams =====
  const examHandlers = useExamHandlers({
    activeCollectionId, activeChapter, chapters,
    mutations: { createExam: createExamMutation, deleteExam: deleteExamMutation },
    setChapters, setSyncStatus, setLastSavedAt,
    syncChaptersToServer, refetchAndHydrate, showToast, navigate,
  });

  // ===== Sub-hook: Settings =====
  const settingsHandlers = useSettingsHandlers({
    activeCollectionId, details, chapters, apiData, newTagInput,
    updateCollection: updateCollectionMutation,
    setDetails, setSyncStatus, setIsDirty, setLastSavedAt,
    refetchAndHydrate, takeSnapshot: (d, ch) => takeSnapshot(d, ch),
    lastSyncedSnapshotRef, showToast,
  });

  // ===== Sub-hook: Navigation =====
  const navigationHandlers = useNavigationHandlers({ activeCollectionId, isDirtyRef, handlePersist, refetchAndHydrate });

  // ===== Effects =====
  useAutoCreate({
    isEditMode, refs: { hydratedRef, lastSyncedSnapshotRef, creationInitiatedRef, createdCollectionIdRef },
    createCollection: (dto) => createCollectionMutation.mutateAsync(dto),
    syncChapters: (dto) => syncChaptersMutation.mutateAsync(dto),
    setSyncStatus, navigate,
  });

  useHydrateEffect({
    isEditMode, id, apiData,
    refs: { hydratedRef, lastSyncedSnapshotRef, creationInitiatedRef, createdCollectionIdRef },
    setters: { setDetails, setChapters, setActiveChapterId, setSyncStatus, setIsDirty },
    showToast,
  });

  // Dirty detection
  useEffect(() => {
    if (!hydratedRef.current || syncStatus === 'syncing') return;
    setIsDirty(takeSnapshot(details, chapters) !== lastSyncedSnapshotRef.current);
  }, [details, chapters, syncStatus]);
  isDirtyRef.current = isDirty;

  // ===== Return =====
  return {
    isApiLoading: (isEditMode ? isApiLoading : false) || createCollectionMutation.isPending,
    isError, refetch, isEditMode, activeCollectionId,
    activeTab, setActiveTab,
    activeChapterId, setActiveChapterId, activeChapter,
    chapters, details, setDetails, summary,
    newTagInput, setNewTagInput,
    isDetailsCollapsed, setIsDetailsCollapsed,
    ...chapterHandlers,
    handleAddExamToChapter: () => setIsAddExamModalOpen(true),
    ...examHandlers,
    handleEditExam: navigationHandlers.handleEditExam,
    ...settingsHandlers,
    handleSaveDraft: navigationHandlers.handleSaveDraft,
    handlePublishCollection: navigationHandlers.handlePublishCollection,
    handlePreviewCollection: navigationHandlers.handlePreviewCollection,
    handleBackToDashboard: navigationHandlers.handleBackToDashboard,
    handleRetrySync: navigationHandlers.handleRetrySync,
    isSaving, autosavedText: formatAutosaveText(lastSavedAt, syncStatus),
    isAddExamModalOpen, setIsAddExamModalOpen,
    confirmDeleteChapterId, setConfirmDeleteChapterId,
    confirmDeleteExamId, setConfirmDeleteExamId,
    isReorderMode, setIsReorderMode,
    syncStatus, isDirty, isOnline,
  };
}
