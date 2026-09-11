import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
});

export interface PresignedUploadResponse {
  mediaFileId: string;
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
  cdnUrl: string;
}

export interface ConfirmUploadResponse {
  id: string;
  storageKey: string;
  bucket: string;
  provider: string;
  mimeType: string;
  size: number;
  originalName: string;
  width: number | null;
  height: number | null;
  visibility: string;
  status: string;
  checksum: string;
  ownerId: string | null;
  cdnUrl: string;
  createdAt: string;
  updatedAt: string;
}

export async function requestPresignedUpload(params: {
  fileName: string;
  contentType: string;
  contentLength: number;
  visibility?: 'public' | 'private';
}): Promise<PresignedUploadResponse> {
  const { data } = await apiClient.post<PresignedUploadResponse>('/upload/presigned', params);
  return data;
}

export async function uploadFileToR2(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

export async function confirmUpload(mediaFileId: string): Promise<ConfirmUploadResponse> {
  const { data } = await apiClient.post<ConfirmUploadResponse>(`/upload/confirm/${mediaFileId}`);
  return data;
}

export async function getFileUrl(mediaFileId: string): Promise<{ url: string; visibility: string }> {
  const { data } = await apiClient.get<{ url: string; visibility: string }>(`/upload/${mediaFileId}/url`);
  return data;
}
