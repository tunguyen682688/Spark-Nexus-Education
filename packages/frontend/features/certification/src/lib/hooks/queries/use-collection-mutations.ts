import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const useSaveCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ saved: boolean }, Error, string>({
    mutationFn: (id: string) => CertificationApi.saveCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'saved-collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.saveCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveCollectionError, variant: 'destructive' });
    },
  });
};

export const useCloneCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ cloned: boolean; newCollectionId: string }, Error, string>({
    mutationFn: (id: string) => CertificationApi.cloneCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.cloneCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.cloneCollectionError, variant: 'destructive' });
    },
  });
};

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

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ id: string; title: string; description: string | null }, Error, { title: string; description?: string | null; silent?: boolean }>({
    mutationFn: (dto) => CertificationApi.createCollection({ title: dto.title, description: dto.description ?? null }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.createCollectionSuccess);
    },
    onError: (_err, variables) => {
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.createCollectionError, variant: 'destructive' });
    },
  });
};

export const useUpdateCollection = () => {
  const { toast } = useToast();

  return useMutation<{ id: string }, Error, {
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
    silent?: boolean
  }>({
    mutationFn: ({ collectionId, silent: _silent, ...dto }) => CertificationApi.updateCollection(collectionId, dto),
    onSuccess: (_data, variables) => {
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.updateCollectionSuccess);
    },
    onError: (_err, variables) => {
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.updateCollectionError, variant: 'destructive' });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (collectionId) => CertificationApi.deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.deleteCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteCollectionError, variant: 'destructive' });
    },
  });
};
