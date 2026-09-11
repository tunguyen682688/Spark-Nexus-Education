import { useState, useCallback } from 'react';
import {
  requestPresignedUpload,
  uploadFileToR2,
  confirmUpload,
  type PresignedUploadResponse,
  type ConfirmUploadResponse,
} from './upload-api';

export interface UseFileUploadOptions {
  visibility?: 'public' | 'private';
  onProgress?: (percent: number) => void;
  onSuccess?: (file: ConfirmUploadResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseFileUploadState {
  status: 'idle' | 'requesting' | 'uploading' | 'confirming' | 'done' | 'error';
  progress: number;
  uploadResult: PresignedUploadResponse | null;
  fileResult: ConfirmUploadResponse | null;
  error: Error | null;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [state, setState] = useState<UseFileUploadState>({
    status: 'idle',
    progress: 0,
    uploadResult: null,
    fileResult: null,
    error: null,
  });

  const upload = useCallback(async (file: File) => {
    try {
      // Step 1: Request presigned URL
      setState(prev => ({ ...prev, status: 'requesting', progress: 0, error: null }));

      const presigned = await requestPresignedUpload({
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
        visibility: options.visibility ?? 'public',
      });

      // Step 2: Upload file directly to R2
      setState(prev => ({ ...prev, status: 'uploading', uploadResult: presigned }));

      await uploadFileToR2(presigned.uploadUrl, file, file.type, (percent) => {
        setState(prev => ({ ...prev, progress: percent }));
        options.onProgress?.(percent);
      });

      // Step 3: Confirm upload
      setState(prev => ({ ...prev, status: 'confirming', progress: 100 }));

      const confirmed = await confirmUpload(presigned.mediaFileId);

      setState(prev => ({
        ...prev,
        status: 'done',
        fileResult: confirmed,
      }));

      options.onSuccess?.(confirmed);
      return confirmed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({ ...prev, status: 'error', error }));
      options.onError?.(error);
      throw error;
    }
  }, [options.visibility, options.onProgress, options.onSuccess, options.onError]);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      uploadResult: null,
      fileResult: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    upload,
    reset,
    isUploading: state.status === 'uploading' || state.status === 'requesting' || state.status === 'confirming',
  };
}
