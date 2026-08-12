import { vocabularySetsApi } from './vocabulary-sets-api';
import { vocabularyCommunityApi } from './vocabulary-community-api';
import { vocabularyFlashcardApi } from './vocabulary-flashcard-api';

export const vocabularyApi = {
  ...vocabularySetsApi,
  ...vocabularyCommunityApi,
  ...vocabularyFlashcardApi,
};

export { vocabularySetsApi } from './vocabulary-sets-api';
export { vocabularyCommunityApi } from './vocabulary-community-api';
export { vocabularyFlashcardApi } from './vocabulary-flashcard-api';
