import type { VocabularySet } from './vocabulary-set.types';

export interface CommunityVocabularySet extends VocabularySet {
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  favoriteCount: number;
  cloneCount: number;
  isFavorited?: boolean;
}
