import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ExamContentState,
  ExamSectionContent,
  ExamSectionQuestion,
  ExamContentSettings,
} from '../../../types/exam-content-editor.types';
import { EXAM_TEMPLATES } from '../../../types/exam-templates.data';
import { ExamApi } from '../../../api/exam-api';
import { certificationKeys } from '../../../constants/query-key-factory';
import { STALE_TIME_SESSION } from '../../../constants/query-cache-times.constants';
import {
  validateSections,
  mapDirtyQuestionsToPayload,
  mapDirtySectionsToPayload,
  hashQuestion,
  isTempId,
} from '../../../services/exam-content-helpers.service';
import { invalidateExamBuilderCache } from '../../../services/exam-content-cache-helpers.service';

interface ToastFn {
  (props: {
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }): void;
}

interface UseExamContentEditorLogicProps {
  examId: string;
  toast: ToastFn;
}

export interface UseExamContentEditorLogicReturn {
  state: ExamContentState;
  navigation: {
    selectedSectionId: string;
    selectedQuestionId: string;
    selectedSection: ExamSectionContent | undefined;
    selectedQuestion: ExamSectionQuestion | undefined;
    selectedQuestionIndex: number;
    totalQuestions: number;
  };
  handlers: {
    handleUpdateSection: (
      sectionId: string,
      updates: Partial<ExamSectionContent>
    ) => void;
    handleUpdateQuestion: (
      sectionId: string,
      questionId: string,
      updates: Partial<ExamSectionQuestion>
    ) => void;
    handleUpdateGroupPassage: (
      sectionId: string,
      passageGroupId: string,
      passageText: string
    ) => void;
    handleUpdateSettings: (updates: Partial<ExamContentSettings>) => void;
    handleDeleteQuestion: (sectionId: string, questionId: string) => void;
    handleSave: () => void;
    handlePublish: () => void;
    handleSelectSection: (sectionId: string) => void;
    handleSelectQuestion: (sectionId: string, questionId: string) => void;
    handleNavigatePrev: () => void;
    handleNavigateNext: () => void;
  };
  isLoading: boolean;
  isLoadingQuestions: boolean;
  hasExamData: boolean;
  isError: boolean;
}

const INITIAL_SETTINGS: ExamContentSettings = {
  title: '',
  description: '',
  level: 'Intermediate',
  language: 'en',
  passingScore: 60,
  maxScore: 100,
  examType: 'FULL_MOCK',
  certificationType: 'IELTS',
  duration: 120,
};

const createEmptyState = (): ExamContentState => ({
  exam: { ...INITIAL_SETTINGS },
  sections: [],
  isDirty: false,
  isSaving: false,
  dirtyQuestionIds: new Set(),
  dirtySectionIds: new Set(),
  dirtyExamSettings: false,
});

// ─── Part-specific question defaults ──────────────────────────────────────────
const PART_QUESTION_DEFAULTS: Record<
  number,
  { questionType: string; optionsCount: number }
> = {
  1: { questionType: 'photograph_choice', optionsCount: 4 },
  2: { questionType: 'question_response', optionsCount: 3 },
  3: { questionType: 'conversation_mc', optionsCount: 4 },
  4: { questionType: 'short_talk_mc', optionsCount: 4 },
  5: { questionType: 'incomplete_sentence', optionsCount: 4 },
  6: { questionType: 'text_completion', optionsCount: 4 },
  7: { questionType: 'reading_comprehension_single', optionsCount: 4 },
};

function createDefaultOptions(count: number) {
  const rand = Math.random().toString(36).slice(2, 6);
  return Array.from({ length: count }, (_, i) => ({
    id: `opt-${Date.now()}-${rand}-${i}`,
    label: String.fromCharCode(65 + i),
    text: '',
    isCorrect: false,
  }));
}

/** Map builder API response to ExamContentState (with questions if available) */
function mapBuilderDataToState(data: {
  title: string;
  description: string;
  settings?: {
    level?: string | null;
    language?: string | null;
    passingScore?: number | null;
    maxScore?: number | null;
    certificationType?: string | null;
  };
  durationMinutes: number;
  totalQuestions: number;
  status?: string;
  examType?: string;
  certificationType?: string | null;
  sections?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    instruction?: string;
    sectionType: string;
    number: number;
    durationMinutes?: number;
    questionCount?: number;
    isBreak?: boolean;
    audioUrl?: string;
    scriptText?: string;
    passageText?: string;
    passageTitle?: string;
    passageType?: string;
    questions?: Array<{
      id: string;
      title?: string;
      questionText?: string;
      type?: string;
      questionType?: string;
      difficulty?: string;
      points?: number;
      explanation?: string;
      imageUrl?: string;
      audioUrl?: string;
      passageGroupId?: string;
      passageText?: string;
      passageType?: string;
      blankNumber?: number;
      blankIndex?: number;
      subQuestionNumber?: number;
      estimatedTime?: number;
      choices?: Array<{
        id: string;
        label?: string;
        choiceKey?: string;
        text?: string;
        content?: string;
        isCorrect?: boolean;
      }>;
      options?: Array<{
        id: string;
        label: string;
        text: string;
        isCorrect: boolean;
      }>;
    }>;
  }>;
}): ExamContentState {
  const certType =
    data.settings?.certificationType || data.certificationType || 'IELTS';
  const matchingTemplate = EXAM_TEMPLATES.find(
    (t) => t.certificationType === certType
  );
  const isFixedStructure = matchingTemplate?.isFixedStructure ?? false;

  const sections: ExamSectionContent[] = (data.sections || []).map(
    (s, idx) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle ?? undefined,
      sectionType: s.sectionType as ExamSectionContent['sectionType'],
      instruction: s.instruction ?? undefined,
      order: s.number ?? idx + 1,
      durationMinutes: s.durationMinutes || 0,
      questionCount: s.questionCount ?? s.questions?.length ?? 0,
      isBreak: s.isBreak || false,
      audioUrl: s.audioUrl || undefined,
      scriptText: s.scriptText || undefined,
      passageText: s.passageText || undefined,
      passageTitle: s.passageTitle || undefined,
      passageType: s.passageType || undefined,
      questions: (s.questions || []).map((q, qIdx) => ({
        id: q.id,
        order: qIdx + 1,
        questionType: q.type || q.questionType || 'mc',
        questionText: q.title || q.questionText || '',
        difficulty:
          (q.difficulty as ExamSectionQuestion['difficulty']) || 'Medium',
        options: (q.choices || q.options || []).map((opt) => {
          const o = opt as Record<string, unknown>;
          return {
            id: o.id as string,
            label: (o.label as string) || (o.choiceKey as string) || '',
            text: (o.text as string) || (o.content as string) || '',
            isCorrect: (o.isCorrect as boolean) ?? false,
          };
        }),
        explanation: q.explanation ?? undefined,
        points: q.points || 1,
        estimatedTime: q.estimatedTime ?? undefined,
        audioUrl: q.audioUrl ?? undefined,
        imageUrl: q.imageUrl ?? undefined,
        passageGroupId: q.passageGroupId ?? undefined,
        passageText: q.passageText ?? undefined,
        passageType: q.passageType ?? undefined,
        blankIndex: q.blankIndex ?? q.blankNumber ?? undefined,
        subQuestionNumber: q.subQuestionNumber ?? undefined,
        status: 'Saved' as const,
      })),
      status: 'Saved' as const,
    })
  );

  return {
    exam: {
      title: data.title,
      description: data.description,
      level: data.settings?.level || 'Intermediate',
      language: data.settings?.language || 'en',
      passingScore: data.settings?.passingScore || 60,
      maxScore: data.settings?.maxScore || 100,
      examType: data.examType || 'FULL_MOCK',
      certificationType: certType,
      duration: data.durationMinutes,
    },
    sections,
    isDirty: false,
    isSaving: false,
    isFixedStructure,
    publishStatus: data.status === 'Published' ? 'published' : 'draft',
  };
}

/** Map API title-cased question type back to internal lowercase type */
function mapApiTypeToInternalType(apiType: string): string {
  const typeMap: Record<string, string> = {
    'Multiple Choice': 'mc',
    'Single Choice': 'mc',
    'Fill in Blank': 'fill_in_blank',
    Essay: 'essay',
  };
  return typeMap[apiType] || apiType;
}

/** Derive part number from section title like "Part 7: Reading Comprehension" */
function derivePartNumberFromTitle(title: string): number {
  const match = title.match(/Part\s+(\d)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/** Map section questions API response to ExamSectionQuestion[] */
function mapSectionQuestionsToState(
  questions: Array<{
    id: string;
    examQuestionId: string;
    number: number;
    title: string;
    partTag: string;
    type: string;
    difficulty: string;
    points: number;
    imageUrl: string | null;
    audioUrl: string | null;
    passageId: string | null;
    passageText: string | null;
    modelAnswer: string | null;
    explanation: string | null;
    estimatedTime: number | null;
    metadataPoints: number | null;
    partNumber: number | null;
    passageGroupId: string | null;
    passageType: string | null;
    passageTitle: string | null;
    blankNumber: number | null;
    subQuestionNumber: number | null;
    formatMetadata: unknown | null;
    choices?: Array<{ id: string; content: string; isCorrect: boolean; order: number }> | null;
  }>,
  sectionTitle = ''
): ExamSectionQuestion[] {
  const sectionPartNum = derivePartNumberFromTitle(sectionTitle);
  return questions.map((q) => {
    const partNum = q.partNumber || sectionPartNum;
    const partDefaults = PART_QUESTION_DEFAULTS[partNum] || {
      questionType: 'mc',
      optionsCount: 4,
    };

    // Prefer choices from QuestionChoice table (from API), fallback to formatMetadata.choices
    let options: ExamSectionQuestion['options'];
    if (q.choices && q.choices.length > 0) {
      options = q.choices.map((c, i) => ({
        id: c.id || `opt-${q.examQuestionId}-${i}`,
        label: String.fromCharCode(65 + i),
        text: c.content,
        isCorrect: c.isCorrect,
      }));
    } else {
      const meta = q.formatMetadata as Record<string, unknown> | null;
      const metaChoices = meta?.choices as
        | Array<{ content: string; isCorrect?: boolean; correct?: boolean }>
        | undefined;
      options = metaChoices
        ? metaChoices.map((c, i) => ({
            id: `opt-${q.examQuestionId}-${i}`,
            label: String.fromCharCode(65 + i),
            text: c.content,
            isCorrect: c.isCorrect ?? c.correct ?? false,
          }))
        : createDefaultOptions(partDefaults.optionsCount);
    }

    return {
      id: q.examQuestionId,
      order: q.number,
      questionType:
        mapApiTypeToInternalType(q.type) || partDefaults.questionType,
      questionText: q.title || '',
      difficulty:
        (q.difficulty as ExamSectionQuestion['difficulty']) || 'Medium',
      options,
      modelAnswer: q.modelAnswer || undefined,
      explanation: q.explanation || undefined,
      points: q.metadataPoints || q.points || 1,
      estimatedTime: q.estimatedTime || undefined,
      audioUrl: q.audioUrl || undefined,
      imageUrl: q.imageUrl || undefined,
      passageGroupId: q.passageGroupId || q.passageId || undefined,
      passageText: q.passageText || undefined,
      passageType: q.passageType || undefined,
      passageTitle: q.passageTitle || undefined,
      blankIndex: q.blankNumber || undefined,
      subQuestionNumber: q.subQuestionNumber || undefined,
      status: 'Saved' as const,
    };
  });
}

export function useExamContentEditorLogic({
  examId,
  toast,
}: UseExamContentEditorLogicProps): UseExamContentEditorLogicReturn {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ExamContentState>(createEmptyState);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [lazyLoadedSections, setLazyLoadedSections] = useState<Set<string>>(
    new Set()
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  // Snapshot of last-saved question data — used to skip unchanged questions on next save
  const lastSavedSnapshotRef = useRef<Map<string, string>>(new Map());
  const saveInProgressRef = useRef(false);
  /** Dirty flags at save-start — only clear these in onSuccess to preserve mid-save edits */
  const saveStartDirtyRef = useRef<{
    questionIds: Set<string>;
    sectionIds: Set<string>;
    examSettings: boolean;
    deletedIds: Set<string>;
  }>({ questionIds: new Set(), sectionIds: new Set(), examSettings: false, deletedIds: new Set() });

  // ─── React Query: Fetch exam builder data ────────────────────────────────
  const {
    data: apiData,
    isLoading: isFetching,
    isError: isQueryError,
  } = useQuery({
    queryKey: certificationKeys.examContent.builder(examId),
    queryFn: () => ExamApi.getExamBuilderData(examId),
    enabled: Boolean(examId),
    staleTime: STALE_TIME_SESSION,
    gcTime: 10 * 60 * 1000, // Keep exam data in cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  // Initialize state from API data (once)
  useEffect(() => {
    if (apiData && !initialized) {
      const newState = mapBuilderDataToState(apiData);
      setState(newState);
      // Initialize snapshot from loaded data
      const snapshot = new Map<string, string>();
      for (const section of newState.sections) {
        for (const q of section.questions) {
          snapshot.set(q.id, hashQuestion(q));
        }
      }
      lastSavedSnapshotRef.current = snapshot;
      setInitialized(true);
    }
  }, [apiData, initialized]);

  // Auto-init REMOVED: Backend handles question initialization idempotently
  // in the builder endpoint (GET /exams/:id/builder). When sections exist but
  // have no questions, the backend creates them before returning the response.
  // This eliminates the race condition between frontend auto-init and backend init.

  // Determine if exam has content: show editor if sections exist (regardless of question count)
  // Template selector only shows for truly empty exams (no sections at all)
  const hasExamData = state.sections.length > 0;

  // ─── Lazy-load questions for selected section if not loaded from builder ─
  const selectedSection =
    state.sections.find((s) => s.id === selectedSectionId) || state.sections[0];
  const effectiveSectionId = selectedSection?.id || '';

  const needsLazyLoad =
    hasExamData &&
    effectiveSectionId &&
    selectedSection &&
    selectedSection.questions.length === 0 &&
    (selectedSection.questionCount || 0) > 0 &&
    !lazyLoadedSections.has(effectiveSectionId);

  const { data: sectionQuestionsData, isLoading: isLoadingQuestions } =
    useQuery({
      queryKey: certificationKeys.exams.sectionQuestions(
        examId,
        effectiveSectionId
      ),
      queryFn: () =>
        ExamApi.getSectionQuestions(examId, effectiveSectionId, {
          pageSize: 200,
        }),
      enabled: Boolean(needsLazyLoad),
      staleTime: STALE_TIME_SESSION,
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
      retry: 1,
    });

  // Merge lazily loaded questions into state
  useEffect(() => {
    if (sectionQuestionsData?.questions && effectiveSectionId) {
      const sectionTitle =
        stateRef.current.sections.find((s) => s.id === effectiveSectionId)
          ?.title || '';
      const questions = mapSectionQuestionsToState(
        sectionQuestionsData.questions,
        sectionTitle
      );
      setLazyLoadedSections((prev) => new Set(prev).add(effectiveSectionId));

      // Update snapshot with newly loaded questions
      for (const q of questions) {
        lastSavedSnapshotRef.current.set(q.id, hashQuestion(q));
      }

      setState((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== effectiveSectionId || s.questions.length !== 0) return s;
          return {
            ...s,
            questions,
          };
        }),
      }));
    }
  }, [sectionQuestionsData, effectiveSectionId]);

  // Navigation state
  const selectedQuestion =
    selectedSection?.questions.find((q) => q.id === selectedQuestionId) ||
    selectedSection?.questions[0];
  const selectedQuestionIndex = selectedSection
    ? selectedSection.questions.findIndex(
        (q) => q.id === (selectedQuestion?.id || '')
      )
    : 0;
  const totalQuestions = selectedSection?.questions.length || 0;

  // Auto-select first section when initialized
  useEffect(() => {
    if (state.sections.length > 0 && !selectedSectionId) {
      const firstSection = state.sections[0];
      setSelectedSectionId(firstSection.id);
      if (firstSection.questions.length > 0) {
        setSelectedQuestionId(firstSection.questions[0].id);
      }
    }
  }, [state.sections, selectedSectionId]);

  // When section changes, select first question
  useEffect(() => {
    const section = stateRef.current.sections.find(
      (s) => s.id === effectiveSectionId
    );
    if (
      effectiveSectionId &&
      section &&
      section.questions.length > 0 &&
      !selectedQuestionId
    ) {
      setSelectedQuestionId(section.questions[0].id);
    }
    if (
      effectiveSectionId &&
      section &&
      section.questions.length > 0 &&
      selectedQuestionId
    ) {
      const exists = section.questions.some((q) => q.id === selectedQuestionId);
      if (!exists) {
        setSelectedQuestionId(section.questions[0].id);
      }
    }
  }, [effectiveSectionId, selectedQuestionId]);

  // ─── Mutations ───────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (variables: { isAutoSave?: boolean }) => {
      // Mutex: prevent concurrent saves
      if (saveInProgressRef.current) {
        return undefined;
      }
      saveInProgressRef.current = true;

      const currentState = stateRef.current;
      const hasDirtyQuestions = (currentState.dirtyQuestionIds?.size || 0) > 0;

      console.log(`[SAVE] dirtyQuestionIds: ${currentState.dirtyQuestionIds?.size ?? 0}, dirtyExamSettings: ${!!currentState.dirtyExamSettings}, deletedIds: ${currentState.deletedQuestionIds?.size ?? 0}, snapshot size: ${lastSavedSnapshotRef.current.size}`);

      // 1. Question-level differential PATCH (highest priority)
      if (hasDirtyQuestions || currentState.dirtyExamSettings || (currentState.deletedQuestionIds?.size || 0) > 0) {
        const dirtyPayload = mapDirtyQuestionsToPayload(
          currentState,
          lastSavedSnapshotRef.current
        );
        console.log(`[SAVE] dirtyPayload sections: ${dirtyPayload.sections.length}, examSettings: ${!!dirtyPayload.examSettings}, removedIds: ${dirtyPayload.removedQuestionIds.length}`);
        if (dirtyPayload.sections.length > 0) {
          for (const s of dirtyPayload.sections) {
            console.log(`[SAVE]   section ${s.id}: ${s.questions.length} questions`);
            for (const q of s.questions) {
              console.log(`[SAVE]     question ${q.id}: type=${q.questionType}, text="${q.questionText?.substring(0, 50)}...", options=${q.options.length}`);
            }
          }
        }
        if (dirtyPayload.sections.length > 0 || dirtyPayload.examSettings || dirtyPayload.removedQuestionIds.length > 0) {
          const result = await ExamApi.patchExamContent(examId, dirtyPayload);
          return result;
        }
      }

      // 2. Section metadata only (no questions)
      const sectionMetadataPayload = mapDirtySectionsToPayload(currentState);
      if (sectionMetadataPayload.sectionMetadata && sectionMetadataPayload.sectionMetadata.length > 0) {
        const result = await ExamApi.patchExamContent(examId, {
          sectionMetadata: sectionMetadataPayload.sectionMetadata,
        });
        return result;
      }

      return undefined;
    },
    onMutate: async () => {
      // Snapshot dirty flags at save-start to preserve mid-save edits
      const s = stateRef.current;
      saveStartDirtyRef.current = {
        questionIds: new Set(s.dirtyQuestionIds),
        sectionIds: new Set(s.dirtySectionIds),
        examSettings: !!s.dirtyExamSettings,
        deletedIds: new Set(s.deletedQuestionIds),
      };
      setState((prev) => ({ ...prev, isSaving: true }));
    },
    onSuccess: (data: unknown, variables) => {
      saveInProgressRef.current = false;

      // No-op save: nothing was dirty/sent — do NOT clear dirty flags,
      // do NOT rebuild snapshot, do NOT show success toast
      if (data === undefined || data === null) {
        setState((prev) => ({ ...prev, isSaving: false }));
        return;
      }

      const responseData = data as
        | { tempIdMap?: Record<string, string> }
        | undefined;
      const tempIdMap = responseData?.tempIdMap;

      // Replace temp IDs with real DB IDs from server response
      if (tempIdMap && Object.keys(tempIdMap).length > 0) {
        setState((prev) => ({
          ...prev,
          sections: prev.sections.map((s) => ({
            ...s,
            questions: s.questions.map((q) => {
              const realId = tempIdMap[q.id];
              return realId ? { ...q, id: realId } : q;
            }),
          })),
        }));
      }

      // Rebuild snapshot: merge saved questions (with real IDs) with existing snapshot
      console.log(`[SAVE:ONSUCCESS] tempIdMap:`, tempIdMap, `stateRef sections:`, stateRef.current.sections.length);
      const snapshot = new Map(lastSavedSnapshotRef.current);
      // Add/update entries for questions that were in the current state
      let snapshotAdded = 0;
      for (const section of stateRef.current.sections) {
        for (const q of section.questions) {
          const realId = tempIdMap?.[q.id] ?? q.id;
          snapshot.set(realId, hashQuestion(q));
          snapshotAdded++;
        }
      }
      // Remove entries for deleted questions
      const deletedIds = stateRef.current.deletedQuestionIds;
      if (deletedIds) {
        for (const id of deletedIds) {
          snapshot.delete(id);
        }
      }
      console.log(`[SAVE:ONSUCCESS] snapshot rebuilt: ${snapshotAdded} entries added, total: ${snapshot.size}`);
      lastSavedSnapshotRef.current = snapshot;

      // Only clear dirty flags that existed at save-start — preserve mid-save edits
      const saved = saveStartDirtyRef.current;
      setState((prev) => {
        const newQuestionIds = new Set(prev.dirtyQuestionIds);
        const newSectionIds = new Set(prev.dirtySectionIds);
        const newDeletedIds = new Set(prev.deletedQuestionIds);
        for (const id of saved.questionIds) newQuestionIds.delete(id);
        for (const id of saved.sectionIds) newSectionIds.delete(id);
        for (const id of saved.deletedIds) newDeletedIds.delete(id);
        const hasRemaining =
          newQuestionIds.size > 0 ||
          newSectionIds.size > 0 ||
          newDeletedIds.size > 0 ||
          (saved.examSettings ? false : !!prev.dirtyExamSettings);
        return {
          ...prev,
          isSaving: false,
          isDirty: hasRemaining,
          lastSavedAt: new Date(),
          dirtyQuestionIds: newQuestionIds,
          dirtySectionIds: newSectionIds,
          dirtyExamSettings: saved.examSettings ? false : !!prev.dirtyExamSettings,
          deletedQuestionIds: newDeletedIds,
        };
      });
      invalidateExamBuilderCache(queryClient, examId);
      if (!variables.isAutoSave) {
        toast({
          title: 'Da luu',
          description: 'Noi dung bai kiem tra da duoc luu thanh cong.',
        });
      }
      saveInProgressRef.current = false;
    },
    onError: (_error, variables, _context) => {
      setState((prev) => ({ ...prev, isSaving: false }));
      if (!variables.isAutoSave) {
        toast({
          title: 'Loi luu',
          description: 'Khong the luu noi dung. Vui long thu lai.',
          variant: 'destructive',
        });
      }
      saveInProgressRef.current = false;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const currentState = stateRef.current;
      const dirtyPayload = mapDirtyQuestionsToPayload(
        currentState,
        lastSavedSnapshotRef.current
      );
      const publishPatch = {
        ...dirtyPayload,
        examSettings: {
          ...dirtyPayload.examSettings,
          title: currentState.exam.title,
          description: currentState.exam.description,
          level: currentState.exam.level,
          duration: currentState.exam.duration,
          passScore: currentState.exam.passingScore,
          maxScore: currentState.exam.maxScore,
          examType: currentState.exam.examType,
          certificationType: currentState.exam.certificationType,
          publishStatus: 'published' as const,
        },
      };
      const result = await ExamApi.patchExamContent(examId, publishPatch);
      return result;
    },
    onMutate: async () => {
      setState((prev) => ({ ...prev, isSaving: true }));
    },
    onSuccess: (data: unknown) => {
      const responseData = data as
        | { tempIdMap?: Record<string, string> }
        | undefined;
      const tempIdMap = responseData?.tempIdMap;

      // Replace temp IDs with real DB IDs
      if (tempIdMap && Object.keys(tempIdMap).length > 0) {
        setState((prev) => ({
          ...prev,
          sections: prev.sections.map((s) => ({
            ...s,
            questions: s.questions.map((q) => {
              const realId = tempIdMap[q.id];
              return realId ? { ...q, id: realId } : q;
            }),
          })),
        }));
      }

      // Rebuild snapshot
      const snapshot = new Map(lastSavedSnapshotRef.current);
      for (const section of stateRef.current.sections) {
        for (const q of section.questions) {
          const realId = tempIdMap?.[q.id] ?? q.id;
          snapshot.set(realId, hashQuestion(q));
        }
      }
      lastSavedSnapshotRef.current = snapshot;

      setState((prev) => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSavedAt: new Date(),
        dirtyQuestionIds: new Set(),
        dirtySectionIds: new Set(),
        dirtyExamSettings: false,
        deletedQuestionIds: new Set(),
      }));
      invalidateExamBuilderCache(queryClient, examId);
      toast({
        title: 'Da xuat ban',
        description: 'Bai kiem tra da duoc xuat ban thanh cong.',
      });
      saveInProgressRef.current = false;
    },
    onError: (_error) => {
      setState((prev) => ({ ...prev, isSaving: false }));
      toast({
        title: 'Loi xuat ban',
        description: 'Khong the xuat ban bai kiem tra.',
        variant: 'destructive',
      });
    },
  });

  // ─── Auto-save with debounce (moved after mutations to avoid TDZ) ─────────
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const AUTO_SAVE_DELAY = 5000; // 5 seconds after last change

  useEffect(() => {
    if (!state.isDirty || state.isSaving || state.sections.length === 0) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      // Only auto-save if still dirty and not currently saving
      const currentState = stateRef.current;
      console.log(`[AUTO-SAVE] Timer fired. isDirty: ${currentState.isDirty}, isSaving: ${currentState.isSaving}, saveInProgress: ${saveInProgressRef.current}, dirtyQuestionIds: ${currentState.dirtyQuestionIds?.size ?? 0}`);
      if (
        currentState.isDirty &&
        !currentState.isSaving &&
        !saveInProgressRef.current &&
        currentState.sections.length > 0
      ) {
        saveMutation.mutate({ isAutoSave: true });
      }
      autoSaveTimeoutRef.current = null;
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [state.isDirty, state.isSaving, state.sections.length, saveMutation]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    saveMutation.mutate({ isAutoSave: false });
  }, [saveMutation]);

  const handlePublish = useCallback(() => {
    const validation = validateSections(stateRef.current.sections);
    if (validation.length > 0) {
      toast({
        title: 'Khong the xuat ban',
        description: `Con ${validation.length} van de can xu ly. Vui long kiem tra lai.`,
        variant: 'destructive',
      });
      return;
    }
    publishMutation.mutate();
  }, [toast, publishMutation]);

  const handleSelectSection = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    // Immediately select first question of the section
    const section = stateRef.current.sections.find((s) => s.id === sectionId);
    if (section && section.questions.length > 0) {
      setSelectedQuestionId(section.questions[0].id);
    } else {
      setSelectedQuestionId('');
    }
  }, []);

  const handleSelectQuestion = useCallback(
    (sectionId: string, questionId: string) => {
      setSelectedSectionId(sectionId);
      setSelectedQuestionId(questionId);
    },
    []
  );

  const handleNavigatePrev = useCallback(() => {
    const sections = stateRef.current.sections;
    const sIdx = sections.findIndex((section) => section.id === selectedSectionId);
    if (sIdx < 0) return;
    const section = sections[sIdx];
    const qIdx = section.questions.findIndex(
      (question) => question.id === selectedQuestionId
    );
    if (qIdx > 0) {
      setSelectedQuestionId(section.questions[qIdx - 1].id);
    } else if (sIdx > 0) {
      const prevSection = sections[sIdx - 1];
      setSelectedSectionId(prevSection.id);
      if (prevSection.questions.length > 0) {
        setSelectedQuestionId(
          prevSection.questions[prevSection.questions.length - 1].id
        );
      }
    }
  }, [selectedSectionId, selectedQuestionId]);

  const handleNavigateNext = useCallback(() => {
    const sections = stateRef.current.sections;
    const sIdx = sections.findIndex((section) => section.id === selectedSectionId);
    if (sIdx < 0) return;
    const section = sections[sIdx];
    const qIdx = section.questions.findIndex(
      (question) => question.id === selectedQuestionId
    );
    if (qIdx < section.questions.length - 1) {
      setSelectedQuestionId(section.questions[qIdx + 1].id);
    } else if (sIdx < sections.length - 1) {
      const nextSection = sections[sIdx + 1];
      setSelectedSectionId(nextSection.id);
      if (nextSection.questions.length > 0) {
        setSelectedQuestionId(nextSection.questions[0].id);
      }
    }
  }, [selectedSectionId, selectedQuestionId]);

  const handlers = useMemo(
    () => ({
      handleUpdateQuestion: (
        sectionId: string,
        questionId: string,
        updates: Partial<ExamSectionQuestion>
      ) => {
        setState((prev) => {
          // Find the current question to compute hash after update
          let updatedQuestion: ExamSectionQuestion | undefined;
          for (const section of prev.sections) {
            if (section.id !== sectionId) continue;
            for (const q of section.questions) {
              if (q.id === questionId) {
                updatedQuestion = { ...q, ...updates, status: 'Local' as const };
                break;
              }
            }
            if (updatedQuestion) break;
          }

          // Hash-based dirty tracking: only mark dirty if hash actually changed
          const newDirtyQuestions = new Set(prev.dirtyQuestionIds);
          if (updatedQuestion) {
            const currentHash = hashQuestion(updatedQuestion);
            const lastHash = lastSavedSnapshotRef.current.get(questionId);
            if (!lastHash || lastHash !== currentHash) {
              newDirtyQuestions.add(questionId);
              console.log(`[EDIT] Question ${questionId} marked DIRTY (hash changed)`);
            } else {
              newDirtyQuestions.delete(questionId);
              console.log(`[EDIT] Question ${questionId} hash MATCHES snapshot - NOT dirty`);
            }
          } else {
            newDirtyQuestions.add(questionId);
            console.warn(`[EDIT] Question ${questionId} NOT FOUND in state - forced dirty`);
          }

          const newDirtySections = new Set(prev.dirtySectionIds);
          newDirtySections.add(sectionId);

          return {
            ...prev,
            sections: prev.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    questions: section.questions.map((question) =>
                      question.id === questionId
                        ? { ...question, ...updates, status: 'Local' as const }
                        : question
                    ),
                    status: 'Local' as const,
                  }
                : section
            ),
            isDirty: true,
            dirtyQuestionIds: newDirtyQuestions,
            dirtySectionIds: newDirtySections,
          };
        });
      },
      handleUpdateGroupPassage: (
        sectionId: string,
        passageGroupId: string,
        passageText: string
      ) => {
        setState((prev) => {
          const newDirtyQuestions = new Set(prev.dirtyQuestionIds);
          const newDirtySections = new Set(prev.dirtySectionIds);
          newDirtySections.add(sectionId);
          // Mark questions in group as dirty only if hash actually changed
          const section = prev.sections.find((section) => section.id === sectionId);
          if (section) {
            for (const q of section.questions) {
              if (q.passageGroupId === passageGroupId) {
                const updatedQ = { ...q, passageText, status: 'Local' as const };
                const currentHash = hashQuestion(updatedQ);
                const lastHash = lastSavedSnapshotRef.current.get(q.id);
                if (!lastHash || lastHash !== currentHash) {
                  newDirtyQuestions.add(q.id);
                }
              }
            }
          }
          return {
            ...prev,
            sections: prev.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    questions: section.questions.map((question) =>
                      question.passageGroupId === passageGroupId
                        ? { ...question, passageText, status: 'Local' as const }
                        : question
                    ),
                    status: 'Local' as const,
                  }
                : section
            ),
            isDirty: true,
            dirtyQuestionIds: newDirtyQuestions,
            dirtySectionIds: newDirtySections,
          };
        });
      },
      handleUpdateSection: (
        sectionId: string,
        updates: Partial<ExamSectionContent>
      ) => {
        setState((prev) => {
          const newDirtySections = new Set(prev.dirtySectionIds);
          newDirtySections.add(sectionId);
          return {
            ...prev,
            sections: prev.sections.map((section) =>
              section.id === sectionId
                ? { ...section, ...updates, status: 'Local' as const }
                : section
            ),
            isDirty: true,
            dirtySectionIds: newDirtySections,
          };
        });
      },
      handleUpdateSettings: (updates: Partial<ExamContentSettings>) => {
        setState((prev) => {
          // Only mark dirty if values actually changed
          const currentExam = prev.exam;
          const hasChanges = Object.entries(updates).some(([key, value]) => {
            const currentValue = currentExam[key as keyof ExamContentSettings];
            return value !== currentValue && value !== undefined;
          });
          if (!hasChanges) return prev;
          return {
            ...prev,
            exam: { ...prev.exam, ...updates },
            isDirty: true,
            dirtyExamSettings: true,
          };
        });
      },
      handleDeleteQuestion: (sectionId: string, questionId: string) => {
        setState((prev) => {
          if (isTempId(questionId)) {
            return {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId
                  ? {
                      ...s,
                      questions: s.questions.filter((q) => q.id !== questionId),
                      questionCount: s.questions.length - 1,
                    }
                  : s
              ),
              isDirty: true,
            };
          }
          const newDeletedIds = new Set(prev.deletedQuestionIds || []);
          newDeletedIds.add(questionId);
          return {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    questions: s.questions.filter((q) => q.id !== questionId),
                    questionCount: s.questions.length - 1,
                  }
                : s
            ),
            deletedQuestionIds: newDeletedIds,
            isDirty: true,
          };
        });
      },
      handleSave,
      handlePublish,
      handleSelectSection,
      handleSelectQuestion,
      handleNavigatePrev,
      handleNavigateNext,
    }),
    [
      handleSave,
      handlePublish,
      handleSelectSection,
      handleSelectQuestion,
      handleNavigatePrev,
      handleNavigateNext,
    ]
  );

  return {
    state,
    navigation: {
      selectedSectionId: effectiveSectionId,
      selectedQuestionId: selectedQuestion?.id || '',
      selectedSection,
      selectedQuestion,
      selectedQuestionIndex,
      totalQuestions,
    },
    handlers,
    isLoading: isFetching && !initialized,
    isLoadingQuestions,
    hasExamData,
    isError: isQueryError,
  };
}
