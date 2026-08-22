import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { STALE_TIME_COLLECTIONS } from '../../constants/query-cache-times.constants';

// ===== Queries =====

export const useCollectionReviews = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-reviews', collectionId],
    queryFn: () => CertificationApi.getCollectionReviews(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionActivities = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-activities', collectionId],
    queryFn: () => CertificationApi.getCollectionActivities(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

// ===== Mutations =====

export const useAddCollectionReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ collectionId, rating, text }: { collectionId: string; rating: number; text: string }) =>
      CertificationApi.addCollectionReview(collectionId, { rating, text }),
    onMutate: async (variables) => {
      const { collectionId, rating, text } = variables;

      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-reviews', collectionId] });

      const previousReviews = queryClient.getQueryData<Array<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }>>(
        ['certification', 'collection-reviews', collectionId]
      );

      queryClient.setQueryData<Array<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }>>(
        ['certification', 'collection-reviews', collectionId],
        (old) => {
          const optimisticReview = {
            id: `optimistic-${Date.now()}`,
            author: 'You',
            avatar: undefined as string | undefined,
            rating,
            text,
            date: 'Just now',
          };
          return [optimisticReview, ...(old || [])];
        }
      );

      return { previousReviews, collectionId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(
          ['certification', 'collection-reviews', context.collectionId],
          context.previousReviews
        );
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.addReviewError, variant: 'destructive' });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-reviews', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection', variables.collectionId] });
      toast(CERTIFICATION_UI_TEXT.toast.addReviewSuccess);
    },
  });
};
