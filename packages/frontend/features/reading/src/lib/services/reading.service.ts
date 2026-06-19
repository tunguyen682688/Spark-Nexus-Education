import type { WeakWordItem } from '../types';

/**
 * Transforms a single word into HTML with the first part bolded (Bionic Reading style).
 */
export function transformWordToBionicHtml(
  word: string,
  fixation = 0.4
): string {
  const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
  if (!match) return word;

  const prefix = match[1];
  const cleanWord = match[2];
  const suffix = match[3];

  const L = cleanWord.length;
  let boldLen = 1;
  if (L === 3 || L === 4) {
    boldLen = Math.round(L * Math.max(0.4, fixation));
  } else if (L > 4) {
    boldLen = Math.ceil(L * fixation);
  }

  const boldPart = cleanWord.substring(0, boldLen);
  const regularPart = cleanWord.substring(boldLen);

  return `${prefix}<strong>${boldPart}</strong>${regularPart}${suffix}`;
}

/**
 * Transforms a paragraph or block of text into Bionic Reading HTML.
 */
export function bionicReadingTransform(
  text: string,
  fixation = 0.4,
  saccade = 1.0
): string {
  if (!text) return '';

  const paragraphs = text.split(/\n+/);

  const bionicParagraphs = paragraphs.map((para) => {
    const words = para.split(/(\s+)/);
    let wordCounter = 0;

    const bionicWords = words.map((w) => {
      if (/^\s+$/.test(w)) return w;

      wordCounter++;
      const step = Math.round(1 / saccade);
      const shouldBionic = step <= 1 || wordCounter % step === 0;

      if (!shouldBionic) return w;
      return transformWordToBionicHtml(w, fixation);
    });

    return `<p class="mb-4 leading-relaxed">${bionicWords.join('')}</p>`;
  });

  return bionicParagraphs.join('');
}

/**
 * TextToSpeechPlayer controls SpeechSynthesis for playing, pausing, and word boundary tracking.
 */
export class TextToSpeechPlayer {
  private static synth =
    typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static utterance: SpeechSynthesisUtterance | null = null;

  static play(
    text: string,
    rate = 1.0,
    onBoundary: (charIndex: number, charLength: number) => void,
    onEnd: () => void
  ) {
    if (!this.synth) return;
    this.synth.cancel();

    // Clean text by stripping HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');

    this.utterance = new SpeechSynthesisUtterance(cleanText);
    this.utterance.lang = 'en-US';
    this.utterance.rate = rate;

    this.utterance.onboundary = (event) => {
      const part = cleanText.substring(event.charIndex);
      const spaceIndex = part.indexOf(' ');
      const length = spaceIndex !== -1 ? spaceIndex : part.length;
      onBoundary(event.charIndex, length);
    };

    this.utterance.onend = () => {
      onEnd();
    };

    this.utterance.onerror = () => {
      onEnd();
    };

    this.synth.speak(this.utterance);
  }

  static pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  static resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

/**
 * Represents a single vocabulary highlight for a block, keyed by wordIndex.
 */
export interface VocabHighlightInfo {
  word: string;
  definition: string | null;
  pronunciation: string | null;
  partOfSpeech: string | null;
}

/**
 * Transforms text by highlighting weak words, vocabulary highlights, and applying Bionic Reading formatting.
 * @param vocabHighlightsMap – Map of wordIndex → VocabHighlightInfo for the current block (optional)
 */
export function highlightAndBionicTransform(
  text: string,
  isBionicMode: boolean,
  fixation: number,
  saccade: number,
  weakWordsMap: Map<string, WeakWordItem>,
  vocabHighlightsMap?: Map<number, VocabHighlightInfo>
): string {
  if (!text) return '';

  const tokens = text.split(/(\s+)/);
  let wordCounter = 0; // counts actual words (non-whitespace, non-tag tokens)

  const processedTokens = tokens.map((token) => {
    if (/^\s+$/.test(token)) return token;
    if (token.startsWith('<') && token.endsWith('>')) return token;

    const cleanWordMatch = token.match(/[a-zA-Z0-9'-]+/);
    const cleanWord = cleanWordMatch ? cleanWordMatch[0].toLowerCase() : '';

    const isWeakWord = cleanWord && weakWordsMap.has(cleanWord);
    const currentWordIndex = wordCounter;
    wordCounter++;

    // Check for decoupled vocabulary highlight by wordIndex
    const vocabHighlight = vocabHighlightsMap?.get(currentWordIndex);

    let transformedToken = token;
    if (isBionicMode) {
      const step = Math.round(1 / saccade);
      const shouldBionic = step <= 1 || (currentWordIndex + 1) % step === 0;
      if (shouldBionic) {
        transformedToken = transformWordToBionicHtml(token, fixation);
      }
    }

    // Vocabulary highlight (article-level, from creator studio) takes precedence
    if (vocabHighlight) {
      const def = vocabHighlight.definition ? vocabHighlight.definition.replace(/"/g, '&quot;') : '';
      const pron = vocabHighlight.pronunciation ? vocabHighlight.pronunciation.replace(/"/g, '&quot;') : '';
      const pos = vocabHighlight.partOfSpeech || '';

      return `<span class="vocab-highlight border-b-2 border-solid border-emerald-500 bg-emerald-500/10 cursor-pointer font-semibold inline-block transition-all hover:bg-emerald-500/20" data-word="${cleanWord}" data-def="${def}" data-pron="${pron}" data-pos="${pos}" data-word-index="${currentWordIndex}">${transformedToken}</span>`;
    }

    // Weak word highlight (user-level, from personal weak words)
    if (isWeakWord) {
      const weakWordData = weakWordsMap.get(cleanWord);
      if (!weakWordData) return transformedToken;

      const def = weakWordData.definition ? weakWordData.definition.replace(/"/g, '&quot;') : '';
      const pron = weakWordData.pronunciation ? weakWordData.pronunciation.replace(/"/g, '&quot;') : '';
      const audio = weakWordData.audioUrl ? weakWordData.audioUrl : '';
      const wordId = weakWordData.id;

      return `<span class="weak-word-highlight border-b-2 border-dotted border-red-500 bg-red-500/10 cursor-pointer font-semibold inline-block transition-all hover:bg-red-500/20" data-word-id="${wordId}" data-word="${cleanWord}" data-def="${def}" data-pron="${pron}" data-audio="${audio}">${transformedToken}</span>`;
    }

    return transformedToken;
  });

  return processedTokens.join('');
}

