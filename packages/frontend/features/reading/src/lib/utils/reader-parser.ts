import type { EditorJsOutputData, EditorJsBlock } from '../types';
import { transformWordToBionicHtml } from '../services/reading.service';

export interface ParsedContent {
  isBook: boolean;
  chapters?: { id: string; title: string; content: EditorJsOutputData | null; isDraft?: boolean }[];
  sections?: ReaderSection[];
  editorData?: EditorJsOutputData | null; // EditorJS OutputData
  audioUrl?: string | null;
  isBilingual?: boolean;
  plainText: string;
}

export interface ReaderSection {
  id: string;
  title: string;
  level: number;
  index: number;
}

export const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();

export const buildReaderHeadingId = (title: string, index: number): string => {
  const normalized = stripHtml(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `reader-section-${normalized || 'section'}-${index}`;
};

export const extractSectionsFromBlocks = (
  content: EditorJsOutputData | null | string
): ReaderSection[] => {
  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) {
    return [];
  }

  return content.blocks.reduce<ReaderSection[]>((sections, block, index) => {
    if (block.type !== 'header') return sections;

    const title = stripHtml(block.data?.text || '');
    if (!title) return sections;

    sections.push({
      id: buildReaderHeadingId(title, index),
      title,
      level: Number(block.data?.level || 2),
      index,
    });

    return sections;
  }, []);
};

export const extractTextFromBlocks = (content: EditorJsOutputData | null | string): string => {
  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) {
    return typeof content === 'string' ? content : '';
  }

  const parts: string[] = [];
  content.blocks.forEach((block: EditorJsBlock) => {
    if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
      const text = block.data?.text || '';
      const plain = stripHtml(text);
      if (plain) parts.push(plain);
    } else if (block.type === 'list' && Array.isArray(block.data?.items)) {
      block.data.items.forEach((item: string) => {
        const plain = stripHtml(item);
        if (plain) parts.push(plain);
      });
    } else if (block.type === 'bilingualBlock' && block.data) {
      const orig = stripHtml(block.data.original || '');
      const trans = stripHtml(block.data.translation || '');
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
        sections: extractSectionsFromBlocks(editorData),
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
        sections: extractSectionsFromBlocks(parsed),
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
