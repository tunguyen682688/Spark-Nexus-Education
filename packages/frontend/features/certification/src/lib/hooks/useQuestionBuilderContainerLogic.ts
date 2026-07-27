import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestionBuilderData, useSaveQuestion } from './use-certification';
import type { SaveQuestionDto } from '../types';

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

export function useQuestionBuilderContainerLogic() {
  const navigate = useNavigate();
  const { id, examId: urlExamId, questionId: urlQuestionId } = useParams<{
    id: string;
    examId: string;
    questionId: string;
  }>();

  // Support both nested route (examId + questionId) and standalone route (id)
  const questionId = urlQuestionId || id || 'Q-000012';
  const examId = urlExamId || undefined;

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useQuestionBuilderData(questionId);
  const saveQuestionMutation = useSaveQuestion();

  const [activeTab, setActiveTab] = useState<'Question' | 'Explanation' | 'Tags & Skills' | 'History'>('Question');
  const [textMediaMode, setTextMediaMode] = useState<'Text' | 'Media'>('Text');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Question Form State
  const [questionText, setQuestionText] = useState<string>(
    'According to the advertisement, what is the main benefit of the new language learning app?'
  );
  const [questionType, setQuestionType] = useState<string>('Multiple Choice (Single Answer)');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);

  // Options State
  const [options, setOptions] = useState<AnswerOptionItem[]>([
    {
      id: 'opt-a',
      label: 'A',
      text: 'It offers free certification.',
      isCorrect: false,
    },
    {
      id: 'opt-b',
      label: 'B',
      text: 'It provides lessons with native speakers.',
      isCorrect: false,
    },
    {
      id: 'opt-c',
      label: 'C',
      text: 'It helps learners track progress and improve faster.',
      isCorrect: true,
    },
    {
      id: 'opt-d',
      label: 'D',
      text: 'It allows offline access to all courses.',
      isCorrect: false,
    },
  ]);

  // Explanation State
  const [explanation, setExplanation] = useState<string>(
    'The advertisement states that the app uses AI to personalize learning and track your progress, helping you improve faster.'
  );

  // Reference State
  const [referenceType, setReferenceType] = useState<'Passage' | 'Image' | 'External Link'>('Passage');
  const [passageSource, setPassageSource] = useState<string>('Passage 2');
  const [highlight, setHighlight] = useState<string>('e.g., line 3 to line 5');

  // Properties Form State
  const [properties, setProperties] = useState<QuestionPropertiesForm>({
    id: 'Q-000012',
    points: 1,
    estimatedTime: '00:45',
    tags: ['TOEIC', 'Reading', 'Advertisement'],
    skills: ['Main Idea', 'Understanding Purpose'],
    cognitiveLevel: 'Understand',
    createdDate: 'May 16, 2024 10:15 AM',
    lastUpdatedDate: 'May 16, 2024 02:45 PM',
    createdBy: 'Minh Anh',
  });

  useEffect(() => {
    if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {
      const record = apiData as unknown as Record<string, unknown>;
      if (record['questionText']) setQuestionText(String(record['questionText']));
      if (record['questionType']) setQuestionType(String(record['questionType']));
      if (record['difficulty']) setDifficulty(record['difficulty'] as 'Easy' | 'Medium' | 'Hard');
      if (record['options'] && Array.isArray(record['options'])) {
        setOptions(record['options'] as AnswerOptionItem[]);
      }
      if (record['explanation']) setExplanation(String(record['explanation']));
      if (record['properties'] && typeof record['properties'] === 'object') {
        setProperties((prev) => ({ ...prev, ...(record['properties'] as unknown as Partial<QuestionPropertiesForm>) }));
      }
    }
  }, [apiData]);

  // Select Correct Option Handler
  const handleSelectCorrectOption = (optId: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optId,
      }))
    );
  };

  const handleAddOption = () => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLabel = labels[options.length] || `Option ${options.length + 1}`;
    const newOpt: AnswerOptionItem = {
      id: `opt-${Date.now()}`,
      label: nextLabel,
      text: 'New answer option text.',
      isCorrect: false,
    };
    setOptions((prev) => [...prev, newOpt]);
  };

  const handleAddOtherOption = () => {
    const newOpt: AnswerOptionItem = {
      id: `opt-other-${Date.now()}`,
      label: 'Other',
      text: 'Other (specify...)',
      isCorrect: false,
    };
    setOptions((prev) => [...prev, newOpt]);
  };

  const handleRemoveOption = (optId: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== optId));
  };

  const handleUpdateOptionText = (optId: string, newText: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optId ? { ...opt, text: newText } : opt))
    );
  };

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

  const buildPayload = useMemo(
    () =>
      (target: 'exam' | 'bank'): SaveQuestionDto => ({
        id: properties.id,
        questionText,
        questionType,
        difficulty,
        shuffleOptions,
        options: options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          text: opt.text,
          isCorrect: opt.isCorrect,
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

  const handlePreviewQuestion = () => {
    window.alert('Opening full screen live preview...');
  };

  const handleDeleteQuestion = () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      if (examId) {
        navigate(`/certification/exam-builder/${examId}`);
      } else {
        navigate(-1);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (examId) {
      // Navigate to previous question (placeholder: decrement question number)
      const prevId = `prev-${questionId}`;
      navigate(`/certification/exam-builder/${examId}/question-builder/${prevId}`);
    }
  };

  const handleNextQuestion = () => {
    if (examId) {
      // Navigate to next question (placeholder: increment question number)
      const nextId = `next-${questionId}`;
      navigate(`/certification/exam-builder/${examId}/question-builder/${nextId}`);
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
