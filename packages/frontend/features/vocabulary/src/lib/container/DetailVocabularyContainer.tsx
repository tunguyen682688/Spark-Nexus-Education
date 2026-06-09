import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast, Skeleton } from '@spark-nest-ed/frontend-shared-components';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { useEntryDetail } from '../hooks/use-vocabulary-sets';
import { DETAIL_VOCABULARY_TEXT } from '../constants';
import {
  DetailVocabularyHeader,
  DetailVocabularyDefinitionCard,
  DetailVocabularyTabs,
  DetailVocabularySynonymsAntonymsCard,
  DetailVocabularyDifficultyCard,
  DetailVocabularyExternalResourcesCard,
} from '../components/detail';

export default function DetailVocabularyContainer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, wordId } = useParams<{ id: string; wordId: string }>();
  const [isSaved, setIsSaved] = useState(false);

  const { data: word, isLoading, error } = useEntryDetail(wordId);

  const handleSaveWord = () => {
    setIsSaved(!isSaved);
    // TODO: Call API to save/unsave the word
  };

  const handlePracticeClick = () => {
    if (id) {
      navigate(
        ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(':id', id)
      );
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePronunciationClick = () => {
    if (word?.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast({
          title: 'Error',
          description: 'Failed to play pronunciation audio.',
          variant: 'destructive',
        });
      });
    }
  };

  const handleSaveNotes = (notes: string) => {
    // TODO: Call API to save notes
    toast({
      title: 'Success',
      description: 'Notes saved successfully.',
    });
  };

  useEffect(() => {
    if (error) {
      console.error('Error fetching word data:', error);
      toast({
        title: DETAIL_VOCABULARY_TEXT.ERROR.TITLE,
        description: DETAIL_VOCABULARY_TEXT.ERROR.DESCRIPTION,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="w-full max-w-none mx-0 px-2 py-8 sm:px-4 lg:px-6">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="w-full max-w-none mx-0 px-2 py-8 sm:px-4 lg:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Word not found</h1>
          <p className="text-muted-foreground mb-4">
            The word you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBackClick}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" py-8 max-w-full">
      <DetailVocabularyHeader
        word={word}
        isSaved={isSaved}
        onSaveClick={handleSaveWord}
        onPracticeClick={handlePracticeClick}
        onBackClick={handleBackClick}
        onPronunciationClick={handlePronunciationClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailVocabularyDefinitionCard word={word} />
          <DetailVocabularyTabs word={word} onSaveNotes={handleSaveNotes} />
        </div>

        <div className="space-y-6">
          <DetailVocabularySynonymsAntonymsCard word={word} />
          <DetailVocabularyDifficultyCard word={word} />
          <DetailVocabularyExternalResourcesCard word={word} />
        </div>
      </div>
    </div>
  );
}
