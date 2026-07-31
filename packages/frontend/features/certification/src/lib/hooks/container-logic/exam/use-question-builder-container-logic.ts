import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useQuestionBuilderData, useSaveQuestion, useDeleteQuestion } from '../../use-certification';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { SaveQuestionDto, QuestionBuilderData } from '../../../types';

// ===== Types =====

export interface AnswerOptionItem {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionPropertiesForm {
  id: string;
  points: number;
  estimatedTime: string;
  tags: string[];
  skills: string[];
  cognitiveLevel: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
}

// ===== Hook =====

export function useQuestionBuilderContainerLogic() {
  const navigate = useNavigate();
  const { id, examId: urlExamId, questionId: urlQuestionId } = useParams<{
    id: string;
    examId: string;
    questionId: string;
  }>();

  const questionId = urlQuestionId || id || '';
  const examId = urlExamId || undefined;

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useQuestionBuilderData(questionId);
  const saveQuestionMutation = useSaveQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const [activeTab, setActiveTab] = useState<'Question' | 'Explanation' | 'Tags & Skills' | 'History'>('Question');
  const [textMediaMode, setTextMediaMode] = useState<'Text' | 'Media'>('Text');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Question form — empty by default, hydrated from API
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('Multiple Choice (Single Answer)');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [shuffleOptions, setShuffleOptions] = useState(false);

  const [options, setOptions] = useState<AnswerOptionItem[]>([]);
  const [explanation, setExplanation] = useState('');

  const [referenceType, setReferenceType] = useState<'Passage' | 'Image' | 'External Link'>('Passage');
  const [passageSource, setPassageSource] = useState('');
  const [highlight, setHighlight] = useState('');

  const [properties, setProperties] = useState<QuestionPropertiesForm>({
    id: '',
    points: 1,
    estimatedTime: '00:45',
    tags: [],
    skills: [],
    cognitiveLevel: 'Understand',
    createdDate: '',
    lastUpdatedDate: '',
    createdBy: '',
  });

  // Hydrate from API
  useEffect(() => {
    if (!apiData) return;

    const record = apiData as QuestionBuilderData;
    if (record.questionText) setQuestionText(record.questionText);
    if (record.questionType) setQuestionType(record.questionType);
    if (record.difficulty) setDifficulty(record.difficulty as 'Easy' | 'Medium' | 'Hard');
    if (record.shuffleOptions !== undefined) setShuffleOptions(record.shuffleOptions);
    if (record.options && Array.isArray(record.options)) {
      setOptions(record.options);
    }
    if (record.explanation) setExplanation(record.explanation);
    if (record.reference) {
      if (record.reference.type) setReferenceType(record.reference.type as 'Passage' | 'Image' | 'External Link');
      if (record.reference.passageSource) setPassageSource(record.reference.passageSource);
      if (record.reference.highlight) setHighlight(record.reference.highlight);
    }
    if (record.properties) {
      setProperties({
        id: record.properties.id || record.id,
        points: record.properties.points ?? 1,
        estimatedTime: record.properties.estimatedTime || '00:45',
        tags: record.properties.tags || [],
        skills: record.properties.skills || [],
        cognitiveLevel: record.properties.cognitiveLevel || 'Understand',
        createdDate: record.properties.createdDate || '',
        lastUpdatedDate: record.properties.lastUpdatedDate || '',
        createdBy: record.properties.createdBy || '',
      });
    }
  }, [apiData]);

  // ===== Option handlers =====

  const handleSelectCorrectOption = (optionId: string) => {
    setOptions((prev) =>
      prev.map((option) => ({
        ...option,
        isCorrect: option.id === optionId,
      }))
    );
  };

  const handleAddOption = () => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLabel = labels[options.length] || `Option ${options.length + 1}`;
    const newOption: AnswerOptionItem = {
      id: `opt-${Date.now()}`,
      label: nextLabel,
      text: '',
      isCorrect: false,
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleAddOtherOption = () => {
    const newOption: AnswerOptionItem = {
      id: `opt-other-${Date.now()}`,
      label: 'Other',
      text: 'Other (specify...)',
      isCorrect: false,
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions((prev) => prev.filter((option) => option.id !== optionId));
  };

  const handleUpdateOptionText = (optionId: string, newText: string) => {
    setOptions((prev) =>
      prev.map((option) => (option.id === optionId ? { ...option, text: newText } : option))
    );
  };

  // ===== Tag/Skill handlers =====

  const handleRemoveTag = (tagToRemove: string) => {
    setProperties((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProperties((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // ===== Save =====

  const buildPayload = useMemo(
    () =>
      (target: 'exam' | 'bank'): SaveQuestionDto => ({
        id: properties.id,
        questionText,
        questionType,
        difficulty,
        shuffleOptions,
        options: options.map((option) => ({
          id: option.id,
          label: option.label,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
        explanation,
        points: properties.points,
        estimatedTime: properties.estimatedTime,
        tags: properties.tags,
        skills: properties.skills,
        cognitiveLevel: properties.cognitiveLevel,
        target,
      }),
    [
      properties.id,
      properties.points,
      properties.estimatedTime,
      properties.tags,
      properties.skills,
      properties.cognitiveLevel,
      questionText,
      questionType,
      difficulty,
      shuffleOptions,
      options,
      explanation,
    ]
  );

  const handleSaveQuestion = () => {
    saveQuestionMutation.mutate(buildPayload('exam'));
  };

  const handleSaveToBank = () => {
    saveQuestionMutation.mutate(buildPayload('bank'));
  };

  // ===== Navigation =====

  const { toast } = useToast();

  const handlePreviewQuestion = () => {
    toast(CERTIFICATION_UI_TEXT.toast.previewOpening);
  };

  const handleDeleteQuestion = () => {
    if (!questionId) return;
    deleteQuestionMutation.mutate(questionId, {
      onSuccess: () => {
        if (examId) {
          navigate(`/certification/exam-builder/${examId}`);
        } else {
          navigate(-1);
        }
      },
    });
  };

  const handlePreviousQuestion = () => {
    if (examId) {
      // TODO: Requires question list from exam-builder context for proper navigation
      navigate(`/certification/exam-builder/${examId}`);
    }
  };

  const handleNextQuestion = () => {
    if (examId) {
      // TODO: Requires question list from exam-builder context for proper navigation
      navigate(`/certification/exam-builder/${examId}`);
    }
  };

  const handleBackToExamBuilder = () => {
    if (examId) {
      navigate(`/certification/exam-builder/${examId}`);
    } else {
      navigate('/certification/creator-dashboard');
    }
  };

  return {
    isApiLoading,
    isError,
    refetch,
    isSaving: saveQuestionMutation.isPending,
    questionId,
    examId,
    activeTab,
    setActiveTab,
    textMediaMode,
    setTextMediaMode,
    previewViewport,
    setPreviewViewport,
    questionText,
    setQuestionText,
    questionType,
    setQuestionType,
    difficulty,
    setDifficulty,
    shuffleOptions,
    setShuffleOptions,
    options,
    explanation,
    setExplanation,
    referenceType,
    setReferenceType,
    passageSource,
    setPassageSource,
    highlight,
    setHighlight,
    properties,
    setProperties,
    handleSelectCorrectOption,
    handleAddOption,
    handleAddOtherOption,
    handleRemoveOption,
    handleUpdateOptionText,
    handleRemoveTag,
    handleRemoveSkill,
    handleSaveQuestion,
    handleSaveToBank,
    handlePreviewQuestion,
    handleDeleteQuestion,
    handlePreviousQuestion,
    handleNextQuestion,
    handleBackToExamBuilder,
  };
}
