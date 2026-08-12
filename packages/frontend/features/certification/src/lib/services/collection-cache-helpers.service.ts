import { useQueryClient } from '@tanstack/react-query';
import type { CollectionEditorResponse, ExamCollection } from '../types';

export function updateCollectionEditorCache(
  queryClient: ReturnType<typeof useQueryClient>,
  collectionId: string,
  updater: (data: CollectionEditorResponse) => CollectionEditorResponse,
) {
  queryClient.setQueryData<CollectionEditorResponse>(
    ['certification', 'collection-editor', collectionId],
    (old) => (old ? updater(old) : old),
  );
}

export function updateCollectionsListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (data: ExamCollection[]) => ExamCollection[],
) {
  queryClient.setQueryData<ExamCollection[]>(
    ['certification', 'collections'],
    (old) => (old ? updater(old) : old),
  );
}
