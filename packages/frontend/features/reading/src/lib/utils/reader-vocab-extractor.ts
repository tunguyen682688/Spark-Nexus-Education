import type { EditorJsOutputData, EditorJsBlock } from '../types';

export interface HighlightedVocabItem {
  word: string;
  definition: string;
  pronunciation: string;
  level: string;
}

/**
 * Extracts highlighted vocabulary words from EditorJS output blocks or raw text content string.
 */
export const extractVocabFromBlocks = (
  content: EditorJsOutputData | null | string
): HighlightedVocabItem[] => {
  if (!content) return [];

  let rawText = '';
  if (typeof content === 'object' && Array.isArray(content.blocks)) {
    content.blocks.forEach((block: EditorJsBlock) => {
      if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
        rawText += ' ' + (block.data?.text || '');
      } else if (block.type === 'list' && Array.isArray(block.data?.items)) {
        rawText += ' ' + block.data.items.join(' ');
      } else if (block.type === 'bilingualBlock' && block.data) {
        rawText += ' ' + (block.data.original || '') + ' ' + (block.data.translation || '');
      }
    });
  } else if (typeof content === 'string') {
    rawText = content;
  }

  const vocabMap = new Map<string, HighlightedVocabItem>();
  // Match span elements with class vocab-highlight
  const spanRegex = /<span\s+[^>]*class=["']vocab-highlight["'][^>]*>([\s\S]*?)<\/span>/gi;
  let match;
  while ((match = spanRegex.exec(rawText)) !== null) {
    const fullSpan = match[0];
    const wordText = match[1].replace(/<[^>]*>?/gm, '').trim();
    if (!wordText) continue;

    const defMatch = fullSpan.match(/data-def=["']([\s\S]*?)["']/i);
    const pronMatch = fullSpan.match(/data-pron=["']([\s\S]*?)["']/i);
    const levelMatch = fullSpan.match(/data-level=["']([\s\S]*?)["']/i);

    const definition = defMatch ? defMatch[1] : '';
    const pronunciation = pronMatch ? pronMatch[1] : '';
    const level = levelMatch ? levelMatch[1] : '';

    const wordLower = wordText.toLowerCase();
    if (!vocabMap.has(wordLower)) {
      vocabMap.set(wordLower, {
        word: wordText,
        definition: definition.replace(/&quot;/g, '"'),
        pronunciation: pronunciation.replace(/&quot;/g, '"'),
        level: level.replace(/&quot;/g, '"'),
      });
    }
  }

  return Array.from(vocabMap.values());
};
