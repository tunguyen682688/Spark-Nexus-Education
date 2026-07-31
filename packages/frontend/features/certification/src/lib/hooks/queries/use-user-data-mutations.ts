import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: { itemId: string; itemType?: string; title?: string; folderName?: string }) =>
      CertificationApi.addBookmark(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'bookmarks'] });
      toast(CERTIFICATION_UI_TEXT.toast.addBookmarkSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.addBookmarkError, variant: 'destructive' });
    },
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CertificationApi.removeBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'bookmarks'] });
      toast(CERTIFICATION_UI_TEXT.toast.removeBookmarkSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.removeBookmarkError, variant: 'destructive' });
    },
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (collectionId: string) => CertificationApi.addFavorite(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'favorites'] });
      toast(CERTIFICATION_UI_TEXT.toast.addFavoriteSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.addFavoriteError, variant: 'destructive' });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CertificationApi.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'favorites'] });
      toast(CERTIFICATION_UI_TEXT.toast.removeFavoriteSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.removeFavoriteError, variant: 'destructive' });
    },
  });
};

export const useDeleteDownload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CertificationApi.deleteDownload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'downloads'] });
      toast(CERTIFICATION_UI_TEXT.toast.deleteDownloadSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteDownloadError, variant: 'destructive' });
    },
  });
};

export const useClearDownloads = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => CertificationApi.clearDownloads(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'downloads'] });
      toast(CERTIFICATION_UI_TEXT.toast.clearDownloadsSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.clearDownloadsError, variant: 'destructive' });
    },
  });
};

export const useDownloadCertificate = () => {
  const { toast } = useToast();

  return useMutation<{ success: boolean; url: string }, Error, string>({
    mutationFn: (certificateId: string) => CertificationApi.downloadCertificate(certificateId),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.downloadCertificateSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.downloadCertificateError, variant: 'destructive' });
    },
  });
};
