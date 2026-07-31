/**
 * Collection Editor — logic chính.
 *
 * Hook này chỉ orchestration: gọi React Query hooks, quản lý state, dispatch actions.
 * Pure functions đã tách sang collection-editor.helpers.ts.
 * Types đã tách sang collection-editor.types.ts.
 */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { arrayMove } from '@dnd-kit/sortable';
import {
  useCollectionEditorData,
  useCreateCollection,
  useUpdateCollection,
  useCreateExam,
  useDeleteExam,
  useSyncChapters,
} from '../use-certification';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorChapter, CollectionDetailsForm, SyncStatus, AddExamConfig } from './collection-editor.types';
import { EMPTY_DETAILS } from './collection-editor.types';
import {
  generateId,
  withRetry,
  parseApiDataToState,
  computeDifficultyMix,
  buildChapterPayload,
  buildCollectionDetailsPayload,
  formatAutosaveText,
} from './collection-editor.helpers';

// ===== Retry config =====
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

export function useCollectionEditorContainerLogic() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { toast } = useToast();

  // ===== React Query hooks =====
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

  // ===== Form state =====
  const [details, setDetails] = useState<CollectionDetailsForm>(EMPTY_DETAILS);
  const [chapters, setChapters] = useState<EditorChapter[]>([]);

  // ===== Refs =====
  const createdCollectionIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const creationInitiatedRef = useRef(false);
  const lastSyncedSnapshotRef = useRef<string>('');

  // ===== Derived state =====
  const activeCollectionId = id || createdCollectionIdRef.current;

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapterId) || chapters[0],
    [chapters, activeChapterId],
  );

  const summary = useMemo(() => {
    let totalExams = 0;
    let totalQuestions = 0;
    let totalMinutes = 0;
    chapters.forEach((chapter) => {
      totalExams += chapter.exams.length;
      chapter.exams.forEach((exam) => {
        totalQuestions += exam.questionsCount;
        totalMinutes += exam.durationMinutes;
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return {
      totalChapters: chapters.length,
      totalExams,
      totalQuestions,
      estimatedDurationText: totalMinutes > 0 ? `${hours}h ${mins}m` : '0h 0m',
      difficultyMix: computeDifficultyMix(chapters),
    };
  }, [chapters]);

  const isSaving =
    createCollectionMutation.isPending ||
    updateCollectionMutation.isPending ||
    createExamMutation.isPending ||
    deleteExamMutation.isPending ||
    syncChaptersMutation.isPending ||
    syncStatus === 'syncing' ||
    syncStatus === 'retrying';

  const autosavedText = formatAutosaveText(lastSavedAt, syncStatus);

  // ===== Snapshot helpers (dirty detection) =====
  const takeSnapshot = useCallback(
    (collectionDetail: CollectionDetailsForm, chapters: EditorChapter[]) =>
      JSON.stringify({
        detailCollection: { title: collectionDetail.title, subtitle: collectionDetail.subtitle, description: collectionDetail.description, level: collectionDetail.level, tags: collectionDetail.tags, visibility: collectionDetail.visibility, allowDownloads: collectionDetail.allowDownloads },
        chapters: chapters.map((chapter) => ({ id: chapter.id, title: chapter.title, description: chapter.description, exams: chapter.exams.map((e) => e.id) })),
      }),
    [],
  );

  // ===== Effect 1: Auto-create draft (mount without :id) =====
  useEffect(() => {
    if (isEditMode || creationInitiatedRef.current) return;
    creationInitiatedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const result = await createCollectionMutation.mutateAsync({
          title: 'Untitled Collection',
          description: null,
          silent: true,
        });
        if (cancelled) return;
        createdCollectionIdRef.current = result.id;

        // Sync initial chapter — collection không bao giờ empty trên server
        await syncChaptersMutation.mutateAsync({
          collectionId: result.id,
          chapters: [{ id: crypto.randomUUID(), title: 'Part 1: Getting Started', description: 'Build a strong foundation.', order: 1 }],
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

  // ===== localStorage draft backup =====
  const DRAFT_KEY = 'sne-collection-draft';
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
      // Only use draft if it's less than 24 hours old
      if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
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

  // ===== Effect 2: Hydrate từ API khi có data =====
  useEffect(() => {
    if (!isEditMode || hydratedRef.current || !apiData) return;
    hydratedRef.current = true;
    const parsed = parseApiDataToState(apiData);

    // Check for localStorage draft backup
    const draft = id ? loadDraftFromLocalStorage(id) : null;
    if (draft) {
      setDetails(draft.details);
      setChapters(draft.chapters);
      if (draft.chapters.length > 0) setActiveChapterId(draft.chapters[0].id);
      lastSyncedSnapshotRef.current = takeSnapshot(draft.details, draft.chapters);
      toast({ title: 'Khôi phục bản nháp', description: 'Đã khôi phục thay đổi chưa lưu từ trình duyệt.', variant: 'default' as never });
    } else {
      setDetails(parsed.details);
      setChapters(parsed.chapters);
      if (parsed.chapters.length > 0) setActiveChapterId(parsed.chapters[0].id);
      lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, parsed.chapters);
    }
    setSyncStatus('synced');
  }, [apiData, isEditMode, id, takeSnapshot, loadDraftFromLocalStorage, toast]);

  // ===== Effect 3: Mark dirty khi local state thay đổi =====
  useEffect(() => {
    if (!hydratedRef.current || syncStatus === 'syncing') return;
    setIsDirty(takeSnapshot(details, chapters) !== lastSyncedSnapshotRef.current);
  }, [details, chapters, syncStatus, takeSnapshot]);

  // Track dirty state (separate from effect to avoid stale closure)
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  // ===== Effect: beforeunload — chặn close/refresh khi có thay đổi chưa lưu =====
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

  // ===== Online/offline detection =====
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isOnlineRef = useRef(navigator.onLine);
  isOnlineRef.current = isOnline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      isOnlineRef.current = true;
      toast({ title: 'Đã khôi phục mạng', description: 'Kết nối internet đã trở lại.', variant: 'default' as never });
    };
    const handleOffline = () => {
      setIsOnline(false);
      isOnlineRef.current = false;
      toast({ title: 'Mất kết nối', description: 'Bạn đang offline. Thay đổi sẽ được lưu tạm vào trình duyệt.', variant: 'destructive' });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Auto-save draft to localStorage every time state changes (debounced via effect)
  useEffect(() => {
    if (!hydratedRef.current || !isDirty) return;
    const timer = setTimeout(saveDraftToLocalStorage, 1000);
    return () => clearTimeout(timer);
  }, [isDirty, saveDraftToLocalStorage]);

  // ===== Core: Refetch + hydrate =====
  const refetchAndHydrate = useCallback(async () => {
    const collectionId = isEditMode ? id : createdCollectionIdRef.current;
    if (!collectionId) return;

    setSyncStatus('syncing');
    const timeoutId = setTimeout(() => {
      setSyncStatus((prev) => (prev === 'syncing' ? 'error' : prev));
    }, 30000);

    try {
      const freshData = await refetch();
      clearTimeout(timeoutId);
      if (freshData.data) {
        const parsed = parseApiDataToState(freshData.data);
        setDetails(parsed.details);
        setChapters(parsed.chapters);
        if (parsed.chapters.length > 0) {
          const currentActiveExists = parsed.chapters.some((chapter ) => chapter.id === activeChapterId);
          if (!currentActiveExists) setActiveChapterId(parsed.chapters[0].id);
        }
        lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, parsed.chapters);
        setIsDirty(false);
        setSyncStatus('synced');
      } else {
        setSyncStatus('idle');
      }
    } catch {
      clearTimeout(timeoutId);
      setSyncStatus('error');
    }
  }, [isEditMode, id, refetch, activeChapterId, takeSnapshot]);

  // ===== Core: Sync chapters → refetch =====
  const syncChaptersToServer = useCallback(
    async (collectionId: string, currentChapters: EditorChapter[]) => {
      await syncChaptersMutation.mutateAsync({
        collectionId,
        chapters: buildChapterPayload(currentChapters),
        silent: true,
      });
      await refetchAndHydrate();
    },
    [syncChaptersMutation, refetchAndHydrate],
  );

  // ===== Core: Persist collection (save / publish) =====
  const handlePersist = useCallback(
    async (publishStatus?: 'draft' | 'published'): Promise<boolean> => {
      if (!activeCollectionId) {
        toast({ title: 'Lỗi', description: 'Không tìm thấy bộ sưu tập.', variant: 'destructive' });
        return false;
      }

      if (!isOnlineRef.current) {
        toast({ title: 'Offline', description: 'Không thể lưu khi mất kết nối. Thay đổi đã được lưu tạm vào trình duyệt.', variant: 'destructive' });
        saveDraftToLocalStorage();
        return false;
      }

      setSyncStatus('retrying');
      try {
        await withRetry(
          () =>
            updateCollectionMutation.mutateAsync({
              collectionId: activeCollectionId,
              ...buildCollectionDetailsPayload(details),
              ...(publishStatus ? { publishStatus } : {}),
              silent: true,
            }),
          RETRY_COUNT,
          RETRY_DELAY_MS,
        );
        await syncChaptersToServer(activeCollectionId, chapters);
        setLastSavedAt(new Date());
        clearDraftFromLocalStorage();
        const message = publishStatus === 'published'
          ? CERTIFICATION_UI_TEXT.toast.publishSuccess
          : CERTIFICATION_UI_TEXT.toast.saveDraftSuccess;
        toast(message);
        return true;
      } catch (err) {
        console.error('[CollectionEditor] Persist failed:', err);
        setSyncStatus('error');
        toast(CERTIFICATION_UI_TEXT.toast.errorOccurred);
        saveDraftToLocalStorage();
        return false;
      }
    },
    [activeCollectionId, details, chapters, updateCollectionMutation, syncChaptersToServer, toast, isOnline, saveDraftToLocalStorage, clearDraftFromLocalStorage],
  );

  // ===== Chapter handlers =====
  const handleAddChapter = useCallback(() => {
    if (!activeCollectionId) return;
    const nextNum = chapters.length + 1;
    const newChap: EditorChapter = {
      id: generateId(),
      number: nextNum,
      title: `Part ${nextNum}: New Chapter`,
      description: 'Add essential exams and topic guides for learners.',
      exams: [],
    };
    const updatedChapters = [...chapters, newChap];
    setChapters(updatedChapters);
    setActiveChapterId(newChap.id);
    // Sync to server immediately so exams can reference this chapter
    syncChaptersToServer(activeCollectionId, updatedChapters).catch(() => {
      setSyncStatus('error');
    });
  }, [activeCollectionId, chapters, syncChaptersToServer]);

  const handleUpdateActiveChapterTitle = useCallback(
    (newTitle: string) => setChapters((prev) => prev.map((ch) => (ch.id === activeChapterId ? { ...ch, title: newTitle } : ch))),
    [activeChapterId],
  );

  const handleUpdateActiveChapterDescription = useCallback(
    (newDesc: string) => setChapters((prev) => prev.map((ch) => (ch.id === activeChapterId ? { ...ch, description: newDesc } : ch))),
    [activeChapterId],
  );

  const handleDeleteChapter = useCallback((chapterId: string) => {
    if (!activeCollectionId) return;
    setChapters((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((chapter) => chapter.id !== chapterId).map((chapter, idx) => ({ ...chapter, number: idx + 1 }));
      // Sync to server immediately so deleted chapter is removed from DB
      syncChaptersToServer(activeCollectionId, updated).catch(() => {
        setSyncStatus('error');
      });
      return updated;
    });
    setActiveChapterId((prev) => (prev === chapterId ? '' : prev));
  }, [activeCollectionId, syncChaptersToServer]);

  // ===== Exam handlers =====
  const handleAddExamConfirm = useCallback(
    async (config: AddExamConfig) => {
      if (!activeChapter || !activeCollectionId) {
        toast({ title: 'Lỗi', description: 'Không tìm thấy bộ sưu tập.', variant: 'destructive' });
        return;
      }
      setSyncStatus('retrying');
      try {
        // Sync chapters first — ensures activeChapter exists on server
        // (handleAddChapter syncs immediately but may not have completed yet)
        await syncChaptersToServer(activeCollectionId, chapters);
        await withRetry(
          () =>
            createExamMutation.mutateAsync({
              collectionId: activeCollectionId,
              title: config.title,
              duration: config.duration,
              totalQuestions: config.totalQuestions,
              maxScore: config.maxScore,
              passScore: config.passScore,
              examType: config.examType,
              certificationType: config.certificationType,
              chapterId: activeChapter.id,
              sections: config.sections,
            }),
          RETRY_COUNT,
          RETRY_DELAY_MS,
        );
        await refetchAndHydrate();
        setLastSavedAt(new Date());
      } catch {
        setSyncStatus('error');
      }
    },
    [activeChapter, activeCollectionId, chapters, syncChaptersToServer, createExamMutation, refetchAndHydrate, toast],
  );

  const handleRemoveExamFromChapter = useCallback(
    async (examId: string) => {
      if (!activeCollectionId || !activeChapter) return;
      try {
        await deleteExamMutation.mutateAsync({ examId, collectionId: activeCollectionId });
        await refetchAndHydrate();
      } catch {
        setSyncStatus('error');
      }
    },
    [activeCollectionId, activeChapter, deleteExamMutation, refetchAndHydrate],
  );

  // ===== Exam reorder handler (drag-and-drop) =====
  const handleReorderExams = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!activeChapterId) return;
      setChapters((prev) =>
        prev.map((chapter) => {
          if (chapter.id !== activeChapterId) return chapter;
          const reordered = arrayMove(chapter.exams, oldIndex, newIndex);
          // Update order fields to match new positions
          return {
            ...chapter,
            exams: reordered.map((exam, idx) => ({ ...exam, order: idx, number: idx + 1 })),
          };
        }),
      );
    },
    [activeChapterId],
  );

  // ===== Chapter reorder handler (drag-and-drop) =====
  const handleReorderChapters = useCallback(
    (oldIndex: number, newIndex: number) => {
      setChapters((prev) => {
        const reordered = arrayMove(prev, oldIndex, newIndex);
        return reordered.map((chapter, idx) => ({ ...chapter, number: idx + 1 }));
      });
    },
    [],
  );

  // ===== Tag handlers =====
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setDetails((prev) => ({ ...prev, tags: prev.tags.filter((tags) => tags !== tagToRemove) }));
  }, []);

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' || !newTagInput.trim()) return;
      e.preventDefault();
      const tag = newTagInput.trim();
      setDetails((prev) => (prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] }));
      setNewTagInput('');
    },
    [newTagInput],
  );

  // ===== Settings handlers =====
  const handleSaveSettings = useCallback(async () => {
    if (!activeCollectionId) {
      toast({ title: 'Lỗi', description: 'Không tìm thấy bộ sưu tập.', variant: 'destructive' });
      return;
    }
    setSyncStatus('retrying');
    try {
      await withRetry(
        () =>
          updateCollectionMutation.mutateAsync({
            collectionId: activeCollectionId,
            ...buildCollectionDetailsPayload(details),
            silent: true,
          }),
        RETRY_COUNT,
        RETRY_DELAY_MS,
      );
      await refetchAndHydrate();
      setLastSavedAt(new Date());
      toast({ title: 'Đã lưu', description: 'Cài đặt đã được lưu thành công.', variant: 'default' as never });
    } catch {
      setSyncStatus('error');
    }
  }, [activeCollectionId, details, updateCollectionMutation, refetchAndHydrate, toast]);

  const handleResetSettings = useCallback(() => {
    if (!apiData) return;
    const parsed = parseApiDataToState(apiData);
    setDetails(parsed.details);
    lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, chapters);
    setIsDirty(false);
    setSyncStatus('synced');
  }, [apiData, chapters, takeSnapshot]);

  // ===== Navigation handlers =====
  const handleSaveDraft = useCallback(() => handlePersist(), [handlePersist]);
  const handlePublishCollection = useCallback(() => handlePersist('published'), [handlePersist]);

  /** Retry sync when status is error — gọi từ UI retry button */
  const handleRetrySync = useCallback(async () => {
    if (syncStatus !== 'error') return;
    await refetchAndHydrate();
  }, [syncStatus, refetchAndHydrate]);

  /** Hỏi người dùng trước khi rời đi nếu có thay đổi chưa lưu. Return true = đồng ý rời. */
  const confirmLeave = useCallback(async (): Promise<boolean> => {
    if (!isDirtyRef.current) return true;
    const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi rời đi?');
    if (confirmed) {
      const saved = await handlePersist();
      if (!saved) {
        // Save failed — ask if user still wants to leave
        const leaveAnyway = window.confirm(
          'Lưu thất bại. Dữ liệu đã được lưu tạm vào trình duyệt.\n\nBạn có muốn rời đi không?',
        );
        return leaveAnyway;
      }
    }
    return true;
  }, [handlePersist]);

  const handlePreviewCollection = useCallback(async () => {
    if (await confirmLeave()) {
      if (activeCollectionId) navigate(`/certification/collections/${activeCollectionId}`);
    }
  }, [confirmLeave, activeCollectionId, navigate]);

  const handleEditExam = useCallback(async (examId: string) => {
    if (await confirmLeave()) {
      navigate(`/certification/exam-builder/${examId}`);
    }
  }, [confirmLeave, navigate]);

  const handleBackToDashboard = useCallback(async () => {
    await confirmLeave();
    navigate('/certification/creator-dashboard');
  }, [confirmLeave, navigate]);

  // ===== Return =====
  return {
    // Loading / error
    isApiLoading: (isEditMode ? isApiLoading : false) || createCollectionMutation.isPending,
    isError,
    refetch,
    // Mode
    isEditMode,
    activeCollectionId,
    // Tabs
    activeTab,
    setActiveTab,
    // Chapter
    activeChapterId,
    setActiveChapterId,
    activeChapter,
    chapters,
    // Form
    details,
    setDetails,
    summary,
    newTagInput,
    setNewTagInput,
    isDetailsCollapsed,
    setIsDetailsCollapsed,
    // Handlers — chapter
    handleAddChapter,
    handleUpdateActiveChapterTitle,
    handleUpdateActiveChapterDescription,
    handleDeleteChapter,
    handleReorderChapters,
    // Handlers — exam
    handleAddExamToChapter: () => setIsAddExamModalOpen(true),
    handleAddExamConfirm,
    handleRemoveExamFromChapter,
    handleReorderExams,
    handleEditExam,
    // Handlers — tags
    handleRemoveTag,
    handleAddTag,
    // Handlers — settings
    handleSaveSettings,
    handleResetSettings,
    // Handlers — save / publish / navigate
    handleSaveDraft,
    handlePublishCollection,
    handlePreviewCollection,
    handleBackToDashboard,
    // Handlers — sync
    handleRetrySync,
    // Status
    isSaving,
    autosavedText,
    isAddExamModalOpen,
    setIsAddExamModalOpen,
    syncStatus,
    isDirty,
    isOnline,
  };
}
