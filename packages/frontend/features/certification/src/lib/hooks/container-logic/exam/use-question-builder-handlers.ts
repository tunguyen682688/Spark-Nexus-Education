import { useCallback } from 'react';
import type { AnswerOptionItem, QuestionPropertiesForm, HandlersDeps } from '../../../types/question-builder.types';

export type { HandlersDeps } from '../../../types/question-builder.types';

export function useOptionHandlers({ form, dispatch, setIsDirty }: HandlersDeps) {
  const handleSelectCorrectOption = useCallback((optionId: string) => {
    dispatch({
      type: 'SET_FIELD',
      field: 'options',
      value: form.options.map((option) => ({
        ...option,
        isCorrect: option.id === optionId,
      })),
    });
    setIsDirty(true);
  }, [form.options, dispatch, setIsDirty]);

  const handleAddOption = useCallback(() => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLabel = labels[form.options.length] || `Option ${form.options.length + 1}`;
    const newOption: AnswerOptionItem = {
      id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: nextLabel,
      text: '',
      isCorrect: false,
    };
    dispatch({ type: 'SET_FIELD', field: 'options', value: [...form.options, newOption] });
    setIsDirty(true);
  }, [form.options, dispatch, setIsDirty]);

  const handleAddOtherOption = useCallback(() => {
    const newOption: AnswerOptionItem = {
      id: `opt-other-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: 'Other',
      text: 'Other (specify...)',
      isCorrect: false,
    };
    dispatch({ type: 'SET_FIELD', field: 'options', value: [...form.options, newOption] });
    setIsDirty(true);
  }, [form.options, dispatch, setIsDirty]);

  const handleRemoveOption = useCallback((optionId: string) => {
    dispatch({
      type: 'SET_FIELD',
      field: 'options',
      value: form.options.filter((option) => option.id !== optionId),
    });
    setIsDirty(true);
  }, [form.options, dispatch, setIsDirty]);

  const handleUpdateOptionText = useCallback((optionId: string, newText: string) => {
    dispatch({
      type: 'SET_FIELD',
      field: 'options',
      value: form.options.map((option) => (option.id === optionId ? { ...option, text: newText } : option)),
    });
    setIsDirty(true);
  }, [form.options, dispatch, setIsDirty]);

  return {
    handleSelectCorrectOption,
    handleAddOption,
    handleAddOtherOption,
    handleRemoveOption,
    handleUpdateOptionText,
  };
}

export function useFieldHandlers({ dispatch, setIsDirty }: HandlersDeps) {
  const handleSetQuestionText = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'questionText', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetQuestionType = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'questionType', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetDifficulty = useCallback((value: 'Easy' | 'Medium' | 'Hard') => {
    dispatch({ type: 'SET_FIELD', field: 'difficulty', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetShuffleOptions = useCallback((value: boolean) => {
    dispatch({ type: 'SET_FIELD', field: 'shuffleOptions', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetExplanation = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'explanation', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetReferenceType = useCallback((value: 'Passage' | 'Image' | 'External Link') => {
    dispatch({ type: 'SET_FIELD', field: 'referenceType', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetPassageSource = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'passageSource', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetHighlight = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'highlight', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetAudioUrl = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'audioUrl', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetImageUrl = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'imageUrl', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetPassageId = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'passageId', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetPassageText = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'passageText', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetModelAnswer = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'modelAnswer', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetRubric = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'rubric', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetGridInAnswer = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'gridInAnswer', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetMatchingPairs = useCallback((pairs: Array<{ left: string; right: string }>) => {
    dispatch({ type: 'SET_FIELD', field: 'matchingPairs', value: pairs });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetWordRoot = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'wordRoot', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetKeyWord = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'keyWord', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetWritingTaskType = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'writingTaskType', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetSpeakingPrompt = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'speakingPrompt', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleSetProperties = useCallback((value: QuestionPropertiesForm | ((prev: QuestionPropertiesForm) => QuestionPropertiesForm)) => {
    dispatch({ type: 'SET_PROPERTIES', value });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    dispatch({
      type: 'SET_PROPERTIES',
      value: (prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      }),
    });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    dispatch({
      type: 'SET_PROPERTIES',
      value: (prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill !== skillToRemove),
      }),
    });
    setIsDirty(true);
  }, [dispatch, setIsDirty]);

  return {
    handleSetQuestionText,
    handleSetQuestionType,
    handleSetDifficulty,
    handleSetShuffleOptions,
    handleSetExplanation,
    handleSetReferenceType,
    handleSetPassageSource,
    handleSetHighlight,
    handleSetAudioUrl,
    handleSetImageUrl,
    handleSetPassageId,
    handleSetPassageText,
    handleSetModelAnswer,
    handleSetRubric,
    handleSetGridInAnswer,
    handleSetMatchingPairs,
    handleSetWordRoot,
    handleSetKeyWord,
    handleSetWritingTaskType,
    handleSetSpeakingPrompt,
    handleSetProperties,
    handleRemoveTag,
    handleRemoveSkill,
  };
}
