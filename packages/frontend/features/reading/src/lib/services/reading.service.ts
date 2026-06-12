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
