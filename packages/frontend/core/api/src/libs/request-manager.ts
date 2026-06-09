import { getAxiosClient } from './axios-client';
import type { AxiosRequestConfig } from 'axios';

const abortControllers = new Map<string, AbortController>();
export const makeRequest = async <T>(
  key: string,
  url: string,
  options?: AxiosRequestConfig
): Promise<T> => {
  // Cancel previous request với cùng key
  const existingController = abortControllers.get(key);
  if (existingController) {
    existingController.abort();
  }

  // Tạo controller mới
  const controller = new AbortController();
  abortControllers.set(key, controller);

  const axios = getAxiosClient();
  
  try {
    const { data } = await axios.get<T>(url, {
      ...options,
      signal: controller.signal,
    });
    abortControllers.delete(key);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'CanceledError') {
      console.log(`Request ${key} was cancelled`);
    }
    throw error;
  }
};
