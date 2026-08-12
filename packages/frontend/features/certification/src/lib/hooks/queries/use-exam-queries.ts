import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_COLLECTIONS, STALE_TIME_STATIC_EXAM, STALE_TIME_SECTION_QUESTIONS } from '../../constants/query-cache-times.constants';
import type { CollectionEditorResponse, ExamBuilderResponse, Exam, SectionQuestionsResponse } from '../../types';

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

export const useExamBuilderData = (id: string) => {
  return useQuery<ExamBuilderResponse | null>({
    queryKey: ['certification', 'exam-builder', id],
    queryFn: () => CertificationApi.getExamBuilderData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
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

export const useSectionQuestions = (
  examId: string,
  sectionId: string,
  page = 1,
  pageSize = 10,
  search?: string
) => {
  return useQuery<SectionQuestionsResponse | null>({
    queryKey: ['certification', 'section-questions', examId, sectionId, page, pageSize, search],
    queryFn: () => CertificationApi.getSectionQuestions(examId, sectionId, page, pageSize, search),
    enabled: Boolean(examId && sectionId),
    staleTime: STALE_TIME_SECTION_QUESTIONS,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};
