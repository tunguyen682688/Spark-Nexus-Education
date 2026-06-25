import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OverviewLearningVocabularySet from '../components/learning/OverviewLearningVocabularySet';
import ListVocabularySetDefinition from '../components/learning/ListVocabularySetDefinition';
import {
  useVocabularySet,
  useSetWords,
  useDeleteVocabularySet,
} from '../hooks/use-vocabulary-sets';
import { calculateLearningStats } from '../services/vocabulary-stats.service';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';
import {
  ChevronLeft,
  MoreVertical,
  FileText,
  BarChart3,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@spark-nest-ed/frontend-shared-components';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';
import ConfirmDeleteSetDialog from '../components/manager/ConfirmDeleteSetDialog';

const OverviewLearningVocabularySetContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const vocabularySetId = id || '';
  const { isAuthenticated, user } = useAuth();
  const deleteSet = useDeleteVocabularySet();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch vocabulary set details
  const { data: vocabularySet, isLoading: isLoadingSet } =
    useVocabularySet(vocabularySetId);

  // Fetch words in the set
  const { data: wordsData, isLoading: isLoadingWords } = useSetWords(
    vocabularySetId,
    { pageSize: 100 } // Get all words for stats
  );

  // Only owner can update this vocabulary set
  const canEdit =
    isAuthenticated &&
    !!vocabularySet &&
    !!user &&
    vocabularySet.userId === user.id;

  // Calculate learning stats using service
  const learningStats = useMemo(() => {
    return calculateLearningStats(vocabularySet, wordsData?.data);
  }, [vocabularySet, wordsData]);

  // Derive mastered / learning / new from word data
  const wordStatusStats = useMemo(() => {
    const words = wordsData?.data ?? [];
    let mastered = 0;
    let learning = 0;
    for (const w of words) {
      const prog = (w as Record<string, any>)?.userProgress as Record<string, unknown> | undefined;
      const status = prog?.status;
      if (status === 'MASTERED') mastered++;
      else if (status === 'LEARNING') learning++;
    }
    return { mastered, learning };
  }, [wordsData]);

  // Calculate dynamic Average Ease Factor of learned words
  const averageEaseFactor = useMemo(() => {
    const words = wordsData?.data ?? [];
    const learnedWords = words.filter((w) => {
      const prog = (w as Record<string, any>)?.userProgress as Record<string, unknown> | undefined;
      return prog && prog.status !== 'NEW' && prog.repetitions && (prog.repetitions as number) > 0;
    });
    if (learnedWords.length === 0) return 2.50;
    const sum = learnedWords.reduce((acc, w) => {
      const prog = (w as Record<string, any>)?.userProgress as Record<string, unknown> | undefined;
      return acc + ((prog?.easeFactor as number) ?? 2.5);
    }, 0);
    return sum / learnedWords.length;
  }, [wordsData]);

  // Calculate dynamic Due Tomorrow count
  const dueTomorrowCount = useMemo(() => {
    const words = wordsData?.data ?? [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set tomorrow to end of day to include all reviews due tomorrow
    tomorrow.setHours(23, 59, 59, 999);
    
    return words.filter((w) => {
      const prog = (w as Record<string, any>)?.userProgress as Record<string, unknown> | undefined;
      if (!prog || prog.status === 'NEW') return false;
      if (!prog.nextReviewAt) return false;
      return new Date(prog.nextReviewAt as string) <= tomorrow;
    }).length;
  }, [wordsData]);

  // Calculate dynamic 7-day study activity history
  const last7DaysHistory = useMemo(() => {
    const words = wordsData?.data ?? [];
    const result = [];
    
    // Generate last 7 days ending today
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const getDayLabel = (dayIndex: number) => {
      if (dayIndex === 0) return 'CN';
      return `T${dayIndex + 1}`;
    };

    // Count reviews for each day
    const counts = days.map((day) => {
      const startOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const endOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
      
      const count = words.filter((w) => {
        const prog = (w as Record<string, any>)?.userProgress as Record<string, unknown> | undefined;
        if (!prog || !prog.lastReview) return false;
        const lastRev = new Date(prog.lastReview as string);
        return lastRev >= startOfDay && lastRev <= endOfDay;
      }).length;
      
      return count;
    });

    const maxCount = Math.max(...counts);

    for (let i = 0; i < 7; i++) {
      const day = days[i];
      const count = counts[i];
      const label = getDayLabel(day.getDay());
      const isToday = i === 6;
      
      // Calculate height percentage
      let height = '5%';
      if (maxCount > 0 && count > 0) {
        height = `${Math.round((count / maxCount) * 85) + 10}%`; // scale between 10% and 95%
      } else if (count > 0) {
        height = '50%';
      }

      let fillClass = 'bg-[#3b82f6]/50 group-hover:bg-[#3b82f6]';
      if (isToday) {
        fillClass = 'bg-blue-600';
      } else if (i % 2 === 0) {
        fillClass = 'bg-blue-600/50 group-hover:bg-blue-600';
      } else if (i % 3 === 0) {
        fillClass = 'bg-green-500/50 group-hover:bg-green-500';
      }

      result.push({
        label,
        height,
        fillClass,
        active: isToday,
        count,
      });
    }

    return result;
  }, [wordsData]);

  const isLoading = isLoadingSet || isLoadingWords;

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!vocabularySetId) return;

    deleteSet.mutate(vocabularySetId, {
      onSuccess: () => {
        toast({
          title: VOCABULARY_UI_TEXT.TOAST_MESSAGES.DELETE_SUCCESS_TITLE,
          description: VOCABULARY_UI_TEXT.TOAST_MESSAGES.DELETE_SUCCESS_DESC,
        });
        navigate(ROUTES.VOCABULARIES.MY_VOCABULARY_SET);
      },
      onError: (error) => {
        toast({
          title: VOCABULARY_UI_TEXT.TOAST_MESSAGES.DELETE_FAILED_TITLE,
          description:
            error instanceof Error
              ? error.message
              : VOCABULARY_UI_TEXT.TOAST_MESSAGES.DELETE_FAILED_DESC,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <>
      <ConfirmDeleteSetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        setTitle={vocabularySet?.title}
        wordCount={vocabularySet?.entryCount}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteSet.isPending}
      />
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                {VOCABULARY_UI_TEXT.BUTTONS.BACK}
              </span>
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {VOCABULARY_UI_TEXT.BUTTONS.BACK_TO_OVERVIEW}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(
                        ':id',
                        vocabularySetId
                      )
                    )
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {VOCABULARY_UI_TEXT.OVERVIEW.VIEW_DETAIL}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      ROUTES.VOCABULARIES.STATUS_SET_VOCABULARY.replace(
                        ':id',
                        vocabularySetId
                      )
                    )
                  }
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {VOCABULARY_UI_TEXT.OVERVIEW.VIEW_STATUS}
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(
                          ROUTES.VOCABULARIES.UPDATE.replace(
                            ':id',
                            vocabularySetId
                          )
                        )
                      }
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {VOCABULARY_UI_TEXT.OVERVIEW.UPDATE_SET}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {VOCABULARY_UI_TEXT.OVERVIEW.DELETE_SET}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Overview Learning – premium dark design */}
        <OverviewLearningVocabularySet
          vocabularySetId={vocabularySetId}
          vocabularySetTitle={vocabularySet?.title}
          vocabularySetDescription={vocabularySet?.description ?? undefined}
          isPublic={vocabularySet?.isPublic ?? true}
          isOwner={canEdit}
          learnedCount={learningStats.learnedCount}
          masteredCount={wordStatusStats.mastered}
          learningCount={wordStatusStats.learning}
          totalCount={learningStats.totalCount}
          masteryLevelData={learningStats.masteryLevelData}
          isLoading={isLoading}
          averageEaseFactor={averageEaseFactor}
          dueTomorrowCount={dueTomorrowCount}
          last7DaysHistory={last7DaysHistory}
          onStartFlashcard={() => navigate(ROUTES.VOCABULARIES.FLASHCARD.replace(':id', vocabularySetId))}
          onStartQuiz={() => navigate(ROUTES.VOCABULARIES.QUIZ.replace(':id', vocabularySetId))}
        />

        {/* Vocabulary list */}
        <ListVocabularySetDefinition vocabularySetId={vocabularySetId} />
      </div>
    </>
  );
};

export default OverviewLearningVocabularySetContainer;
