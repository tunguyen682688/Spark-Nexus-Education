export type ReaderSettings = {
  isBionicMode: boolean;
  isFocusMode: boolean;
  focusHeightLines: 1 | 3;
  fontSize: 'sm' | 'md' | 'lg';
  fixation: number;
  saccade: number;
  ttsRate: number;
  isQuickSaveEnabled: boolean;
  isBilingualView: boolean;
};

const READER_SETTINGS_STORAGE_KEY = 'spark-nexus-reader-settings-v1';

export const readReaderSettings = (): Partial<ReaderSettings> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(READER_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const writeReaderSettings = (settings: ReaderSettings) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      READER_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Preference persistence should never block reading.
  }
};

export const getCharOffsetOfNode = (ancestor: Node, targetNode: Node): number => {
  let offset = 0;
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const showTextFilter = window.NodeFilter?.SHOW_TEXT ?? 4;
  const walk = document.createTreeWalker(ancestor, showTextFilter);
  while (walk.nextNode()) {
    const currentNode = walk.currentNode;
    if (targetNode.contains(currentNode)) {
      break;
    }
    offset += currentNode.textContent?.length || 0;
  }
  return offset;
};

export const getSurroundingSentence = (text: string, offset: number): string => {
  const sentenceEndings = /[.!?]/;
  let start = offset;
  let end = offset;

  while (start > 0 && !sentenceEndings.test(text[start - 1])) {
    start--;
  }

  while (end < text.length && !sentenceEndings.test(text[end])) {
    end++;
  }

  return text.substring(start, end + 1).trim();
};

export const getWordAndSentenceAtEvent = (e: MouseEvent): { word: string; sentence: string } | null => {
  let range: Range | null = null;

  const caretPosition = (Document.prototype as unknown as {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  }).caretPositionFromPoint;

  if (typeof caretPosition === 'function') {
    const position = caretPosition.call(document, e.clientX, e.clientY);
    if (position) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.setEnd(position.offsetNode, position.offset);
    }
  } else if (typeof (document as unknown as {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  }).caretRangeFromPoint === 'function') {
    range = (document as unknown as {
      caretRangeFromPoint: (x: number, y: number) => Range | null;
    }).caretRangeFromPoint(e.clientX, e.clientY);
  }

  if (!range) return null;

  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;

  const text = node.textContent || '';
  const offset = range.startOffset;

  let start = offset;
  while (start > 0 && /\w/.test(text[start - 1])) {
    start--;
  }
  let end = offset;
  while (end < text.length && /\w/.test(text[end])) {
    end++;
  }

  const word = text.substring(start, end).trim();
  if (!word || word.length <= 1 || !/^[a-zA-Z-]+$/.test(word)) return null;

  const sentence = getSurroundingSentence(text, offset);
  return { word, sentence };
};
