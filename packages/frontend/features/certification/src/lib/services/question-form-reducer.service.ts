import type { QuestionFormState, QuestionFormAction } from '../types/question-builder.types';

export const initialFormState: QuestionFormState = {
  questionText: '',
  questionType: '',
  difficulty: 'Medium',
  shuffleOptions: false,
  options: [],
  explanation: '',
  referenceType: 'Passage',
  passageSource: '',
  highlight: '',
  properties: {
    id: '',
    points: 1,
    estimatedTime: '00:45',
    tags: [],
    skills: [],
    cognitiveLevel: 'Understand',
    createdDate: '',
    lastUpdatedDate: '',
    createdBy: '',
  },
  audioUrl: '',
  imageUrl: '',
  passageId: '',
  gridInAnswer: '',
  matchingPairs: [],
  wordRoot: '',
  keyWord: '',
  writingTaskType: '',
  speakingPrompt: '',
};

export function questionFormReducer(state: QuestionFormState, action: QuestionFormAction): QuestionFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: typeof action.value === 'function' ? action.value(state.properties) : action.value,
      };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
