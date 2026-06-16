import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton, Card, CardHeader, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@spark-nest-ed/frontend-shared-components';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';
import {
  useVocabularySet,
  useSetWords,
  useDeleteWordFromSet,
  useDeleteVocabularySet,
} from '../hooks/use-vocabulary-sets';
import { WordStatus } from '../types';
import VocabularySetHeader from '../components/manager/VocabularySetHeader';
import VocabularySetOverview from '../components/manager/VocabularySetOverview';
import VocabularySetProgressCard from '../components/manager/VocabularySetProgressCard';
import VocabularySetStudyOptions from '../components/manager/VocabularySetStudyOptions';
import VocabularySetWordsList, { type WordItem } from '../components/manager/VocabularySetWordsList';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';

const getStatusFilterValue = (filter: string): WordStatus | null => {
  switch (filter) {
    case 'Learning':
      return WordStatus.LEARNING;
    case 'Mastered':
      return WordStatus.MASTERED;
    case 'Not Started':
      return WordStatus.NEW;
    default:
      return null;
  }
};

export default function DetailVocabularySetContainer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: vocabularySet,
    isLoading: isVocabularySetLoading,
    error: errorVocabularySet,
  } = useVocabularySet(id as string);

  const {
    data: wordsData,
    isLoading: isWordsLoading,
    error: errorWords,
  } = useSetWords(id as string);

  const deleteWord = useDeleteWordFromSet();
  const deleteSet = useDeleteVocabularySet();

  // Check if current user is the owner of this vocabulary set
  // Only the owner can edit or delete the set
  const canEdit =
    isAuthenticated &&
    !!vocabularySet &&
    !!user &&
    vocabularySet.userId === user.id;

  const handleDeleteWord = (wordId: string) => {
    if (!id) return;
    
    deleteWord.mutate(
      { setId: id, wordId },
      {
        onSuccess: () => {
          toast({
            title: VOCABULARY_UI_TEXT.DETAIL.WORD_DELETED_TITLE,
            description: VOCABULARY_UI_TEXT.DETAIL.WORD_DELETED_DESC,
          });
        },
        onError: (error) => {
          toast({
            title: VOCABULARY_UI_TEXT.DETAIL.WORD_DELETE_ERROR_TITLE,
            description: error instanceof Error ? error.message : VOCABULARY_UI_TEXT.DETAIL.WORD_DELETE_ERROR_DESC,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleEditSet = () => {
    if (!id) return;
    navigate(ROUTES.VOCABULARIES.UPDATE.replace(':id', id));
  };

  const handleDeleteSet = () => {
    if (!id) return;
    
    deleteSet.mutate(id, {
      onSuccess: () => {
        toast({
          title: VOCABULARY_UI_TEXT.DETAIL.SET_DELETED_TITLE,
          description: VOCABULARY_UI_TEXT.DETAIL.SET_DELETED_DESC,
        });
        navigate(ROUTES.VOCABULARIES.MY_VOCABULARY_SET);
      },
      onError: (error) => {
        toast({
          title: VOCABULARY_UI_TEXT.DETAIL.SET_DELETE_ERROR_TITLE,
          description: error instanceof Error ? error.message : VOCABULARY_UI_TEXT.DETAIL.SET_DELETE_ERROR_DESC,
          variant: 'destructive',
        });
      },
    });
  };

  // Normalize backend payload (wordMinimum/wordDetails + custom fields)
  const wordItems = useMemo(() => wordsData?.data ?? [], [wordsData]);

  const normalizedWordItems: WordItem[] = useMemo(
    () =>
      wordItems.map((item) => {
        const base = item.wordDetails ?? item.wordMinimum;
        const displayWord = {
          id: base?.id ?? item.entryId,
          word: item.customWord ?? base?.word ?? '',
          definition: item.customDefinition ?? base?.definition ?? '',
          example: item.customExample ?? base?.example ?? undefined,
          pronunciation: base?.pronunciation ?? null,
          // Map real progress fields returned by backend
          status: (item as Record<string, any>)?.userProgress?.status === 'MASTERED'
            ? WordStatus.MASTERED
            : (item as Record<string, any>)?.userProgress?.status === 'LEARNING'
            ? WordStatus.LEARNING
            : WordStatus.NEW,
          masteryLevel: (item as Record<string, any>)?.userProgress?.masteryLevel ?? 0,
        };

        return {
          id: item.id,
          displayWord,
          customDefinition: item.customDefinition ?? null,
          customExample: item.customExample ?? null,
        };
      }),
    [wordItems]
  );


  // Calculate progress statistics
  const progressStats = useMemo(() => {
    if (!normalizedWordItems.length) {
      return {
        masteredCount: 0,
        learningCount: 0,
        notStartedCount: 0,
        progress: 0,
      };
    }

    const masteredCount = normalizedWordItems.filter(
      (item) => item.displayWord.status === WordStatus.MASTERED
    ).length;
    const learningCount = normalizedWordItems.filter(
      (item) =>
        item.displayWord.status === WordStatus.LEARNING ||
        item.displayWord.status === WordStatus.REVIEWING
    ).length;
    const notStartedCount = normalizedWordItems.filter(
      (item) => item.displayWord.status === WordStatus.NEW
    ).length;
    const progress = Math.round(
      (masteredCount / normalizedWordItems.length) * 100
    );

    return {
      masteredCount,
      learningCount,
      notStartedCount,
      progress,
    };
  }, [normalizedWordItems]);

  // Filter words based on search, status, and difficulty
  const filteredItems = useMemo(() => {
    return normalizedWordItems.filter((item) => {
      const word = item.displayWord;
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesSearch =
        (word.word ?? '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        (word.definition ?? '')
          .toLowerCase()
          .includes(normalizedSearch);
      
      const statusFilterValue = getStatusFilterValue(statusFilter);
      const matchesStatus =
        statusFilter === 'All' || word.status === statusFilterValue;

      // Note: Difficulty is not in the Word type, so we'll skip this filter for now
      const matchesDifficulty = difficultyFilter === 'All';

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [normalizedWordItems, searchTerm, statusFilter, difficultyFilter]);

  // Function to handle tab switching
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    if (errorVocabularySet || errorWords) {
      toast({
        title: VOCABULARY_UI_TEXT.DETAIL.SET_LOAD_ERROR_TITLE,
        description: VOCABULARY_UI_TEXT.DETAIL.SET_LOAD_ERROR_DESC,
        variant: 'destructive',
      });
    }
  }, [errorVocabularySet, errorWords, toast]);

  const handleShare = () => {
    // TODO: Implement share functionality
    toast({
      title: VOCABULARY_UI_TEXT.DETAIL.SHARE_TITLE,
      description: VOCABULARY_UI_TEXT.DETAIL.SHARE_DESC,
    });
  };

  const handlePractice = () => {
    navigate(
      ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(
        ':id',
        id || ''
      )
    );
  };

  if (isVocabularySetLoading) {
    return (
      <div className="py-8 max-w-full">
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex flex-wrap gap-3 items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2 self-start">
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none mx-0 px-2 py-6 sm:px-4 lg:px-6">
      <VocabularySetHeader
        vocabularySet={vocabularySet}
        onShare={handleShare}
        onPractice={handlePractice}
        onEdit={handleEditSet}
        onDelete={handleDeleteSet}
        isDeleting={deleteSet.isPending}
        canEdit={canEdit}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">{VOCABULARY_UI_TEXT.DETAIL.TAB_OVERVIEW}</TabsTrigger>
          <TabsTrigger value="words">{VOCABULARY_UI_TEXT.DETAIL.TAB_WORDS}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VocabularySetOverview
              vocabularySet={vocabularySet}
              filteredItems={filteredItems}
              isLoading={isWordsLoading}
              onViewAllWords={() => handleTabClick('words')}
            />

            <div className="space-y-6">
              <VocabularySetProgressCard
                progress={progressStats.progress}
                masteredCount={progressStats.masteredCount}
                learningCount={progressStats.learningCount}
                notStartedCount={progressStats.notStartedCount}
              />

              <VocabularySetStudyOptions
                onPracticeAll={handlePractice}
                onPracticeDifficult={handlePractice}
                onSpacedRepetition={handlePractice}
                onCreateFlashcards={handlePractice}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="words" className="space-y-6">
          <VocabularySetWordsList
            totalWords={normalizedWordItems.length}
            filteredItems={filteredItems}
            isLoading={isWordsLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            difficultyFilter={difficultyFilter}
            onDifficultyFilterChange={setDifficultyFilter}
            vocabularySetId={id || ''}
            paginationMeta={wordsData?.meta}
            onDeleteWord={handleDeleteWord}
            isDeletingWord={deleteWord.isPending}
            canEdit={canEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
