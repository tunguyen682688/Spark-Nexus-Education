/**
 * Collection Editor — orchestrator hook.
 *
 * Composes focused sub-hooks by domain. Each sub-hook handles a single concern:
 * - editor-network: online/offline, localStorage, beforeunload
 * - editor-chapters: chapter CRUD + reorder
 * - editor-exams: exam add/remove/reorder
 * - editor-settings: settings save/reset, tags
 * - editor-navigation: save/publish/leave/preview/edit
 *
 * Pure functions → collection-editor.helpers.ts
 * Types → collection-editor.types.ts
 */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import type { EditorChapter, CollectionDetailsForm, SyncStatus } from './collection-editor.types';
import { EMPTY_DETAILS } from './collection-editor.types';
import { parseApiDataToState, computeDifficultyMix, buildChapterPayload, buildCollectionDetailsPayload, formatAutosaveText, withRetry } from './collection-editor.helpers';

import { useNetworkState } from './editor-network';
import { useChapterHandlers } from './editor-chapters';
import { useExamHandlers } from './editor-exams';
import { useSettingsHandlers } from './editor-settings';
import { useNavigationHandlers } from './editor-navigation';

const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

/** Widen toast type so sub-hooks accept it without variant literal errors */
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
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [details, setDetails] = useState<CollectionDetailsForm>(EMPTY_DETAILS);
  const [chapters, setChapters] = useState<EditorChapter[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // ===== Refs =====
  const createdCollectionIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const creationInitiatedRef = useRef(false);
  const lastSyncedSnapshotRef = useRef<string>('');

  // ===== Derived =====
  const activeCollectionId = id || createdCollectionIdRef.current;
  const activeChapter = useMemo(() => chapters.find((ch) => ch.id === activeChapterId) || chapters[0], [chapters, activeChapterId]);

  const summary = useMemo(() => {
    let totalExams = 0, totalQuestions = 0, totalMinutes = 0;
    chapters.forEach((ch) => { totalExams += ch.exams.length; ch.exams.forEach((ex) => { totalQuestions += ex.questionsCount; totalMinutes += ex.durationMinutes; }); });
    const hours = Math.floor(totalMinutes / 60), mins = totalMinutes % 60;
    return { totalChapters: chapters.length, totalExams, totalQuestions, estimatedDurationText: totalMinutes > 0 ? `${hours}h ${mins}m` : '0h 0m', difficultyMix: computeDifficultyMix(chapters) };
  }, [chapters]);

  const isSaving = createCollectionMutation.isPending || updateCollectionMutation.isPending || createExamMutation.isPending || deleteExamMutation.isPending || syncChaptersMutation.isPending || syncStatus === 'syncing' || syncStatus === 'retrying';
  const autosavedText = formatAutosaveText(lastSavedAt, syncStatus);

  // ===== Snapshot =====
  const takeSnapshot = useCallback(
    (d: CollectionDetailsForm, ch: EditorChapter[]) =>
      JSON.stringify({
        detailCollection: { title: d.title, subtitle: d.subtitle, description: d.description, level: d.level, tags: d.tags, visibility: d.visibility, allowDownloads: d.allowDownloads },
        chapters: ch.map((c) => ({ id: c.id, title: c.title, description: c.description, exams: c.exams.map((e) => e.id) })),
      }),
    [],
  );

  // ===== Effect 1: Auto-create draft =====
  useEffect(() => {
    if (isEditMode || creationInitiatedRef.current) return;
    creationInitiatedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const result = await createCollectionMutation.mutateAsync({ title: 'Untitled Collection', description: null, silent: true });
        if (cancelled) return;
        createdCollectionIdRef.current = result.id;
        await syncChaptersMutation.mutateAsync({ collectionId: result.id, chapters: [{ id: crypto.randomUUID(), title: 'Part 1: Getting Started', description: 'Build a strong foundation.', order: 1 }], silent: true });
        if (cancelled) return;
        navigate(`/certification/collection-editor/${result.id}`, { replace: true });
      } catch { setSyncStatus('error'); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Core: refetchAndHydrate =====
  const refetchAndHydrate = useCallback(async () => {
    const collectionId = isEditMode ? id : createdCollectionIdRef.current;
    if (!collectionId) return;
    setSyncStatus('syncing');
    const timeoutId = setTimeout(() => setSyncStatus((prev) => (prev === 'syncing' ? 'error' : prev)), 30000);
    try {
      const freshData = await refetch();
      clearTimeout(timeoutId);
      if (freshData.data) {
        const parsed = parseApiDataToState(freshData.data);
        setDetails(parsed.details);
        setChapters(parsed.chapters);
        if (parsed.chapters.length > 0) {
          if (!parsed.chapters.some((ch) => ch.id === activeChapterId)) setActiveChapterId(parsed.chapters[0].id);
        }
        lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, parsed.chapters);
        setIsDirty(false);
        setSyncStatus('synced');
      } else { setSyncStatus('idle'); }
    } catch { clearTimeout(timeoutId); setSyncStatus('error'); }
  }, [isEditMode, id, refetch, activeChapterId, takeSnapshot]);

  // ===== Core: syncChaptersToServer =====
  const syncChaptersToServer = useCallback(async (collectionId: string, currentChapters: EditorChapter[]) => {
    await syncChaptersMutation.mutateAsync({ collectionId, chapters: buildChapterPayload(currentChapters), silent: true });
    await refetchAndHydrate();
  }, [syncChaptersMutation, refetchAndHydrate]);

  // ===== Sub-hook: Network (must be before handlePersist) =====
  const network = useNetworkState({ activeCollectionId, details, chapters, isDirty, hydratedRef, showToast });
  const { isOnline, isOnlineRef, isDirtyRef, saveDraftToLocalStorage, loadDraftFromLocalStorage, clearDraftFromLocalStorage } = network;

  // ===== Core: handlePersist =====
  const handlePersist = useCallback(async (publishStatus?: 'draft' | 'published'): Promise<boolean> => {
    if (!activeCollectionId) { showToast({ title: 'Lỗi', description: 'Không tìm thấy bộ sưu tập.', variant: 'destructive' }); return false; }
    if (!isOnlineRef.current) {
      showToast({ title: 'Offline', description: 'Không thể lưu khi mất kết nối. Thay đổi đã được lưu tạm vào trình duyệt.', variant: 'destructive' });
      saveDraftToLocalStorage();
      return false;
    }
    setSyncStatus('retrying');
    try {
      await withRetry(() => updateCollectionMutation.mutateAsync({ collectionId: activeCollectionId, ...buildCollectionDetailsPayload(details), ...(publishStatus ? { publishStatus } : {}), silent: true }), RETRY_COUNT, RETRY_DELAY_MS);
      await syncChaptersToServer(activeCollectionId, chapters);
      setLastSavedAt(new Date());
      clearDraftFromLocalStorage();
      showToast(publishStatus === 'published' ? { title: 'Đã xuất bản', description: 'Bộ sưu tập đã được xuất bản.', variant: 'default' } : { title: 'Đã lưu', description: 'Bản nháp đã được lưu.', variant: 'default' });
      return true;
    } catch (err) {
      console.error('[CollectionEditor] Persist failed:', err);
      setSyncStatus('error');
      showToast({ title: 'Thao tác thất bại', description: 'Có lỗi kết nối xảy ra. Vui lòng kiểm tra lại đường truyền mạng.', variant: 'destructive' });
      saveDraftToLocalStorage();
      return false;
    }
  }, [activeCollectionId, details, chapters, updateCollectionMutation, syncChaptersToServer, showToast, isOnlineRef, saveDraftToLocalStorage, clearDraftFromLocalStorage]);

  // ===== Sub-hook: Chapters =====
  const chapterHandlers = useChapterHandlers({ activeCollectionId, activeChapterId, chapters, setChapters, setActiveChapterId, setSyncStatus, syncChaptersToServer });

  // ===== Sub-hook: Exams =====
  const examHandlers = useExamHandlers({ activeCollectionId, activeChapter, chapters, mutations: { createExam: createExamMutation, deleteExam: deleteExamMutation }, setChapters, setSyncStatus, setLastSavedAt, syncChaptersToServer, refetchAndHydrate, showToast });

  // ===== Sub-hook: Settings =====
  const settingsHandlers = useSettingsHandlers({ activeCollectionId, details, chapters, apiData, newTagInput, updateCollection: updateCollectionMutation, setDetails, setSyncStatus, setIsDirty, setLastSavedAt, refetchAndHydrate, takeSnapshot, lastSyncedSnapshotRef, showToast });

  // ===== Sub-hook: Navigation =====
  const navigationHandlers = useNavigationHandlers({ activeCollectionId, isDirtyRef, handlePersist, refetchAndHydrate });

  // ===== Effect 2: Hydrate =====
  useEffect(() => {
    if (!isEditMode || hydratedRef.current || !apiData) return;
    hydratedRef.current = true;
    const parsed = parseApiDataToState(apiData);
    const draft = id ? loadDraftFromLocalStorage(id) : null;
    if (draft) {
      setDetails(draft.details); setChapters(draft.chapters);
      if (draft.chapters.length > 0) setActiveChapterId(draft.chapters[0].id);
      lastSyncedSnapshotRef.current = takeSnapshot(draft.details, draft.chapters);
      showToast({ title: 'Khôi phục bản nháp', description: 'Đã khôi phục thay đổi chưa lưu từ trình duyệt.', variant: 'default' });
    } else {
      setDetails(parsed.details); setChapters(parsed.chapters);
      if (parsed.chapters.length > 0) setActiveChapterId(parsed.chapters[0].id);
      lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, parsed.chapters);
    }
    setSyncStatus('synced');
  }, [apiData, isEditMode, id, takeSnapshot, loadDraftFromLocalStorage, showToast]);

  // ===== Effect 3: Dirty detection =====
  useEffect(() => {
    if (!hydratedRef.current || syncStatus === 'syncing') return;
    setIsDirty(takeSnapshot(details, chapters) !== lastSyncedSnapshotRef.current);
  }, [details, chapters, syncStatus, takeSnapshot]);
  isDirtyRef.current = isDirty;

  // ===== Return =====
  return {
    isApiLoading: (isEditMode ? isApiLoading : false) || createCollectionMutation.isPending,
    isError, refetch,
    isEditMode, activeCollectionId,
    activeTab, setActiveTab,
    activeChapterId, setActiveChapterId, activeChapter, chapters,
    details, setDetails, summary,
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
    isSaving, autosavedText,
    isAddExamModalOpen, setIsAddExamModalOpen,
    syncStatus, isDirty, isOnline,
  };
}
