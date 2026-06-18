import type { EditorJsOutputData, EditorJsBlock } from '../types';
import { transformWordToBionicHtml } from '../services/reading.service';

export interface ParsedContent {
  isBook: boolean;
  chapters?: { id: string; title: string; content: EditorJsOutputData | null; isDraft?: boolean }[];
  editorData?: EditorJsOutputData | null; // EditorJS OutputData
  audioUrl?: string | null;
  isBilingual?: boolean;
  plainText: string;
}

export const extractTextFromBlocks = (content: EditorJsOutputData | null | string): string => {
  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) {
    return typeof content === 'string' ? content : '';
  }

  const parts: string[] = [];
  content.blocks.forEach((block: EditorJsBlock) => {
    if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
      const text = block.data?.text || '';
      const plain = text.replace(/<[^>]*>?/gm, '').trim();
      if (plain) parts.push(plain);
    } else if (block.type === 'list' && Array.isArray(block.data?.items)) {
      block.data.items.forEach((item: string) => {
        const plain = item.replace(/<[^>]*>?/gm, '').trim();
        if (plain) parts.push(plain);
      });
    } else if (block.type === 'bilingualBlock' && block.data) {
      const orig = (block.data.original || '').replace(/<[^>]*>?/gm, '').trim();
      const trans = (block.data.translation || '').replace(/<[^>]*>?/gm, '').trim();
      if (orig) parts.push(orig);
      if (trans) parts.push(trans);
    }
  });

  return parts.join('\n\n');
};

export const parseReaderContent = (contentString: string, category?: string): ParsedContent => {
  if (!contentString) {
    return { isBook: false, plainText: '' };
  }

  try {
    const parsed = JSON.parse(contentString);

    // Check if it's a Book structure
    if (category === 'book' || (parsed && Array.isArray(parsed.chapters))) {
      return {
        isBook: true,
        chapters: parsed.chapters || [],
        audioUrl: parsed.audioUrl || null,
        isBilingual: parsed.isBilingual || false,
        plainText: '',
      };
    }

    // Check if it has the wrapped article format
    if (parsed && parsed.editorData !== undefined) {
      const editorData = parsed.editorData;
      const plainText = extractTextFromBlocks(editorData);
      return {
        isBook: false,
        editorData,
        audioUrl: parsed.audioUrl || null,
        isBilingual: parsed.isBilingual || false,
        plainText,
      };
    }

    // Check if it's direct EditorJS blocks
    if (parsed && Array.isArray(parsed.blocks)) {
      const plainText = extractTextFromBlocks(parsed);
      return {
        isBook: false,
        editorData: parsed,
        plainText,
      };
    }

    return {
      isBook: false,
      plainText: contentString,
    };
  } catch (e) {
    return {
      isBook: false,
      plainText: contentString,
    };
  }
};

export const bionicTransformInner = (text: string, fixation = 0.4, saccade = 1.0): string => {
  if (!text) return '';
  const words = text.split(/(\s+)/);
  let wordCounter = 0;

  const bionicWords = words.map((w) => {
    if (/^\s+$/.test(w)) return w;
    if (w.startsWith('<') && w.endsWith('>')) return w;

    wordCounter++;
    const step = Math.round(1 / saccade);
    const shouldBionic = step <= 1 || wordCounter % step === 0;

    if (!shouldBionic) return w;
    return transformWordToBionicHtml(w, fixation);
  });

  return bionicWords.join('');
};
