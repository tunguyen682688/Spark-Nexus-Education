export const TRANSLATION_SERVICE = Symbol('TRANSLATION_SERVICE');

export interface ITranslationService {
  /**
   * Translate a word based on the context sentence.
   */
  translateWordInContext(
    word: string,
    sentence: string
  ): Promise<{ translation: string; explanation: string }>;

  /**
   * Translate a paragraph of text.
   */
  translateParagraph(text: string): string | Promise<string>;
}
