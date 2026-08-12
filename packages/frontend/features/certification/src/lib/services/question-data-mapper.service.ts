import type { QuestionBuilderData, SaveQuestionDto } from '../types';
import type { QuestionFormState } from '../types/question-builder.types';

interface HydrationMetadata {
  collectionId: string | null;
  collectionTitle: string | null;
  examTitle: string;
  sectionLabel: string;
  qualityScore: number;
  certificationType: string;
}

export function mapApiDataToFormPayload(apiData: QuestionBuilderData): {
  payload: Partial<QuestionFormState>;
  metadata: HydrationMetadata;
} {
  const metadata: HydrationMetadata = {
    collectionId: null,
    collectionTitle: null,
    examTitle: '',
    sectionLabel: '',
    qualityScore: 0,
    certificationType: apiData.certificationType || apiData.examType || 'TOEIC',
  };

  if (apiData.usedIn) {
    metadata.collectionId = apiData.usedIn.collectionId || null;
    metadata.collectionTitle = apiData.usedIn.collectionTitle || null;
    metadata.examTitle = apiData.usedIn.examTitle || '';
    metadata.sectionLabel = apiData.usedIn.sectionInfo || '';
  }
  if (apiData.qualityScore) {
    metadata.qualityScore = apiData.qualityScore.score || 0;
  }

  const payload: Partial<QuestionFormState> = {};

  if (apiData.questionText) payload.questionText = apiData.questionText;
  if (apiData.questionType) payload.questionType = apiData.questionType;
  if (apiData.difficulty) payload.difficulty = apiData.difficulty as QuestionFormState['difficulty'];
  if (apiData.shuffleOptions !== undefined) payload.shuffleOptions = apiData.shuffleOptions;
  if (apiData.options && Array.isArray(apiData.options)) {
    payload.options = apiData.options;
  }
  if (apiData.explanation) payload.explanation = apiData.explanation;

  if (apiData.reference) {
    if (apiData.reference.type) payload.referenceType = apiData.reference.type as QuestionFormState['referenceType'];
    if (apiData.reference.passageSource) payload.passageSource = apiData.reference.passageSource;
    if (apiData.reference.highlight) payload.highlight = apiData.reference.highlight;
  }

  const fmt = apiData.examFormatFields;
  if (fmt) {
    if (fmt.audioUrl) payload.audioUrl = fmt.audioUrl;
    if (fmt.imageUrl) payload.imageUrl = fmt.imageUrl;
    if (fmt.passageId) payload.passageId = fmt.passageId;
    if (fmt.passageText) payload.passageText = fmt.passageText;
    if (fmt.modelAnswer) payload.modelAnswer = fmt.modelAnswer;
    if (fmt.rubric) payload.rubric = String(fmt.rubric);
    if (fmt.matchingPairs) payload.matchingPairs = fmt.matchingPairs as Array<{ left: string; right: string }>;
    if (fmt.wordRoot) payload.wordRoot = fmt.wordRoot;
    if (fmt.keyWord) payload.keyWord = fmt.keyWord;
    if (fmt.gridInAnswer) payload.gridInAnswer = fmt.gridInAnswer;
    if (fmt.writingTaskType) payload.writingTaskType = fmt.writingTaskType;
    if (fmt.speakingPrompt) payload.speakingPrompt = fmt.speakingPrompt;
  }

  if (apiData.properties) {
    payload.properties = {
      id: apiData.properties.id || apiData.id,
      points: apiData.properties.points ?? 1,
      estimatedTime: apiData.properties.estimatedTime || '00:45',
      tags: apiData.properties.tags || [],
      skills: apiData.properties.skills || [],
      cognitiveLevel: apiData.properties.cognitiveLevel || 'Understand',
      createdDate: apiData.properties.createdDate || '',
      lastUpdatedDate: apiData.properties.lastUpdatedDate || '',
      createdBy: apiData.properties.createdBy || '',
    };
  }

  return { payload, metadata };
}

export function buildSavePayload(
  form: QuestionFormState,
  certificationType: string,
  target: 'exam' | 'bank',
): SaveQuestionDto {
  return {
    id: form.properties.id,
    questionText: form.questionText,
    questionType: form.questionType,
    difficulty: form.difficulty,
    category: certificationType || undefined,
    shuffleOptions: form.shuffleOptions,
    options: form.options.map((option) => ({
      id: option.id,
      label: option.label,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
    explanation: form.explanation,
    points: form.properties.points,
    estimatedTime: form.properties.estimatedTime,
    tags: form.properties.tags,
    skills: form.properties.skills,
    cognitiveLevel: form.properties.cognitiveLevel,
    target,
    referenceType: form.referenceType,
    passageSource: form.passageSource,
    highlight: form.highlight,
    passageId: form.passageId,
    passageText: form.passageText,
    modelAnswer: form.modelAnswer,
    rubric: form.rubric,
    matchingPairs: form.matchingPairs,
    wordRoot: form.wordRoot,
    keyWord: form.keyWord,
  };
}
