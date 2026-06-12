export const TRANSLATION_SERVICE = Symbol('TRANSLATION_SERVICE');

export interface ITranslationService {
  /**
   * Translate a word based on the context sentence.
   */
  translateWordInContext(word: string, sentence: string): { translation: string; explanation: string };
}
