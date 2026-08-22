import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CollectionEditorResponse, ExamCollection } from '../../types';
import { updateCollectionEditorCache, updateCollectionsListCache } from '../../services/collection-cache-helpers.service';

// ─── Save Collection (bookmark/unbookmark) ─────────────────────────────────────

export const useSaveCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { saved: boolean },
    Error,
    string,
    { previousSaved: ExamCollection[] | undefined }
  >({
    mutationFn: (id: string) => CertificationApi.saveCollection(id),
    onMutate: async (collectionId) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'saved-collections'] });

      const previousSaved = queryClient.getQueryData<ExamCollection[]>(
        ['certification', 'saved-collections'],
      );

      // Optimistically toggle saved status
      queryClient.setQueryData<ExamCollection[]>(
        ['certification', 'saved-collections'],
        (old) => {
          if (!old) return old;
          const exists = old.some((c) => c.id === collectionId);
          if (exists) {
            return old.filter((c) => c.id !== collectionId);
          }
          return old;
        },
      );

      return { previousSaved };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'saved-collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.saveCollectionSuccess);
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(['certification', 'saved-collections'], context.previousSaved);
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveCollectionError, variant: 'destructive' });
    },
  });
};

// ─── Clone Collection ──────────────────────────────────────────────────────────

export const useCloneCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { cloned: boolean; newCollectionId: string },
    Error,
    string,
    { previousCollections: ExamCollection[] | undefined }
  >({
    mutationFn: (id: string) => CertificationApi.cloneCollection(id),
    onMutate: async (collectionId) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collections'] });

      const previousCollections = queryClient.getQueryData<ExamCollection[]>(
        ['certification', 'collections'],
      );

      // Optimistically add a placeholder clone at the top
      const original = previousCollections?.find((c) => c.id === collectionId);
      if (original && previousCollections) {
        const optimisticClone: ExamCollection = {
          ...original,
          id: `optimistic-clone-${Date.now()}`,
          title: `${original.title} (Copy)`,
        };
        queryClient.setQueryData<ExamCollection[]>(
          ['certification', 'collections'],
          [optimisticClone, ...previousCollections],
        );
      }

      return { previousCollections };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.cloneCollectionSuccess);
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCollections) {
        queryClient.setQueryData(['certification', 'collections'], context.previousCollections);
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.cloneCollectionError, variant: 'destructive' });
    },
  });
};

// ─── Report Collection ─────────────────────────────────────────────────────────

export const useReportCollection = () => {
  const { toast } = useToast();

  return useMutation<{ reported: boolean }, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => CertificationApi.reportCollection(id, reason),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.reportCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.reportCollectionError, variant: 'destructive' });
    },
  });
};

// ─── Create Collection ─────────────────────────────────────────────────────────

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { id: string; title: string; description: string | null },
    Error,
    { title: string; description?: string | null; silent?: boolean },
    { previousCollections: ExamCollection[] | undefined }
  >({
    mutationFn: (dto) => CertificationApi.createCollection({ title: dto.title, description: dto.description ?? null }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collections'] });

      const previousCollections = queryClient.getQueryData<ExamCollection[]>(
        ['certification', 'collections'],
      );

      // Optimistically add new collection at top
      const optimisticCollection: ExamCollection = {
        id: `optimistic-${Date.now()}`,
        title: variables.title,
        exam: '',
        description: variables.description ?? undefined,
        examCount: 0,
        level: 'Beginner',
        publishStatus: 'draft',
      };
      queryClient.setQueryData<ExamCollection[]>(
        ['certification', 'collections'],
        (old) => (old ? [optimisticCollection, ...old] : [optimisticCollection]),
      );

      return { previousCollections };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.createCollectionSuccess);
    },
    onError: (_err, variables, context) => {
      if (context?.previousCollections) {
        queryClient.setQueryData(['certification', 'collections'], context.previousCollections);
      }
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.createCollectionError, variant: 'destructive' });
    },
  });
};

// ─── Update Collection ─────────────────────────────────────────────────────────
// Optimistic: update both collection-editor cache (details) and collections list cache.

export const useUpdateCollection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type UpdateVariables = {
    collectionId: string;
    title?: string;
    description?: string | null;
    subtitle?: string | null;
    level?: string | null;
    tags?: string[];
    visibility?: string;
    allowDownloads?: boolean;
    coverImage?: string | null;
    publishStatus?: string;
    silent?: boolean;
  };

  return useMutation<
    { id: string },
    Error,
    UpdateVariables,
    {
      previousEditor: CollectionEditorResponse | undefined;
      previousList: ExamCollection[] | undefined;
    }
  >({
    mutationFn: ({ collectionId, silent: _silent, ...dto }) => CertificationApi.updateCollection(collectionId, dto),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      await queryClient.cancelQueries({ queryKey: ['certification', 'collections'] });

      const previousEditor = queryClient.getQueryData<CollectionEditorResponse>(
        ['certification', 'collection-editor', variables.collectionId],
      );
      const previousList = queryClient.getQueryData<ExamCollection[]>(
        ['certification', 'collections'],
      );

      // Optimistically update collection-editor cache (details)
      if (previousEditor) {
        updateCollectionEditorCache(queryClient, variables.collectionId, (old) => ({
          ...old,
          details: {
            ...old.details,
            title: variables.title ?? old.details.title,
            description: variables.description !== undefined ? (variables.description ?? '') : old.details.description,
            subtitle: variables.subtitle !== undefined ? (variables.subtitle ?? '') : old.details.subtitle,
            level: variables.level !== undefined ? (variables.level ?? '') : old.details.level,
            tags: variables.tags ?? old.details.tags,
            visibility: variables.visibility ?? old.details.visibility,
            coverImage: variables.coverImage !== undefined ? (variables.coverImage ?? '') : old.details.coverImage,
          },
        }));
      }

      // Optimistically update collections list cache
      if (previousList) {
        updateCollectionsListCache(queryClient, (old) =>
          old.map((c) =>
            c.id === variables.collectionId
              ? {
                  ...c,
                  title: variables.title ?? c.title,
                  description: variables.description !== undefined ? (variables.description ?? undefined) : c.description,
                  publishStatus: variables.publishStatus ?? c.publishStatus,
                }
              : c,
          ),
        );
      }

      return { previousEditor, previousList };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.updateCollectionSuccess);
    },
    onError: (_err, variables, context) => {
      if (context?.previousEditor) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousEditor,
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(['certification', 'collections'], context.previousList);
      }
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.updateCollectionError, variant: 'destructive' });
    },
  });
};
