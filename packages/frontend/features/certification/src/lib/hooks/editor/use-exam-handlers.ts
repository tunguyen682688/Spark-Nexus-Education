import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { withRetry } from '../../services/collection-editor-helpers.service';
import { CertificationApi } from '../../api/certification-api';
import type { AddExamConfig } from '../../types/collection-editor.types';
import type { ExamDeps } from '../../types/editor-hook.types';
import { RETRY_COUNT, RETRY_DELAY_MS } from '../../constants/editor.constants';

export type { ExamDeps } from '../../types/editor-hook.types';
export { RETRY_COUNT, RETRY_DELAY_MS } from '../../constants/editor.constants';

export type ExamCreationStatus = 'idle' | 'creating' | 'initializing' | 'completed' | 'error';

export interface InitProgress {
  questionsCreated: number;
  totalQuestions: number;
  percentage: number;
  currentSection: string;
  status: string;
  phase?: 'preparing' | 'collecting' | 'inserting' | 'finalizing';
  phaseLabel?: string;
}

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 60;
const MAX_POLL_FAILURES = 3;

export function useExamHandlers(deps: ExamDeps) {
  const { activeCollectionId, activeChapter, chapters, mutations, setChapters, setSyncStatus, setLastSavedAt, syncChaptersToServer, refetchAndHydrate, showToast, navigate } = deps;
  const isAddingExamRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [examCreationStatus, setExamCreationStatus] = useState<ExamCreationStatus>('idle');
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);
  const [failedExamId, setFailedExamId] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState<InitProgress | null>(null);

  // Cleanup polling + completion timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, []);

  const pollInitializationStatus = useCallback(
    async (examId: string, attempts = 0, consecutiveFailures = 0) => {
      if (attempts >= MAX_POLL_ATTEMPTS) {
        setExamCreationStatus('error');
        showToast({ title: 'Timeout', description: 'Khởi tạo câu hỏi quá lâu. Vui lòng tải lại trang.', variant: 'destructive' });
        return;
      }

      try {
        const status = await CertificationApi.getExamInitializationStatus(examId);

        // Reset failure count on success
        consecutiveFailures = 0;

        if (status.progress) {
          setInitProgress(status.progress);
        }

        if (status.initializationStatus === 'completed') {
          // Show final progress briefly before transitioning to completed
          const finalProgress: InitProgress = {
            questionsCreated: status.progress?.totalQuestions ?? 200,
            totalQuestions: status.progress?.totalQuestions ?? 200,
            percentage: 100,
            currentSection: 'Done',
            status: 'completed',
            phase: 'finalizing',
            phaseLabel: 'Hoàn tất!',
          };
          setInitProgress(finalProgress);

          await refetchAndHydrate();

          // Brief delay so user sees the 100% progress bar
          completionTimerRef.current = setTimeout(() => {
            setExamCreationStatus('completed');
            setFailedExamId(null);
            setInitProgress(null);
            completionTimerRef.current = null;
          }, 800);
        } else if (status.initializationStatus === 'failed') {
          setExamCreationStatus('error');
          setFailedExamId(examId);
          showToast({ title: 'Error', description: 'Khởi tạo câu hỏi thất bại. Nhấn Thử lại để khắc phục.', variant: 'destructive' });
        } else {
          pollTimerRef.current = setTimeout(
            () => pollInitializationStatus(examId, attempts + 1, consecutiveFailures),
            POLL_INTERVAL_MS,
          );
        }
      } catch {
        // Transient network error — retry up to MAX_POLL_FAILURES times before giving up
        consecutiveFailures++;
        if (consecutiveFailures >= MAX_POLL_FAILURES) {
          setExamCreationStatus('error');
          setFailedExamId(examId);
          showToast({ title: 'Error', description: 'Mất kết nối server. Vui lòng thử lại.', variant: 'destructive' });
        } else {
          pollTimerRef.current = setTimeout(
            () => pollInitializationStatus(examId, attempts + 1, consecutiveFailures),
            POLL_INTERVAL_MS,
          );
        }
      }
    },
    [refetchAndHydrate, showToast],
  );

  const handleAddExamConfirm = useCallback(
    async (config: AddExamConfig) => {
      if (!activeChapter || !activeCollectionId) {
        showToast({ title: 'Error', description: 'Collection not found.', variant: 'destructive' });
        return;
      }
      if (isAddingExamRef.current) return;
      isAddingExamRef.current = true;

      setExamCreationStatus('creating');
      setCreatedExamId(null);
      setFailedExamId(null);
      setInitProgress(null);
      setSyncStatus('retrying');
      try {
        await syncChaptersToServer(activeCollectionId, chapters);
        const result = await withRetry(
          () => mutations.createExam.mutateAsync({
            collectionId: activeCollectionId, title: config.title, duration: config.duration,
            totalQuestions: config.totalQuestions, maxScore: config.maxScore, passScore: config.passScore,
            examType: config.examType, certificationType: config.certificationType,
            chapterId: activeChapter.id, sections: config.sections,
          }),
          RETRY_COUNT, RETRY_DELAY_MS,
        );
        setLastSavedAt(new Date());
        if (result?.id) {
          setCreatedExamId(result.id);
          if (config.certificationType) {
            setExamCreationStatus('initializing');
            pollInitializationStatus(result.id);
          } else {
            await refetchAndHydrate();
            setExamCreationStatus('completed');
          }
        } else {
          setExamCreationStatus('error');
        }
      } catch {
        setSyncStatus('error');
        setExamCreationStatus('error');
      } finally {
        isAddingExamRef.current = false;
      }
    },
    [activeChapter, activeCollectionId, chapters, mutations, syncChaptersToServer, refetchAndHydrate, setSyncStatus, setLastSavedAt, showToast, pollInitializationStatus],
  );

  const handleNavigateToExam = useCallback(
    (examId: string) => {
      navigate(`/certification/exam-content-editor/${examId}`);
      setTimeout(() => {
        setExamCreationStatus('idle');
        setCreatedExamId(null);
        setInitProgress(null);
        if (pollTimerRef.current) {
          clearTimeout(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }, 100);
    },
    [navigate],
  );

  const handleResetCreationStatus = useCallback(() => {
    setExamCreationStatus('idle');
    setCreatedExamId(null);
    setFailedExamId(null);
    setInitProgress(null);
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleRetryInitialization = useCallback(
    async (examId: string) => {
      try {
        setExamCreationStatus('initializing');
        setFailedExamId(null);
        setInitProgress(null);
        await CertificationApi.retryExamInitialization(examId);
        pollInitializationStatus(examId);
      } catch {
        setExamCreationStatus('error');
        setFailedExamId(examId);
        showToast({ title: 'Error', description: 'Không thể khởi tạo lại. Vui lòng thử sau.', variant: 'destructive' });
      }
    },
    [pollInitializationStatus, showToast],
  );

  const handleRemoveExamFromChapter = useCallback(
    async (examId: string) => {
      if (!activeCollectionId || !activeChapter) return;
      try {
        await mutations.deleteExam.mutateAsync({ examId, collectionId: activeCollectionId });
        await refetchAndHydrate();
      } catch {
        setSyncStatus('error');
      }
    },
    [activeCollectionId, activeChapter, mutations, refetchAndHydrate, setSyncStatus],
  );

  const handleReorderExams = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!activeChapter) return;
      setChapters((prev) =>
        prev.map((chapter) => {
          if (chapter.id !== activeChapter.id) return chapter;
          const reordered = arrayMove(chapter.exams, oldIndex, newIndex);
          return { ...chapter, exams: reordered.map((exam, idx) => ({ ...exam, order: idx, number: idx + 1 })) };
        }),
      );
    },
    [activeChapter, setChapters],
  );

  return {
    handleAddExamConfirm,
    handleNavigateToExam,
    handleResetCreationStatus,
    handleRetryInitialization,
    examCreationStatus,
    createdExamId,
    failedExamId,
    initProgress,
    handleRemoveExamFromChapter,
    handleReorderExams,
  };
}
