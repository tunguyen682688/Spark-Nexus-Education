import type {
  StudioFormValues,
  EditorJsOutputData,
  EditorJsBlock,
  StudioContentPayload,
  ArticleHighlightPayload,
} from '../types';

export const AVG_WPM = 200;

export const DEFAULT_FORM_VALUES: StudioFormValues = {
  title: '',
  content: null,
  summary: '',
  contentType: 'article',
  category: '',
  difficulty: '',
  tags: [],
  thumbnailUrl: null,
  sourceUrl: null,
  author: null,
  status: 'DRAFT',
  targetLanguage: 'en',
  audioUrl: null,
  isBilingual: false,
  chapters: [],
  chapterTitle: '',
  chapterContent: null,
  vocabularySetId: null,
};

export interface ContentPayloadWrapper {
  editorData?: EditorJsOutputData | null;
  chapters?: {
    id: string;
    title: string;
    content: EditorJsOutputData | null;
    isDraft: boolean;
  }[];
  audioUrl?: string | null;
  isBilingual?: boolean;
}

export function parseContent(
  content: string | EditorJsOutputData | StudioContentPayload | null | undefined
): EditorJsOutputData | StudioContentPayload {
  if (!content) return { time: Date.now(), blocks: [], version: '2.28.2' };
  if (typeof content === 'object') return content;
  try {
    return JSON.parse(content) as EditorJsOutputData | StudioContentPayload;
  } catch {
    return {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: String(content) } }],
      version: '2.28.2',
    };
  }
}

function cleanBlockHtmlAndExtractHighlights(
  htmlText: string,
  blockId: string
): { cleanHtml: string; highlights: ArticleHighlightPayload[] } {
  if (!htmlText || !htmlText.includes('vocab-highlight')) {
    return { cleanHtml: htmlText, highlights: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlText}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;
  if (!container) return { cleanHtml: htmlText, highlights: [] };

  const highlights: ArticleHighlightPayload[] = [];
  let wordCountSoFar = 0;

  const traverse = (node: Node) => {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const txt = child.textContent || '';
        const words = txt.split(/\s+/).filter(Boolean);
        wordCountSoFar += words.length;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (el.classList.contains('vocab-highlight')) {
          const entryId = el.getAttribute('data-entry-id') || '';
          const wordText = el.textContent || '';
          const wordCount = wordText.split(/\s+/).filter(Boolean).length;

          if (entryId) {
            highlights.push({
              blockId,
              wordIndex: wordCountSoFar,
              occurrenceText: wordText,
              entryId,
              customDefinition: el.getAttribute('data-def') || undefined,
              customExample: el.getAttribute('data-ex') || undefined,
              customExampleTrans: el.getAttribute('data-ex-trans') || undefined,
            });
          }

          const textNode = doc.createTextNode(wordText);
          el.parentNode?.replaceChild(textNode, el);
          wordCountSoFar += wordCount;
        } else {
          traverse(child);
        }
      }
    }
  };

  traverse(container);

  return {
    cleanHtml: container.innerHTML,
    highlights,
  };
}

export function cleanEditorDataAndExtractHighlights(
  editorData: EditorJsOutputData | null
): { cleanData: EditorJsOutputData | null; highlights: ArticleHighlightPayload[] } {
  if (!editorData || !Array.isArray(editorData.blocks)) {
    return { cleanData: editorData, highlights: [] };
  }

  const allHighlights: ArticleHighlightPayload[] = [];
  const cleanBlocks = editorData.blocks.map((block) => {
    const blockId = block.id;
    if (!blockId) return block;

    if (block.data && typeof block.data.text === 'string') {
      const { cleanHtml, highlights } = cleanBlockHtmlAndExtractHighlights(block.data.text, blockId);
      allHighlights.push(...highlights);
      return {
        ...block,
        data: {
          ...block.data,
          text: cleanHtml,
        },
      };
    }

    if (block.type === 'list' && Array.isArray(block.data?.items)) {
      const newItems = block.data.items.map((itemText: string) => {
        const { cleanHtml, highlights } = cleanBlockHtmlAndExtractHighlights(itemText, blockId);
        allHighlights.push(...highlights);
        return cleanHtml;
      });
      return {
        ...block,
        data: {
          ...block.data,
          items: newItems,
        },
      };
    }

    if (block.type === 'bilingualBlock' && block.data) {
      const originalResult = cleanBlockHtmlAndExtractHighlights(block.data.original || '', blockId);
      const translationResult = cleanBlockHtmlAndExtractHighlights(block.data.translation || '', blockId);
      allHighlights.push(...originalResult.highlights);
      allHighlights.push(...translationResult.highlights);
      return {
        ...block,
        data: {
          ...block.data,
          original: originalResult.cleanHtml,
          translation: translationResult.cleanHtml,
        },
      };
    }

    return block;
  });

  return {
    cleanData: {
      ...editorData,
      blocks: cleanBlocks,
    },
    highlights: allHighlights,
  };
}

interface WordLocation {
  node: Text;
  localWordIndex: number;
  globalWordIndex: number;
  wordText: string;
}

interface HighlightItem {
  blockId: string;
  wordIndex: number;
  occurrenceText: string;
  entryId?: string;
  customDefinition?: string | null;
  customExample?: string | null;
  customExampleTrans?: string | null;
  entry?: {
    id: string;
    pronunciation?: string | null;
    partOfSpeech?: string | null;
    notes?: string | null;
  };
}

function injectHighlightsToBlockHtml(htmlText: string, highlightsOfBlock: HighlightItem[]): string {
  if (highlightsOfBlock.length === 0) return htmlText;

  const sortedHighlights = [...highlightsOfBlock].sort((a, b) => b.wordIndex - a.wordIndex);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlText}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;
  if (!container) return htmlText;

  const wordLocations: WordLocation[] = [];
  let globalWordCounter = 0;

  const findWordLocations = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent || '';
      const tokens = txt.split(/(\s+)/);
      let localWordIdx = 0;
      tokens.forEach((token) => {
        if (/^\s*$/.test(token)) return;
        wordLocations.push({
          node: node as Text,
          localWordIndex: localWordIdx,
          globalWordIndex: globalWordCounter,
          wordText: token,
        });
        localWordIdx++;
        globalWordCounter++;
      });
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        findWordLocations(node.childNodes[i]);
      }
    }
  };

  findWordLocations(container);

  for (const h of sortedHighlights) {
    const loc = wordLocations.find((w) => w.globalWordIndex === h.wordIndex);
    if (!loc) continue;

    const textNode = loc.node;
    const txt = textNode.textContent || '';
    const tokens = txt.split(/(\s+)/);
    let wordCount = 0;
    let charOffset = 0;

    for (const token of tokens) {
      if (!/^\s*$/.test(token)) {
        if (wordCount === loc.localWordIndex) {
          const beforeText = txt.substring(0, charOffset);
          const wordText = token;
          const afterText = txt.substring(charOffset + token.length);

          const mark = doc.createElement('mark');
          mark.className = 'vocab-highlight';
          mark.setAttribute('data-vocab-id', `vocab_${Math.random().toString(36).substr(2, 9)}`);
          mark.setAttribute('data-entry-id', h.entry?.id || h.entryId || '');
          mark.setAttribute('data-level', h.entry?.partOfSpeech || h.customDefinition || '');
          mark.setAttribute('data-def', h.customDefinition || h.entry?.notes || '');
          mark.setAttribute('data-pron', h.entry?.pronunciation || '');
          mark.setAttribute('data-ex', h.customExample || '');
          mark.setAttribute('data-ex-trans', h.customExampleTrans || '');
          mark.textContent = wordText;

          const parent = textNode.parentNode;
          if (parent) {
            if (beforeText) {
              parent.insertBefore(doc.createTextNode(beforeText), textNode);
            }
            parent.insertBefore(mark, textNode);
            if (afterText) {
              const remainingNode = doc.createTextNode(afterText);
              parent.insertBefore(remainingNode, textNode);
              wordLocations.forEach((w) => {
                if (w.node === textNode && w.localWordIndex > loc.localWordIndex) {
                  w.node = remainingNode;
                  w.localWordIndex -= (loc.localWordIndex + 1);
                }
              });
            }
            parent.removeChild(textNode);
          }
          break;
        }
        wordCount++;
      }
      charOffset += token.length;
    }
  }

  return container.innerHTML;
}

export function injectHighlightsToEditorData(
  editorData: EditorJsOutputData | null | undefined,
  highlights: HighlightItem[]
): EditorJsOutputData | null {
  if (!editorData || !Array.isArray(editorData.blocks) || !highlights || highlights.length === 0) {
    return editorData || null;
  }

  const injectedBlocks = editorData.blocks.map((block) => {
    const blockId = block.id;
    if (!blockId) return block;

    const blockHighlights = highlights.filter((h) => h.blockId === blockId);
    if (blockHighlights.length === 0) return block;

    if (block.data && typeof block.data.text === 'string') {
      const injectedHtml = injectHighlightsToBlockHtml(block.data.text, blockHighlights);
      return {
        ...block,
        data: {
          ...block.data,
          text: injectedHtml,
        },
      };
    }

    if (block.type === 'list' && Array.isArray(block.data?.items)) {
      const itemsHtml = block.data.items;
      let currentWordOffset = 0;
      const newItems = itemsHtml.map((itemText: string) => {
        const itemWordsCount = itemText.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(Boolean).length;
        const itemHighlights = blockHighlights
          .filter((h) => h.wordIndex >= currentWordOffset && h.wordIndex < currentWordOffset + itemWordsCount)
          .map((h) => ({
            ...h,
            wordIndex: h.wordIndex - currentWordOffset,
          }));
        const injectedItem = injectHighlightsToBlockHtml(itemText, itemHighlights);
        currentWordOffset += itemWordsCount;
        return injectedItem;
      });

      return {
        ...block,
        data: {
          ...block.data,
          items: newItems,
        },
      };
    }

    if (block.type === 'bilingualBlock' && block.data) {
      const origInjected = injectHighlightsToBlockHtml(block.data.original || '', blockHighlights);
      return {
        ...block,
        data: {
          ...block.data,
          original: origInjected,
        },
      };
    }

    return block;
  });

  return {
    ...editorData,
    blocks: injectedBlocks,
  };
}

export function parseArticleContent(
  content: string | EditorJsOutputData | StudioContentPayload | null | undefined
) {
  const parsed = parseContent(content) as EditorJsOutputData & ContentPayloadWrapper;
  const hasWrapper =
    parsed &&
    (parsed.editorData !== undefined ||
      parsed.chapters !== undefined);
  return {
    editorContent: hasWrapper ? parsed.editorData : parsed,
    chaptersList: hasWrapper ? parsed.chapters || [] : [],
    audioUrl: hasWrapper ? parsed.audioUrl || null : null,
    isBilingual: hasWrapper ? parsed.isBilingual || false : false,
  };
}

export function countWordsFromBlocks(
  blocks: EditorJsBlock[] | undefined
): number {
  if (!blocks) return 0;
  let count = 0;
  blocks.forEach((block: EditorJsBlock) => {
    if (block.data?.text) {
      const plainText = block.data.text.replace(/<[^>]*>?/gm, '').trim();
      if (plainText) count += plainText.split(/\s+/).length;
    }
    if (block.type === 'list' && Array.isArray(block.data?.items)) {
      block.data.items.forEach((item: string) => {
        const plain = item.replace(/<[^>]*>?/gm, '').trim();
        if (plain) count += plain.split(/\s+/).length;
      });
    }
    if (block.type === 'bilingualBlock' && block.data) {
      const orig = (block.data.original || '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
      const trans = (block.data.translation || '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
      if (orig) count += orig.split(/\s+/).length;
      if (trans) count += trans.split(/\s+/).length;
    }
  });
  return count;
}
