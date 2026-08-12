import { useState, useCallback, useEffect } from 'react';
import { TextToSpeechPlayer } from '../services/reading.service';

interface UseReaderTtsOptions {
  activeText: string;
  article: { id: string } | undefined;
}

export function useReaderTts({ activeText, article }: UseReaderTtsOptions) {
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [spokenWord, setSpokenWord] = useState('');

  useEffect(() => {
    return () => {
      TextToSpeechPlayer.stop();
    };
  }, []);

  const handleTogglePlayTts = useCallback(() => {
    if (!article || !activeText) return;

    if (isPlayingTts) {
      TextToSpeechPlayer.pause();
      setIsPlayingTts(false);
    } else {
      setIsPlayingTts(true);
      TextToSpeechPlayer.play(
        activeText,
        ttsRate,
        (charIndex, charLength) => {
          const activeWord = activeText.substring(charIndex, charIndex + charLength);
          setSpokenWord(activeWord);
        },
        () => {
          setIsPlayingTts(false);
          setSpokenWord('');
        }
      );
    }
  }, [article, activeText, isPlayingTts, ttsRate]);

  const handleStopTts = useCallback(() => {
    TextToSpeechPlayer.stop();
    setIsPlayingTts(false);
    setSpokenWord('');
  }, []);

  const handleChangeTtsRate = useCallback((rate: number) => {
    setTtsRate(rate);
    if (isPlayingTts && activeText) {
      TextToSpeechPlayer.play(
        activeText,
        rate,
        (charIndex, charLength) => {
          const activeWord = activeText.substring(charIndex, charIndex + charLength);
          setSpokenWord(activeWord);
        },
        () => {
          setIsPlayingTts(false);
          setSpokenWord('');
        }
      );
    }
  }, [isPlayingTts, activeText]);

  return {
    isPlayingTts,
    setIsPlayingTts,
    ttsRate,
    setTtsRate,
    spokenWord,
    handleTogglePlayTts,
    handleStopTts,
    handleChangeTtsRate,
  };
}
