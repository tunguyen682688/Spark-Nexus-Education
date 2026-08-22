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
  mapStateToSavePayload,
} from '../../../services/exam-content-helpers.service';
import {
  invalidateExamBuilderCache,
} from '../../../services/exam-content-cache-helpers.service';

interface ToastFn {
  (props: { title?: React.ReactNode; description?: React.ReactNode; variant?: 'default' | 'destructive' }): void;
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
    handleAddSection: () => void;
    handleDeleteSection: (sectionId: string) => void;
    handleUpdateSection: (sectionId: string, updates: Partial<ExamSectionContent>) => void;
    handleAddQuestion: (sectionId: string) => void;
    handleDuplicateQuestion: (sectionId: string, questionId: string) => void;
    handleUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<ExamSectionQuestion>) => void;
    handleUpdateGroupPassage: (sectionId: string, passageGroupId: string, passageText: string) => void;
    handleDeleteQuestion: (sectionId: string, questionId: string) => void;
    handleUpdateSettings: (updates: Partial<ExamContentSettings>) => void;
    handleSave: () => void;
    handlePublish: () => void;
    handleSelectSection: (sectionId: string) => void;
    handleSelectQuestion: (sectionId: string, questionId: string) => void;
    handleNavigatePrev: () => void;
    handleNavigateNext: () => void;
  };
  isLoading: boolean;
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
});

// ─── Part-specific question defaults ──────────────────────────────────────────
const PART_QUESTION_DEFAULTS: Record<number, { questionType: string; optionsCount: number }> = {
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

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addSectionToState(prev: ExamContentState): ExamContentState {
  const newSection: ExamSectionContent = {
    id: `temp-${Date.now()}`,
    order: prev.sections.length + 1,
    title: 'Section moi',
    sectionType: 'reading',
    durationMinutes: 15,
    questionCount: 0,
    isBreak: false,
    questions: [],
    status: 'Local',
  };
  return { ...prev, sections: [...prev.sections, newSection], isDirty: true };
}

function removeSectionFromState(prev: ExamContentState, sectionId: string): ExamContentState {
  const filtered = prev.sections.filter((s) => s.id !== sectionId);
  const renumbered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
  return { ...prev, sections: renumbered, isDirty: true };
}

function addQuestionToSection(prev: ExamContentState, sectionId: string): ExamContentState {
  const section = prev.sections.find((s) => s.id === sectionId);
  if (!section) return prev;
  const partDefaults = PART_QUESTION_DEFAULTS[section.order] || { questionType: 'mc', optionsCount: 4 };
  const timestamp = Date.now();
  const newQuestion: ExamSectionQuestion = {
    id: `temp-${timestamp}`,
    order: section.questions.length + 1,
    questionType: partDefaults.questionType,
    questionText: '',
    difficulty: 'Medium',
    options: createDefaultOptions(partDefaults.optionsCount),
    points: 1,
    estimatedTime: partDefaults.questionType === 'question_response' ? 5 : 10,
    status: 'Local',
  };
  return {
    ...prev,
    sections: prev.sections.map((s) =>
      s.id === sectionId
        ? { ...s, questions: [...s.questions, newQuestion], questionCount: s.questions.length + 1, status: 'Local' as const }
        : s
    ),
    isDirty: true,
  };
}

function duplicateQuestionInSection(prev: ExamContentState, sectionId: string, questionId: string): ExamContentState {
  const section = prev.sections.find((s) => s.id === sectionId);
  if (!section) return prev;
  const source = section.questions.find((q) => q.id === questionId);
  if (!source) return prev;
  const rand = Math.random().toString(36).slice(2, 6);
  const cloned: ExamSectionQuestion = {
    ...source,
    id: `temp-${Date.now()}-${rand}`,
    order: section.questions.length + 1,
    options: source.options.map((opt) => ({
      ...opt,
      id: `opt-${Date.now()}-${rand}-${opt.label}`,
    })),
    // Clear passage group — duplicate is independent
    passageGroupId: undefined,
    passageText: undefined,
    status: 'Local',
  };
  return {
    ...prev,
    sections: prev.sections.map((s) =>
      s.id === sectionId
        ? { ...s, questions: [...s.questions, cloned], questionCount: s.questions.length + 1, status: 'Local' as const }
        : s
    ),
    isDirty: true,
  };
}

function removeQuestionFromState(prev: ExamContentState, sectionId: string, questionId: string): ExamContentState {
  return {
    ...prev,
    sections: prev.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const filtered = s.questions.filter((q) => q.id !== questionId);
      const renumbered = filtered.map((q, i) => ({ ...q, order: i + 1 }));
      return { ...s, questions: renumbered, questionCount: renumbered.length, status: 'Local' as const };
    }),
    isDirty: true,
  };
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
    description?: string;
    instructions?: string;
    sectionType: string;
    orderIndex: number;
    durationMinutes?: number;
    questionCount?: number;
    isBreak?: boolean;
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
  const certType = data.settings?.certificationType || data.certificationType || 'IELTS';
  const matchingTemplate = EXAM_TEMPLATES.find((t) => t.certificationType === certType);
  const isFixedStructure = matchingTemplate?.isFixedStructure ?? false;

  const sections: ExamSectionContent[] = (data.sections || []).map((s, idx) => ({
    id: s.id,
    title: s.title,
    subtitle: s.description,
    sectionType: s.sectionType as ExamSectionContent['sectionType'],
    instruction: s.instructions,
    order: s.orderIndex ?? (idx + 1),
    durationMinutes: s.durationMinutes || 0,
    questionCount: s.questionCount || s.questions?.length || 0,
    isBreak: s.isBreak || false,
    questions: (s.questions || []).map((q, qIdx) => ({
      id: q.id,
      order: qIdx + 1,
      questionType: q.type || q.questionType || 'mc',
      questionText: q.title || q.questionText || '',
      difficulty: (q.difficulty as ExamSectionQuestion['difficulty']) || 'Medium',
      options: (q.choices || q.options || []).map((opt) => {
        const o = opt as Record<string, unknown>;
        return {
          id: o.id as string,
          label: (o.label as string) || (o.choiceKey as string) || '',
          text: (o.text as string) || (o.content as string) || '',
          isCorrect: (o.isCorrect as boolean) ?? false,
        };
      }),
      explanation: q.explanation,
      points: q.points || 1,
      estimatedTime: q.estimatedTime,
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl,
      passageGroupId: q.passageGroupId,
      passageText: q.passageText,
      passageType: q.passageType,
      blankIndex: q.blankIndex ?? q.blankNumber,
      subQuestionNumber: q.subQuestionNumber,
      status: 'Saved' as const,
    })),
    status: 'Saved' as const,
  }));

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
  }>,
  sectionTitle: string = '',
): ExamSectionQuestion[] {
  const sectionPartNum = derivePartNumberFromTitle(sectionTitle);
  return questions.map((q) => {
    const partNum = q.partNumber || sectionPartNum;
    const partDefaults = PART_QUESTION_DEFAULTS[partNum] || { questionType: 'mc', optionsCount: 4 };
    // Try to extract options from formatMetadata
    const meta = q.formatMetadata as Record<string, unknown> | null;
    const choices = meta?.choices as Array<{ id: string; label: string; content: string; isCorrect?: boolean; correct?: boolean }> | undefined;
    const options = choices
      ? choices.map((c) => ({ id: c.id, label: c.label, text: c.content, isCorrect: c.isCorrect ?? c.correct ?? false }))
      : createDefaultOptions(partDefaults.optionsCount);
    return {
      id: q.examQuestionId,
      order: q.number,
      questionType: q.type || partDefaults.questionType,
      questionText: q.title || '',
      difficulty: (q.difficulty as ExamSectionQuestion['difficulty']) || 'Medium',
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
  const [lazyLoadedSections, setLazyLoadedSections] = useState<Set<string>>(new Set());
  const [emptySectionWarning, setEmptySectionWarning] = useState<{ title: string } | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ─── React Query: Fetch exam builder data ────────────────────────────────
  const { data: apiData, isLoading: isFetching, isError: isQueryError } = useQuery({
    queryKey: certificationKeys.examContent.builder(examId),
    queryFn: () => ExamApi.getExamBuilderData(examId),
    enabled: Boolean(examId),
    staleTime: STALE_TIME_SESSION,
    gcTime: 10 * 60 * 1000, // Keep exam data in cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  const autoInitDoneRef = useRef(false);

  // Reset auto-init flag when examId changes
  useEffect(() => {
    autoInitDoneRef.current = false;
  }, [examId]);

  // Initialize state from API data (once)
  useEffect(() => {
    if (apiData && !initialized) {
      const newState = mapBuilderDataToState(apiData);
      setState(newState);
      setInitialized(true);
    }
  }, [apiData, initialized]);
  useEffect(() => {
    if (!initialized || !apiData || autoInitDoneRef.current) return;
    const certType = apiData.certificationType;
    if (!certType) return;

    setState((current) => {
      // Check if ALL sections have 0 questions
      const allSectionsEmpty = current.sections.every((s) => s.questions.length === 0);
      if (!allSectionsEmpty) {
        autoInitDoneRef.current = true;
        return current;
      }

      // Find the matching template by certificationType
      const template = EXAM_TEMPLATES.find((t) => t.certificationType === certType);
      if (!template) {
        autoInitDoneRef.current = true;
        return current;
      }

      autoInitDoneRef.current = true;

      // Match sections by order/index: map existing sections to template sections
      // Skip break sections in template when matching
      const templateNonBreak = template.sections.filter((s) => !s.isBreak);

      const updatedSections = current.sections.map((section, idx) => {
        // Match by index first, then by part number extracted from title
        const partNum = section.title.match(/Part\s+(\d+)/i)?.[1];
        const templateSection = templateNonBreak[idx]
          || (partNum ? templateNonBreak.find((t) => t.title.includes(`Part ${partNum}`)) : undefined)
          || templateNonBreak.find((t) => t.title.toLowerCase().startsWith(section.title.toLowerCase().replace(/\s*—\s*/g, ' ').slice(0, 10)));
        if (!templateSection || section.questions.length > 0) return section;

        // Always use template's questionSlots length (canonical count)
        const slots = templateSection.questionSlots;

        const questions: ExamSectionQuestion[] = slots.map((slot, qIdx) => {
          // Compute passageGroupId: use groupSize for uniform groups, or passageGroups for variable
          let passageGroupId: string | undefined;
          if (templateSection.passageGroups && templateSection.passageGroups.length > 0) {
            // Variable grouping: find which group this question belongs to
            let accumulated = 0;
            for (const pg of templateSection.passageGroups) {
              if (qIdx < accumulated + pg.questionCount) {
                passageGroupId = `grp-${section.id}-${pg.id}`;
                break;
              }
              accumulated += pg.questionCount;
            }
          } else if (templateSection.groupSize) {
            passageGroupId = `grp-${section.id}-${Math.floor(qIdx / templateSection.groupSize)}`;
          }
          return {
            id: generateTempId(),
            order: qIdx + 1,
            questionType: slot.questionTypeId,
            questionText: '',
            difficulty: 'Medium' as const,
            options: createDefaultOptions(slot.optionsCount || 4),
            points: slot.points,
            estimatedTime: slot.estimatedTime,
            passageGroupId,
            passageType: templateSection.passageGroups?.find((_, i) => {
              let acc = 0;
              for (let j = 0; j <= i; j++) acc += templateSection.passageGroups![j].questionCount;
              return qIdx < acc;
            })?.passageType,
            status: 'Local' as const,
          };
        });

        return { ...section, questions, questionCount: questions.length };
      });

      // Auto-select first question of first section
      const firstSection = updatedSections[0];
      if (firstSection?.questions.length > 0) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          setSelectedSectionId(firstSection.id);
          setSelectedQuestionId(firstSection.questions[0].id);
        }, 0);
      }

      return { ...current, sections: updatedSections, isDirty: true };
    });
  }, [initialized, apiData]);

  // Determine if exam has content: show editor if sections exist (regardless of question count)
  // Template selector only shows for truly empty exams (no sections at all)
  const hasExamData = state.sections.length > 0;

  // ─── Lazy-load questions for selected section if not loaded from builder ─
  const selectedSection = state.sections.find((s) => s.id === selectedSectionId) || state.sections[0];
  const effectiveSectionId = selectedSection?.id || '';

  const needsLazyLoad = hasExamData
    && effectiveSectionId
    && selectedSection
    && selectedSection.questions.length === 0
    && (selectedSection.questionCount || 0) > 0
    && !lazyLoadedSections.has(effectiveSectionId);

  const { data: sectionQuestionsData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: certificationKeys.exams.sectionQuestions(examId, effectiveSectionId),
    queryFn: () => ExamApi.getSectionQuestions(examId, effectiveSectionId, { pageSize: 200 }),
    enabled: Boolean(needsLazyLoad),
    staleTime: STALE_TIME_SESSION,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
    retry: 1,
  });

  // Merge lazily loaded questions into state
  useEffect(() => {
    if (sectionQuestionsData?.questions && effectiveSectionId) {
      const sectionTitle = stateRef.current.sections.find((s) => s.id === effectiveSectionId)?.title || '';
      const questions = mapSectionQuestionsToState(sectionQuestionsData.questions, sectionTitle);
      setLazyLoadedSections((prev) => new Set(prev).add(effectiveSectionId));
      setState((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === effectiveSectionId && s.questions.length === 0
            ? { ...s, questions }
            : s
        ),
      }));
    }
  }, [sectionQuestionsData, effectiveSectionId]);

  // Navigation state
  const selectedQuestion = selectedSection?.questions.find((q) => q.id === selectedQuestionId)
    || selectedSection?.questions[0];
  const selectedQuestionIndex = selectedSection
    ? selectedSection.questions.findIndex((q) => q.id === (selectedQuestion?.id || ''))
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

  // Show toast for empty section warning (moved out of setState)
  useEffect(() => {
    if (emptySectionWarning) {
      toast({ title: 'Section trống', description: `"${emptySectionWarning.title}" không còn câu hỏi nào.`, variant: 'destructive' });
      setEmptySectionWarning(null);
    }
  }, [emptySectionWarning, toast]);

  // When section changes, select first question
  useEffect(() => {
    const section = stateRef.current.sections.find((s) => s.id === effectiveSectionId);
    if (effectiveSectionId && section && section.questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(section.questions[0].id);
    }
    if (effectiveSectionId && section && section.questions.length > 0 && selectedQuestionId) {
      const exists = section.questions.some((q) => q.id === selectedQuestionId);
      if (!exists) {
        setSelectedQuestionId(section.questions[0].id);
      }
    }
  }, [effectiveSectionId, selectedQuestionId]);

  // Compute validation issues (debounced via useMemo — only recalculates when sections reference changes)
  const validationIssues = useMemo(() => validateSections(state.sections), [state.sections]);

  // Sync validation issues to state only when they actually change
  useEffect(() => {
    const prevIssues = state.validationIssues || [];
    // Simple reference check - useMemo already ensures new array only when sections change
    if (validationIssues !== prevIssues) {
      setState((prev) => ({ ...prev, validationIssues }));
    }
  }, [validationIssues]);

  // ─── Mutations ───────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (variables: { payload: ReturnType<typeof mapStateToSavePayload>; isAutoSave?: boolean }) => {
      await ExamApi.saveExamContent(examId, variables.payload);
      // Also save exam-level settings via updateExam
      const s = stateRef.current.exam;
      await ExamApi.updateExam(examId, {
        passScore: s.passingScore,
        maxScore: s.maxScore,
        examType: s.examType,
        certificationType: s.certificationType,
      });
    },
    onMutate: async () => {
      setState((prev) => ({ ...prev, isSaving: true }));
      await queryClient.cancelQueries({ queryKey: certificationKeys.examContent.builder(examId) });
      const previousData = queryClient.getQueryData(certificationKeys.examContent.builder(examId));
      return { previousData };
    },
    onSuccess: (_data, variables) => {
      setState((prev) => ({ ...prev, isSaving: false, isDirty: false, lastSavedAt: new Date() }));
      invalidateExamBuilderCache(queryClient, examId);
      if (!variables.isAutoSave) {
        toast({ title: 'Da luu', description: 'Noi dung bai kiem tra da duoc luu thanh cong.' });
      }
    },
    onError: (_error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(certificationKeys.examContent.builder(examId), context.previousData);
      }
      setState((prev) => ({ ...prev, isSaving: false }));
      if (!variables.isAutoSave) {
        toast({ title: 'Loi luu', description: 'Khong the luu noi dung. Vui long thu lai.', variant: 'destructive' });
      }
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof mapStateToSavePayload>) => {
      await ExamApi.saveExamContent(examId, payload);
      return ExamApi.updateExam(examId, { publishStatus: 'published' });
    },
    onMutate: async () => {
      setState((prev) => ({ ...prev, isSaving: true }));
      await queryClient.cancelQueries({ queryKey: certificationKeys.examContent.builder(examId) });
      const previousData = queryClient.getQueryData(certificationKeys.examContent.builder(examId));
      return { previousData };
    },
    onSuccess: () => {
      setState((prev) => ({ ...prev, isSaving: false, isDirty: false, lastSavedAt: new Date() }));
      invalidateExamBuilderCache(queryClient, examId);
      toast({ title: 'Da xuat ban', description: 'Bai kiem tra da duoc xuat ban thanh cong.' });
    },
    onError: (_error, _payload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(certificationKeys.examContent.builder(examId), context.previousData);
      }
      setState((prev) => ({ ...prev, isSaving: false }));
      toast({ title: 'Loi xuat ban', description: 'Khong the xuat ban bai kiem tra.', variant: 'destructive' });
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
      if (currentState.isDirty && !currentState.isSaving && currentState.sections.length > 0) {
        saveMutation.mutate({ payload: mapStateToSavePayload(currentState), isAutoSave: true });
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
    saveMutation.mutate({ payload: mapStateToSavePayload(stateRef.current), isAutoSave: false });
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
    publishMutation.mutate(mapStateToSavePayload(stateRef.current));
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

  const handleSelectQuestion = useCallback((sectionId: string, questionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedQuestionId(questionId);
  }, []);

  const handleNavigatePrev = useCallback(() => {
    const sections = stateRef.current.sections;
    const sIdx = sections.findIndex((s) => s.id === selectedSectionId);
    if (sIdx < 0) return;
    const section = sections[sIdx];
    const qIdx = section.questions.findIndex((q) => q.id === selectedQuestionId);
    if (qIdx > 0) {
      setSelectedQuestionId(section.questions[qIdx - 1].id);
    } else if (sIdx > 0) {
      const prevSection = sections[sIdx - 1];
      setSelectedSectionId(prevSection.id);
      if (prevSection.questions.length > 0) {
        setSelectedQuestionId(prevSection.questions[prevSection.questions.length - 1].id);
      }
    }
  }, [selectedSectionId, selectedQuestionId]);

  const handleNavigateNext = useCallback(() => {
    const sections = stateRef.current.sections;
    const sIdx = sections.findIndex((s) => s.id === selectedSectionId);
    if (sIdx < 0) return;
    const section = sections[sIdx];
    const qIdx = section.questions.findIndex((q) => q.id === selectedQuestionId);
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

  const handlers = useMemo(() => ({
    handleAddSection: () => setState((prev) => addSectionToState(prev)),
    handleDeleteSection: (sectionId: string) => setState((prev) => removeSectionFromState(prev, sectionId)),
    handleAddQuestion: (sectionId: string) => setState((prev) => addQuestionToSection(prev, sectionId)),
    handleDuplicateQuestion: (sectionId: string, questionId: string) => setState((prev) => duplicateQuestionInSection(prev, sectionId, questionId)),
    handleUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<ExamSectionQuestion>) => {
      setState((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId
            ? { ...s, questions: s.questions.map((q) => q.id === questionId ? { ...q, ...updates, status: 'Local' as const } : q), status: 'Local' as const }
            : s
        ),
        isDirty: true,
      }));
    },
    handleUpdateGroupPassage: (sectionId: string, passageGroupId: string, passageText: string) => {
      setState((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId
            ? { ...s, questions: s.questions.map((q) => q.passageGroupId === passageGroupId ? { ...q, passageText, status: 'Local' as const } : q), status: 'Local' as const }
            : s
        ),
        isDirty: true,
      }));
    },
    handleUpdateSection: (sectionId: string, updates: Partial<ExamSectionContent>) => {
      setState((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, ...updates, status: 'Local' as const } : s
        ),
        isDirty: true,
      }));
    },
    handleDeleteQuestion: (sectionId: string, questionId: string) => {
      setState((prev) => {
        const next = removeQuestionFromState(prev, sectionId, questionId);
        const section = next.sections.find((s) => s.id === sectionId);
        if (section && section.questions.length === 0) {
          setEmptySectionWarning({ title: section.title });
        }
        return next;
      });
    },
    handleUpdateSettings: (updates: Partial<ExamContentSettings>) => {
      setState((prev) => ({ ...prev, exam: { ...prev.exam, ...updates }, isDirty: true }));
    },
    handleSave,
    handlePublish,
    handleSelectSection,
    handleSelectQuestion,
    handleNavigatePrev,
    handleNavigateNext,
  }), [handleSave, handlePublish, handleSelectSection, handleSelectQuestion, handleNavigatePrev, handleNavigateNext]);

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
    isLoading: (isFetching && !initialized) || isLoadingQuestions,
    hasExamData,
    isError: isQueryError,
  };
}
