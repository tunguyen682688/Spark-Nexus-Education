import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_COLLECTIONS, STALE_TIME_STATIC_EXAM } from '../../constants/query-cache-times.constants';
import type { CollectionEditorResponse, Exam } from '../../types';

export const useCollectionEditorData = (id: string) => {
  return useQuery<CollectionEditorResponse | null>({
    queryKey: ['certification', 'collection-editor', id],
    queryFn: () => CertificationApi.getCollectionEditorData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
};

export const useExamDetail = (id: string) => {
  return useQuery<Exam | null>({
    queryKey: ['certification', 'exam', id],
    queryFn: () => CertificationApi.getExam(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};
