import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBeforeUnload } from '@spark-nest-ed/frontend-shared-hooks';
import { useExamBuilderData, useUpdateExam, useSaveExamSections, useSaveQuestion, useLinkQuestionToExam, useUnlinkQuestionFromExam, useSectionQuestions } from '../../use-certification';
import type { ExamBuilderResponse } from '../../../types';
import { saveDraftToStorage, loadDraftFromStorage, clearDraftFromStorage } from '../../../utils/local-storage-draft.util';
import type { BuilderSection, ExamSettingsForm, ExamBuilderDraft } from '../../../types/exam-builder.types';
import { mapApiSection, mapSectionsToSavePayload, reconcileSavedSectionIds, computeBlueprint } from '../../../services/exam-builder-helpers.service';
import { createQuestionHandlers } from '../../../services/exam-builder-question-handlers.service';
import { createSectionHandlers } from '../../../services/exam-builder-section-handlers.service';

export type { BuilderQuestion, BuilderSection, ExamSettingsForm, ExamBlueprint } from '../../../types/exam-builder.types';
import { PAGE_SIZE, AUTO_SAVE_DEBOUNCE_MS, API_AUTO_SAVE_IDLE_MS, DRAFT_PREFIX } from '../../../constants/exam-builder.constants';

export function useExamBuilderContainerLogic() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const examId = id || '';

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useExamBuilderData(examId);
  const updateExamMutation = useUpdateExam();
  const saveSectionsMutation = useSaveExamSections();
  const saveQuestionMutation = useSaveQuestion();
  const linkQuestionMutation = useLinkQuestionToExam();
  const unlinkQuestionMutation = useUnlinkQuestionFromExam();

  const [activeTab, setActiveTab] = useState<'Build' | 'Settings' | 'Review & Publish'>('Build');
  const [activeSubTab, setActiveSubTab] = useState<'Questions' | 'Instructions' | 'Timing'>('Questions');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [collectionId, setCollectionId] = useState('');
  const [collectionTitle, setCollectionTitle] = useState('');

  const { data: sectionQuestionsData, isLoading: isSectionQuestionsLoading } =
    useSectionQuestions(examId, activeSectionId, currentPage, PAGE_SIZE, searchQuery);

  const [settings, setSettings] = useState<ExamSettingsForm>({
    title: '', description: '', level: '', language: 'English',
    passingScore: 0, maxScore: 0, examType: 'FULL_MOCK',
    certificationType: '', createdDate: '', lastUpdatedDate: '',
  });
  const [sections, setSections] = useState<BuilderSection[]>([]);

  const lastSyncedVersion = useRef(0);
  const apiAutoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef(sections);
  const settingsRef = useRef(settings);
  const isSavingRef = useRef(isSaving);
  const isAddingQuestionRef = useRef(false);
  sectionsRef.current = sections;
  settingsRef.current = settings;
  isSavingRef.current = isSaving;

  useBeforeUnload(isDirty, examId);

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!apiData || !examId) return;
    const responseData = apiData as unknown as ExamBuilderResponse;
    const currentVersion = responseData.lastAutosaved ? new Date(responseData.lastAutosaved).getTime() : 0;
    const isInitialLoad = lastSyncedVersion.current === 0;
    const isCacheRefetch = currentVersion > lastSyncedVersion.current;

    if (isInitialLoad) {
      const draft = loadDraftFromStorage<ExamBuilderDraft>(examId, DRAFT_PREFIX);
      setCollectionId(responseData.collectionId || '');
      setCollectionTitle(responseData.collectionTitle || '');

      if (draft) {
        setSections(draft.sections);
        setSettings(draft.settings);
        if (draft.sections.length > 0) setActiveSectionId(draft.sections[0].id);
        lastSyncedVersion.current = currentVersion || Date.now();
        return;
      }
      if (responseData.settings) {
        setSettings({
          title: responseData.settings.title || responseData.title || '',
          description: responseData.settings.description || responseData.description || '',
          level: responseData.settings.level || responseData.settings.difficulty || '',
          language: responseData.settings.language || 'English',
          passingScore: responseData.settings.passingScore || responseData.passingScore || 0,
          maxScore: responseData.settings.maxScore || responseData.settings.passingScore || 0,
          examType: responseData.examType || 'FULL_MOCK',
          certificationType: responseData.certificationType || '',
          createdDate: responseData.settings.createdDate || '',
          lastUpdatedDate: responseData.settings.lastUpdatedDate || '',
        });
      }
      if (responseData.sections && Array.isArray(responseData.sections)) {
        const mappedSections = responseData.sections.map(mapApiSection);
        setSections(mappedSections);
        if (mappedSections.length > 0) setActiveSectionId(mappedSections[0].id);
      }
      lastSyncedVersion.current = currentVersion || Date.now();
    } else if (isCacheRefetch && !isDirty) {
      if (responseData.settings) {
        setSettings((prev) => ({
          ...prev,
          title: responseData.settings?.title || responseData.title || prev.title,
          description: responseData.settings?.description || responseData.description || prev.description,
          level: responseData.settings?.level || responseData.settings?.difficulty || prev.level,
          language: responseData.settings?.language || prev.language,
          passingScore: responseData.settings?.passingScore || responseData.passingScore || prev.passingScore,
          maxScore: responseData.settings?.maxScore || prev.maxScore,
          examType: responseData.examType || prev.examType,
          certificationType: responseData.certificationType || prev.certificationType,
        }));
      }
      if (responseData.sections && Array.isArray(responseData.sections)) {
        setSections(responseData.sections.map(mapApiSection));
      }
      lastSyncedVersion.current = currentVersion;
    }
  }, [apiData, examId, isDirty]);

  const cancelAutoSave = useCallback(() => {
    if (apiAutoSaveTimerRef.current) {
      clearTimeout(apiAutoSaveTimerRef.current);
      apiAutoSaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (lastSyncedVersion.current === 0 || !isDirty || !examId) return;
    const timer = setTimeout(() => {
      saveDraftToStorage(examId, DRAFT_PREFIX, { sections: sectionsRef.current, settings: settingsRef.current });
    }, AUTO_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isDirty, sections, settings, examId]);

  useEffect(() => {
    if (lastSyncedVersion.current === 0 || !isDirty || !examId) return;
    if (apiAutoSaveTimerRef.current) clearTimeout(apiAutoSaveTimerRef.current);
    apiAutoSaveTimerRef.current = setTimeout(async () => {
      if (!examId || isSavingRef.current || isAddingQuestionRef.current) return;
      try {
        const sectionResult = await saveSectionsMutation.mutateAsync({
          examId, sections: mapSectionsToSavePayload(sectionsRef.current), silent: true,
        });
        if (Array.isArray(sectionResult) && sectionResult.length > 0) {
          setSections((prev) => reconcileSavedSectionIds(prev, sectionResult.map((r: { id: string }) => r.id)));
        }
        await updateExamMutation.mutateAsync({
          examId, collectionId: '', title: settingsRef.current.title,
          description: settingsRef.current.description, passScore: settingsRef.current.passingScore,
          maxScore: settingsRef.current.maxScore, examType: settingsRef.current.examType,
          publishStatus: 'draft', silent: true,
        });
        clearDraftFromStorage(examId, DRAFT_PREFIX);
        setIsDirty(false);
      } catch { /* auto-save failed — will retry on next change */ }
    }, API_AUTO_SAVE_IDLE_MS);
    return () => { if (apiAutoSaveTimerRef.current) clearTimeout(apiAutoSaveTimerRef.current); };
  }, [isDirty, examId, saveSectionsMutation, updateExamMutation]);

  // ── Derived state ────────────────────────────────────────────────────────

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) || sections[0],
    [sections, activeSectionId],
  );

  const filteredQuestions = (sectionQuestionsData?.questions || []) as BuilderSection['questions'];
  const totalFilteredCount = sectionQuestionsData?.totalCount || activeSection?.questionCount || 0;
  const totalFilteredPages = sectionQuestionsData?.totalPages || Math.max(1, Math.ceil(totalFilteredCount / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalFilteredPages);
  const paginatedQuestions = filteredQuestions;
  const blueprint = useMemo(() => computeBlueprint(sections), [sections]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const { handleAddQuestionToSection, handleRemoveQuestionFromSection } = createQuestionHandlers({
    examId, activeSectionId, sectionsRef, setSections, setActiveSectionId,
    setIsDirty, isAddingQuestionRef, saveSectionsMutation, saveQuestionMutation,
    linkQuestionMutation, unlinkQuestionMutation, refetch,
  });

  const { handleAddSection, handleUpdateActiveSectionTitle, handleDeleteSection, handleSaveDraft, handlePublishExam } = createSectionHandlers({
    examId, activeSectionId, sections, sectionsRef, settingsRef,
    setSections, setActiveSectionId, setIsDirty, setIsSaving, isSavingRef,
    cancelAutoSave, saveSectionsMutation, updateExamMutation,
  });

  const handlePreviewExam = useCallback(() => {
    navigate(`/certification/exams/${examId}`);
  }, [navigate, examId]);

  const handleEditQuestion = useCallback((questionId: string) => {
    const questionSection = sections.find((s) => s.questions.some((q) => q.id === questionId));
    navigate(`/certification/exam-builder/${examId}/question-builder/${questionId}`, {
      state: {
        questionIds: sectionsRef.current.flatMap((s) => s.questions.map((q) => q.id)),
        sectionId: questionSection?.id,
      },
    });
  }, [navigate, examId, sections]);

  const handleBackToExams = useCallback(() => {
    if (collectionId) {
      navigate(`/certification/collection-editor/${collectionId}`);
    } else {
      navigate('/certification/creator-dashboard');
    }
  }, [navigate, collectionId]);

  const navigateToCreatorDashboard = useCallback(() => {
    navigate('/certification/creator-dashboard');
  }, [navigate]);

  const navigateToCollectionEditor = useCallback((id: string) => {
    navigate(`/certification/collection-editor/${id}`);
  }, [navigate]);

  return {
    isApiLoading, isError, refetch, isSectionQuestionsLoading,
    collectionId, collectionTitle,
    activeTab, setActiveTab, activeSubTab, setActiveSubTab,
    activeSectionId, setActiveSectionId, activeSection, sections,
    settings, setSettings,
    searchQuery, setSearchQuery, currentPage: safeCurrentPage, setCurrentPage,
    totalFilteredPages, pageSize: PAGE_SIZE, filteredQuestions: paginatedQuestions, totalFilteredCount,
    blueprint,
    handleAddSection, handleUpdateActiveSectionTitle, handleDeleteSection,
    handleAddQuestionToSection, handleRemoveQuestionFromSection,
    handleSaveDraft, handlePublishExam,
    handlePreviewExam, handleEditQuestion, handleBackToExams,
    navigateToCreatorDashboard, navigateToCollectionEditor,
    isSaving, isDirty,
  };
}
