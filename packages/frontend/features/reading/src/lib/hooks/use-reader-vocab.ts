import { useState, useCallback, useEffect } from 'react';
import { useUserVocabularyPackages, useAddWordToPackage } from './use-reading';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { READING_UI_TEXT } from '../constants/reading-ui-text';
import {
  getCharOffsetOfNode,
  getSurroundingSentence,
  getWordAndSentenceAtEvent,
} from './reader-helpers';

interface UseReaderVocabOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isQuickSaveEnabled: boolean;
  activeText: string;
  selectedChapterIndex: number;
}

export function useReaderVocab({
  containerRef,
  isQuickSaveEnabled,
  activeText,
  selectedChapterIndex,
}: UseReaderVocabOptions) {
  const { data: packagesData } = useUserVocabularyPackages();
  const addWordMutation = useAddWordToPackage();
  const { toast } = useToast();

  const [highlightedWord, setHighlightedWord] = useState('');
  const [sentenceContext, setSentenceContext] = useState('');
  const [popoverCoords, setPopoverCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialDefinition, setInitialDefinition] = useState('');
  const [initialPronunciation, setInitialPronunciation] = useState('');
  const [initialPartOfSpeech, setInitialPartOfSpeech] = useState('');
  const [initialExample, setInitialExample] = useState('');
  const [initialExampleTrans, setInitialExampleTrans] = useState('');

  const handleQuickSave = useCallback(async (wordToSave: string, sentenceToSave: string) => {
    if (!packagesData?.data || packagesData.data.length === 0) {
      toast({
        title: READING_UI_TEXT.toast.SAVE_QUICK_ERR_TITLE,
        description: READING_UI_TEXT.toast.SAVE_QUICK_ERR_DESC,
        variant: 'destructive',
      });
      return;
    }

    const defaultPackage = packagesData.data[0];
    const defaultPackageId = defaultPackage.id;
    const defaultPackageTitle = defaultPackage.title;

    const payload = {
      word: {
        word: wordToSave.trim(),
        definition: READING_UI_TEXT.toast.SAVE_QUICK_DEF.replace('{word}', wordToSave),
        example: sentenceToSave.trim() || null,
        partOfSpeech: 'noun',
        notes: READING_UI_TEXT.toast.SAVE_QUICK_NOTES,
      },
    };

    try {
      await addWordMutation.mutateAsync({
        packageId: defaultPackageId,
        payload,
      });
      toast({
        title: READING_UI_TEXT.toast.SAVE_QUICK_SUCCESS_TITLE,
        description: READING_UI_TEXT.toast.SAVE_QUICK_SUCCESS_DESC.replace('{word}', wordToSave).replace('{package}', defaultPackageTitle),
      });
    } catch (err) {
      console.error('Failed to quick save word', err);
      toast({
        title: READING_UI_TEXT.toast.ERROR_TITLE,
        description: READING_UI_TEXT.toast.SAVE_ERROR_DESC,
        variant: 'destructive',
      });
    }
  }, [packagesData, addWordMutation, toast]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        const result = getWordAndSentenceAtEvent(e);
        if (result) {
          handleQuickSave(result.word, result.sentence);
        }
        return;
      }

      const target = e.target as HTMLElement;
      const highlightEl = target.closest('.vocab-highlight') as HTMLElement | null;
      if (highlightEl) {
        e.preventDefault();
        e.stopPropagation();

        const word = highlightEl.textContent?.trim() || '';
        const definition = highlightEl.getAttribute('data-def') || '';
        const pronunciation = highlightEl.getAttribute('data-pron') || '';
        const level = highlightEl.getAttribute('data-level') || '';
        const ex = highlightEl.getAttribute('data-ex') || '';
        const exTrans = highlightEl.getAttribute('data-ex-trans') || '';

        const rect = highlightEl.getBoundingClientRect();
        
        const parentBlock = highlightEl.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div.flex-1');
        let sentence = '';
        if (parentBlock) {
          const blockText = parentBlock.textContent || '';
          const charOffset = getCharOffsetOfNode(parentBlock, highlightEl);
          sentence = getSurroundingSentence(blockText, charOffset);
        }

        setHighlightedWord(word);
        setInitialDefinition(definition);
        setInitialPronunciation(pronunciation);
        setInitialPartOfSpeech(level);
        setInitialExample(ex);
        setInitialExampleTrans(exTrans);
        setSentenceContext(sentence);
        setPopoverCoords({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY,
        });
      }
    };

    const handleContainerDblClick = (e: MouseEvent) => {
      if (!isQuickSaveEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      const selection = window.getSelection();
      if (!selection) return;
      
      const text = selection.toString().trim();
      if (text && text.length > 1 && text.split(/\s+/).length === 1 && /^[a-zA-Z-]+$/.test(text)) {
        const range = selection.getRangeAt(0);
        const textContent = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const sentence = getSurroundingSentence(textContent, offset);
        
        handleQuickSave(text, sentence);
      }
    };

    container.addEventListener('click', handleContainerClick);
    container.addEventListener('dblclick', handleContainerDblClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
      container.removeEventListener('dblclick', handleContainerDblClick);
    };
  }, [activeText, selectedChapterIndex, handleQuickSave, isQuickSaveEnabled, containerRef]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text && text.length > 1 && text.split(/\s+/).length === 1 && /^[a-zA-Z-]+$/.test(text)) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const textContent = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const sentence = getSurroundingSentence(textContent, offset);

        setHighlightedWord(text);
        setInitialDefinition('');
        setInitialPronunciation('');
        setInitialPartOfSpeech('');
        setInitialExample('');
        setInitialExampleTrans('');
        setSentenceContext(sentence);
        setPopoverCoords({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY,
        });
      } catch (err) {
        console.error('Error getting range rect', err);
      }
    }
  }, []);

  return {
    highlightedWord,
    setHighlightedWord,
    sentenceContext,
    popoverCoords,
    initialDefinition,
    initialPronunciation,
    initialPartOfSpeech,
    initialExample,
    initialExampleTrans,
    handleTextSelection,
  };
}
