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
    () => chapters.find((ch) => ch.id === activeChapterId) || chapters[0],
    [chapters, activeChapterId],
  );

  const summary = useMemo(() => {
    let totalExams = 0;
    let totalQuestions = 0;
    let totalMinutes = 0;
    chapters.forEach((ch) => {
      totalExams += ch.exams.length;
      ch.exams.forEach((ex) => {
        totalQuestions += ex.questionsCount;
        totalMinutes += ex.durationMinutes;
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
        detailCollection: { title: collectionDetail.title, subtitle: collectionDetail.subtitle, level: collectionDetail.level, tags: collectionDetail.tags, visibility: collectionDetail.visibility },
        chapters: chapters.map((chapter) => ({ id: chapter.id, title: chapter.title, exams: chapter.exams.map((e) => e.id) })),
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

  // ===== Effect 2: Hydrate từ API khi có data =====
  useEffect(() => {
    if (!isEditMode || hydratedRef.current || !apiData) return;
    hydratedRef.current = true;
    const parsed = parseApiDataToState(apiData);
    setDetails(parsed.details);
    setChapters(parsed.chapters);
    if (parsed.chapters.length > 0) setActiveChapterId(parsed.chapters[0].id);
    lastSyncedSnapshotRef.current = takeSnapshot(parsed.details, parsed.chapters);
    setSyncStatus('synced');
  }, [apiData, isEditMode, takeSnapshot]);

  // ===== Effect 3: Mark dirty khi local state thay đổi =====
  useEffect(() => {
    if (!hydratedRef.current || syncStatus === 'syncing') return;
    setIsDirty(takeSnapshot(details, chapters) !== lastSyncedSnapshotRef.current);
  }, [details, chapters, syncStatus, takeSnapshot]);

  // Track dirty state (separate from effect to avoid stale closure)
  const [isDirty, setIsDirty] = useState(false);

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
    async (publishStatus?: 'draft' | 'published') => {
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
              ...(publishStatus ? { publishStatus } : {}),
              silent: true,
            }),
          RETRY_COUNT,
          RETRY_DELAY_MS,
        );
        await syncChaptersToServer(activeCollectionId, chapters);
        setLastSavedAt(new Date());
        const message = publishStatus === 'published'
          ? CERTIFICATION_UI_TEXT.toast.publishSuccess
          : CERTIFICATION_UI_TEXT.toast.saveDraftSuccess;
        toast(message);
      } catch {
        setSyncStatus('error');
      }
    },
    [activeCollectionId, details, chapters, updateCollectionMutation, syncChaptersToServer, toast],
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
        prev.map((ch) => {
          if (ch.id !== activeChapterId) return ch;
          const reordered = arrayMove(ch.exams, oldIndex, newIndex);
          // Update order fields to match new positions
          return {
            ...ch,
            exams: reordered.map((ex, idx) => ({ ...ex, order: idx, number: idx + 1 })),
          };
        }),
      );
    },
    [activeChapterId],
  );

  // ===== Tag handlers =====
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setDetails((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
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

  // ===== Navigation handlers =====
  const handleSaveDraft = useCallback(() => handlePersist(), [handlePersist]);
  const handlePublishCollection = useCallback(() => handlePersist('published'), [handlePersist]);
  const handlePreviewCollection = useCallback(() => { if (activeCollectionId) navigate(`/certification/collections/${activeCollectionId}`); }, [activeCollectionId, navigate]);
  const handleEditExam = useCallback((examId: string) => navigate(`/certification/exam-builder/${examId}`), [navigate]);

  const handleBackToDashboard = useCallback(async () => {
    if (isDirty) {
      const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi rời đi?');
      if (confirmed) {
        try { await handlePersist(); } catch { /* navigate anyway */ }
      }
    }
    navigate('/certification/creator-dashboard');
  }, [isDirty, handlePersist, navigate]);

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
    // Handlers — exam
    handleAddExamToChapter: () => setIsAddExamModalOpen(true),
    handleAddExamConfirm,
    handleRemoveExamFromChapter,
    handleReorderExams,
    handleEditExam,
    // Handlers — tags
    handleRemoveTag,
    handleAddTag,
    // Handlers — save / publish / navigate
    handleSaveDraft,
    handlePublishCollection,
    handlePreviewCollection,
    handleBackToDashboard,
    // Status
    isSaving,
    autosavedText,
    isAddExamModalOpen,
    setIsAddExamModalOpen,
    syncStatus,
    isDirty,
  };
}
