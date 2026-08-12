import { useState, useEffect, useCallback, useRef, useReducer, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBeforeUnload } from '@spark-nest-ed/frontend-shared-hooks';
import { useQuestionBuilderData, useSaveQuestion, useDeleteQuestion, useLinkQuestionToExam } from '../../use-certification';
import type { QuestionBuilderData } from '../../../types';
import { saveDraftToStorage, loadDraftFromStorage, clearDraftFromStorage } from '../../../utils/local-storage-draft.util';
import { getQuestionTypesForCertification, getDefaultQuestionTypeForCertification, getQuestionTypesByCategory, getQuestionTypeConfig } from '../../../constants/question-type-config.constants';
import { questionFormReducer, initialFormState } from '../../../services/question-form-reducer.service';
import type { QuestionFormState } from '../../../types/question-builder.types';
import { useOptionHandlers, useFieldHandlers } from './use-question-builder-handlers';
import { mapApiDataToFormPayload, buildSavePayload } from '../../../services/question-data-mapper.service';

export type { AnswerOptionItem, QuestionPropertiesForm } from '../../../types/question-builder.types';
import { AUTO_SAVE_DEBOUNCE_MS } from '../../../constants/exam-builder.constants';

const DRAFT_PREFIX = 'sne-question-builder-draft';

export function useQuestionBuilderContainerLogic() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, examId: urlExamId, questionId: urlQuestionId } = useParams<{
    id: string;
    examId: string;
    questionId: string;
  }>();

  const questionId = urlQuestionId || id || '';
  const examId = urlExamId || undefined;
  const questionIds = useMemo(
    () => (location.state as { questionIds?: string[] })?.questionIds || [],
    [location.state],
  );
  const sectionIdFromNav = useMemo(
    () => (location.state as { sectionId?: string })?.sectionId,
    [location.state],
  );

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useQuestionBuilderData(questionId);
  const saveQuestionMutation = useSaveQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const linkQuestionMutation = useLinkQuestionToExam();

  const [certificationType, setCertificationType] = useState<string>('TOEIC');
  const [activeTab, setActiveTab] = useState<'Question' | 'Explanation' | 'Tags & Skills' | 'History'>('Question');
  const [textMediaMode, setTextMediaMode] = useState<'Text' | 'Media'>('Text');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);

  const availableQuestionTypes = useMemo(
    () => getQuestionTypesForCertification(certificationType),
    [certificationType]
  );
  const questionTypesByCategory = useMemo(
    () => getQuestionTypesByCategory(certificationType),
    [certificationType]
  );
  const defaultQuestionType = getDefaultQuestionTypeForCertification(certificationType);

  const [qualityScore, setQualityScore] = useState<number>(0);
  const [sectionLabel, setSectionLabel] = useState<string>('');

  const [form, dispatch] = useReducer(questionFormReducer, initialFormState);
  const { questionText, questionType, difficulty, shuffleOptions, options, explanation, referenceType, passageSource, highlight, properties, audioUrl, imageUrl, passageId, passageText, modelAnswer, rubric, gridInAnswer, matchingPairs, wordRoot, keyWord, writingTaskType, speakingPrompt } = form;

  const currentQuestionTypeConfig = useMemo(() => getQuestionTypeConfig(certificationType, questionType), [certificationType, questionType]);

  const [isDirty, setIsDirty] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collectionTitle, setCollectionTitle] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const hydratedRef = useRef(false);

  const formStateRef = useRef(form);
  formStateRef.current = form;

  useBeforeUnload(isDirty, questionId);

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (apiData) {
      const record = apiData as QuestionBuilderData;
      const certType = record.certificationType || record.examType || 'TOEIC';
      setCertificationType(certType);
      if (!questionType) {
        dispatch({ type: 'SET_FIELD', field: 'questionType', value: getDefaultQuestionTypeForCertification(certType) });
      }
    }
  }, [apiData, questionType]);

  useEffect(() => {
    if (!questionId) return;
    const draft = loadDraftFromStorage<QuestionFormState>(questionId, DRAFT_PREFIX);
    if (draft) {
      dispatch({ type: 'HYDRATE', payload: draft });
      hydratedRef.current = true;
      return;
    }

    if (apiData) {
      const { payload, metadata } = mapApiDataToFormPayload(apiData as QuestionBuilderData);
      setCollectionId(metadata.collectionId);
      setCollectionTitle(metadata.collectionTitle);
      setExamTitle(metadata.examTitle);
      setSectionLabel(metadata.sectionLabel);
      setQualityScore(metadata.qualityScore);
      setCertificationType(metadata.certificationType);
      dispatch({ type: 'HYDRATE', payload });
      hydratedRef.current = true;
    }
  }, [apiData, questionId]);

  useEffect(() => {
    if (!hydratedRef.current || !isDirty || !questionId) return;
    const timer = setTimeout(() => {
      saveDraftToStorage(questionId, DRAFT_PREFIX, formStateRef.current);
    }, AUTO_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isDirty, questionId, questionText, questionType, difficulty, shuffleOptions, options, explanation, properties, passageId, passageText, modelAnswer, rubric, matchingPairs, wordRoot, keyWord]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const optionHandlers = useOptionHandlers({ form, dispatch, setIsDirty });
  const fieldHandlers = useFieldHandlers({ form, dispatch, setIsDirty });

  const handleSaveQuestion = useCallback(() => {
    saveQuestionMutation.mutate({
      ...buildSavePayload(form, certificationType, 'exam'),
      examId: examId || undefined,
      sectionId: sectionIdFromNav || undefined,
    }, {
      onSuccess: (result) => {
        clearDraftFromStorage(questionId, DRAFT_PREFIX);
        setIsDirty(false);
        if (examId && result?.id) {
          linkQuestionMutation.mutate({
            examId,
            questionId: result.id,
            sectionId: sectionIdFromNav,
            audioUrl,
            imageUrl,
            writingTaskType,
            speakingPrompt,
            isGridIn: gridInAnswer ? true : undefined,
          });
        }
      },
    });
  }, [saveQuestionMutation, form, certificationType, examId, questionId, linkQuestionMutation, sectionIdFromNav, audioUrl, imageUrl, writingTaskType, speakingPrompt, gridInAnswer]);

  const handleSaveToBank = useCallback(() => {
    saveQuestionMutation.mutate(buildSavePayload(form, certificationType, 'bank'), {
      onSuccess: () => {
        clearDraftFromStorage(questionId, DRAFT_PREFIX);
        setIsDirty(false);
      },
    });
  }, [saveQuestionMutation, form, certificationType, questionId]);

  const handlePreviewQuestion = useCallback(() => {
    setShowPreview((previousValue) => !previousValue);
  }, []);

  const handleDeleteQuestion = useCallback(() => {
    if (!questionId) return;
    if (!window.confirm('Delete this question? This action cannot be undone.')) return;
    deleteQuestionMutation.mutate({
      id: questionId,
      examId: examId || undefined,
      sectionId: sectionIdFromNav || undefined,
    }, {
      onSuccess: () => {
        clearDraftFromStorage(questionId, DRAFT_PREFIX);
        if (examId) {
          navigate(`/certification/exam-builder/${examId}`);
        } else {
          navigate(-1);
        }
      },
    });
  }, [questionId, deleteQuestionMutation, examId, sectionIdFromNav, navigate]);

  const currentQuestionIndex = questionIds.indexOf(questionId);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const previousQuestionId = questionIds[currentQuestionIndex - 1];
      navigate(`/certification/exam-builder/${examId}/question-builder/${previousQuestionId}`, {
        state: { questionIds },
      });
    } else if (examId) {
      navigate(`/certification/exam-builder/${examId}`);
    }
  }, [currentQuestionIndex, questionIds, examId, navigate]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questionIds.length - 1) {
      const nextQuestionId = questionIds[currentQuestionIndex + 1];
      navigate(`/certification/exam-builder/${examId}/question-builder/${nextQuestionId}`, {
        state: { questionIds },
      });
    } else if (examId) {
      navigate(`/certification/exam-builder/${examId}`);
    }
  }, [currentQuestionIndex, questionIds, examId, navigate]);

  const handleBackToExamBuilder = useCallback(() => {
    if (examId) {
      navigate(`/certification/exam-builder/${examId}`);
    } else {
      navigate('/certification/creator-dashboard');
    }
  }, [navigate, examId]);

  const navigateToCreatorDashboard = useCallback(() => {
    navigate('/certification/creator-dashboard');
  }, [navigate]);

  const navigateToCollectionEditor = useCallback((id: string) => {
    navigate(`/certification/collection-editor/${id}`);
  }, [navigate]);

  const navigateToExamBuilder = useCallback((id: string) => {
    navigate(`/certification/exam-builder/${id}`);
  }, [navigate]);

  return {
    isApiLoading, isError, refetch, isSaving: saveQuestionMutation.isPending,
    questionId, examId, collectionId, collectionTitle, examTitle,
    certificationType, setCertificationType, availableQuestionTypes, questionTypesByCategory,
    defaultQuestionType, currentQuestionTypeConfig, qualityScore, sectionLabel,
    hasPreviousQuestion: currentQuestionIndex > 0,
    hasNextQuestion: currentQuestionIndex >= 0 && currentQuestionIndex < questionIds.length - 1,
    questionNumber: currentQuestionIndex >= 0 ? currentQuestionIndex + 1 : 1,
    activeTab, setActiveTab, textMediaMode, setTextMediaMode,
    previewViewport, setPreviewViewport, showPreview, setShowPreview,
    questionText, setQuestionText: fieldHandlers.handleSetQuestionText,
    questionType, setQuestionType: fieldHandlers.handleSetQuestionType,
    difficulty, setDifficulty: fieldHandlers.handleSetDifficulty,
    shuffleOptions, setShuffleOptions: fieldHandlers.handleSetShuffleOptions,
    options, explanation, setExplanation: fieldHandlers.handleSetExplanation,
    referenceType, setReferenceType: fieldHandlers.handleSetReferenceType,
    passageSource, setPassageSource: fieldHandlers.handleSetPassageSource,
    highlight, setHighlight: fieldHandlers.handleSetHighlight,
    properties, setProperties: fieldHandlers.handleSetProperties,
    audioUrl, setAudioUrl: fieldHandlers.handleSetAudioUrl,
    imageUrl, setImageUrl: fieldHandlers.handleSetImageUrl,
    passageId, setPassageId: fieldHandlers.handleSetPassageId,
    passageText, setPassageText: fieldHandlers.handleSetPassageText,
    modelAnswer, setModelAnswer: fieldHandlers.handleSetModelAnswer,
    rubric, setRubric: fieldHandlers.handleSetRubric,
    gridInAnswer, setGridInAnswer: fieldHandlers.handleSetGridInAnswer,
    matchingPairs, setMatchingPairs: fieldHandlers.handleSetMatchingPairs,
    wordRoot, setWordRoot: fieldHandlers.handleSetWordRoot,
    keyWord, setKeyWord: fieldHandlers.handleSetKeyWord,
    writingTaskType, setWritingTaskType: fieldHandlers.handleSetWritingTaskType,
    speakingPrompt, setSpeakingPrompt: fieldHandlers.handleSetSpeakingPrompt,
    handleSelectCorrectOption: optionHandlers.handleSelectCorrectOption,
    handleAddOption: optionHandlers.handleAddOption,
    handleAddOtherOption: optionHandlers.handleAddOtherOption,
    handleRemoveOption: optionHandlers.handleRemoveOption,
    handleUpdateOptionText: optionHandlers.handleUpdateOptionText,
    handleRemoveTag: fieldHandlers.handleRemoveTag,
    handleRemoveSkill: fieldHandlers.handleRemoveSkill,
    handleSaveQuestion, handleSaveToBank, handlePreviewQuestion,
    handleDeleteQuestion, handlePreviousQuestion, handleNextQuestion, handleBackToExamBuilder,
    navigateToCreatorDashboard, navigateToCollectionEditor, navigateToExamBuilder,
  };
}
