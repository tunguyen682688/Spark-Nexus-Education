import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMyCreatedSets, useAddWordToSet } from '@spark-nest-ed/feature-vocabulary';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { WORD_LOOKUP_TEXT } from '../constants';

interface UseWordLookupProps {
  word: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function useWordLookup({ word, x, y, onClose }: UseWordLookupProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Clean word string: lowercase and remove punctuation
  const cleanWord = useMemo(() => {
    return word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim().toLowerCase();
  }, [word]);

  // Fetch word definition using standard query
  const { data: wordData, isLoading, error } = useQuery({
    queryKey: ['vocabulary', 'entry-lookup', cleanWord],
    queryFn: async () => {
      const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
      const axios = await getAxiosClient();
      const response = await axios.get(`/vocabulary/entries/${cleanWord}`);
      
      // JSON:API resource mapper
      const raw = response.data;
      if (raw && raw.data) {
        return {
          id: raw.data.id,
          word: raw.data.attributes?.word || cleanWord,
          definition: raw.data.attributes?.definition || WORD_LOOKUP_TEXT.DEFAULT_DEFINITION,
          pronunciation: raw.data.attributes?.pronunciation || '',
          partOfSpeech: raw.data.attributes?.partOfSpeech || 'noun',
          example: raw.data.attributes?.example || '',
          exampleTranslation: raw.data.attributes?.exampleTranslation || '',
        };
      }
      throw new Error(WORD_LOOKUP_TEXT.ERROR_NOT_FOUND);
    },
    enabled: !!cleanWord,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch user vocabulary sets
  const { data: setsData } = useMyCreatedSets({ limit: 100 });
  const addWordMutation = useAddWordToSet();

  const userSets = useMemo(() => setsData?.data || [], [setsData?.data]);

  // Auto select the first set if available
  useEffect(() => {
    if (userSets.length > 0 && !selectedSetId) {
      setSelectedSetId(userSets[0].id);
    }
  }, [userSets, selectedSetId]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Text-To-Speech pronunciation audio
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddWord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSetId || !cleanWord || !wordData) return;

    try {
      await addWordMutation.mutateAsync({
        setId: selectedSetId,
        payload: {
          word: {
            word: wordData.word,
            definition: wordData.definition,
            example: wordData.example,
            partOfSpeech: wordData.partOfSpeech,
          },
        },
      });

      setIsSaved(true);
      const selectedSet = userSets.find((s) => s.id === selectedSetId);
      toast({
        title: WORD_LOOKUP_TEXT.SAVE_SUCCESS_TITLE,
        description: WORD_LOOKUP_TEXT.SAVE_SUCCESS_DESC(wordData.word, selectedSet?.title || ''),
      });
    } catch (err) {
      console.error('Failed to add word to set:', err);
      toast({
        title: WORD_LOOKUP_TEXT.SAVE_ERROR_TITLE,
        description: WORD_LOOKUP_TEXT.SAVE_ERROR_DESC,
        variant: 'destructive',
      });
    }
  };

  // Compute position (keep in bounds)
  const panelWidth = 320;
  const panelHeight = 240;
  const posX = Math.max(10, Math.min(window.innerWidth - panelWidth - 20, x - panelWidth / 2));
  const posY = Math.max(10, Math.min(window.innerHeight - panelHeight - 20, y + 10));

  return {
    popoverRef,
    cleanWord,
    wordData,
    isLoading,
    error,
    userSets,
    selectedSetId,
    setSelectedSetId,
    isSaved,
    addWordMutation,
    handlePlayAudio,
    handleAddWord,
    posX,
    posY,
  };
}
