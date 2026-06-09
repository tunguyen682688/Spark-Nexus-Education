/**
 * Axios Client - Production-Ready HTTP Client
 * 
 * Features:
 * - Auth0 token management
 * - Request queuing (avoid race conditions)
 * - Auto retry with exponential backoff
 * - 401 handling (auto refresh & retry)
 * - Global state (shared across lazy-loaded modules)
 * - React Router integration
 * - Type-safe
 */

import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// ==================== Types ====================

export type TokenProvider = () => Promise<string | null | undefined>;

export interface AxiosClientConfig {
  baseURL?: string;
  timeout?: number;
  tokenProvider?: TokenProvider;
  onUnauthorized?: () => void | Promise<void>;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    retryableStatuses: number[];
  };
}

interface GlobalAxiosState {
  instance: AxiosInstance | null;
  tokenProvider: TokenProvider;
  isRefreshing: boolean;
  refreshQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }>;
}

// ==================== Global State ====================

/**
 * Global state để share giữa các lazy-loaded bundles
 * Tránh vấn đề mỗi bundle có state riêng
 */
declare global {
  interface Window {
    __SPARK_AXIOS_STATE__?: GlobalAxiosState;
  }
}

const getGlobalState = (): GlobalAxiosState => {
  if (!window.__SPARK_AXIOS_STATE__) {
    window.__SPARK_AXIOS_STATE__ = {
      instance: null,
      tokenProvider: async () => null,
      isRefreshing: false,
      refreshQueue: [],
    };
  }
  return window.__SPARK_AXIOS_STATE__;
};

// ==================== Configuration ====================

const DEFAULT_CONFIG = {
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4000/api/v1',
  timeout: 15000,
  tokenProvider: (async () => null) as TokenProvider,
  onUnauthorized: undefined as (() => void | Promise<void>) | undefined,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504] as number[],
  },
};

// ==================== Token Management ====================

/**
 * Lấy token từ Auth0 (qua global token provider)
 * Auth0 SDK tự handle caching & refresh
 */
async function getToken(): Promise<string | null> {
  const state = getGlobalState();

  try {
    // Nếu đang refresh, add vào queue
    if (state.isRefreshing) {
      return new Promise((resolve, reject) => {
        state.refreshQueue.push({ resolve, reject });
      });
    }

    // Fetch token từ Auth0
    state.isRefreshing = true;
    const token = await state.tokenProvider();

    if (!token || token.trim() === '') {
      if (import.meta.env.DEV) {
        console.warn('[Axios] Token provider returned empty/null');
      }
      // Resolve queue với empty string
      state.refreshQueue.forEach((item) => item.resolve(''));
      state.refreshQueue = [];
      state.isRefreshing = false;
      return null;
    }

    // Resolve tất cả queued requests
    state.refreshQueue.forEach((item) => item.resolve(token));
    state.refreshQueue = [];
    state.isRefreshing = false;

    return token;
  } catch (error) {
    // Reject tất cả queued requests
    const err = error instanceof Error ? error : new Error('Token fetch failed');
    state.refreshQueue.forEach((item) => item.reject(err));
    state.refreshQueue = [];
    state.isRefreshing = false;

    console.error('[Axios] Token fetch error:', error);
    return null;
  }
}

// ==================== Request Interceptor ====================

/**
 * Attach Authorization header vào request
 */
async function handleRequest(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
  try {
    // Log request (dev only)
    if (import.meta.env.DEV) {
      console.log(
        `[Axios] → ${config.method?.toUpperCase()} ${config.url}`,
        config.params ? `params: ${JSON.stringify(config.params)}` : ''
      );
    }

    // Get token from Auth0
    const token = await getToken();

    if (!token) {
      // No token available - request will proceed without auth
      return config;
    }

    // Attach token to header
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  } catch (error) {
    console.error('[Axios] Request interceptor error:', error);
    return config;
  }
}

// ==================== Response Interceptors ====================

// Retry counter (weak map để tránh memory leak)
const retryCountMap = new WeakMap<AxiosRequestConfig, number>();

/**
 * Handle 401 Unauthorized - refresh token và retry
 */
async function handle401(
  error: AxiosError,
  axiosInstance: AxiosInstance
): Promise<AxiosResponse> {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  // Không retry nếu đã retry hoặc không có config
  if (!originalRequest || originalRequest._retry) {
    return Promise.reject(error);
  }

  // Tránh redirect loop ở /login, /callback
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath === '/callback') {
    return Promise.reject(error);
  }

  try {
    originalRequest._retry = true;

    // Force refresh token từ Auth0
    const state = getGlobalState();
    state.isRefreshing = false; // Reset để force refresh
    const token = await getToken();

    if (!token) {
      console.error('[Axios] Cannot get token for retry');
      return Promise.reject(error);
    }

    // Update Authorization header
    if (originalRequest.headers instanceof AxiosHeaders) {
      originalRequest.headers.set('Authorization', `Bearer ${token}`);
    } else {
      const headers = AxiosHeaders.from(originalRequest.headers ?? {});
      headers.set('Authorization', `Bearer ${token}`);
      originalRequest.headers = headers;
    }

    // Retry request
    if (import.meta.env.DEV) {
      console.log('[Axios] Retrying after 401:', originalRequest.url);
    }

    return axiosInstance(originalRequest);
  } catch (refreshError) {
    console.error('[Axios] Token refresh failed:', refreshError);
    return Promise.reject(error);
  }
}

/**
 * Handle retryable errors (5xx, timeout, etc)
 */
async function handleRetryableError(
  error: AxiosError,
  axiosInstance: AxiosInstance,
  retryConfig: typeof DEFAULT_CONFIG.retryConfig
): Promise<AxiosResponse> {
  const config = error.config;
  const status = error.response?.status;

  if (!config || !status) {
    return Promise.reject(error);
  }

  // Check if status is retryable
  if (!retryConfig.retryableStatuses.includes(status)) {
    return Promise.reject(error);
  }

  // Get retry count
  const retryCount = retryCountMap.get(config) || 0;

  if (retryCount >= retryConfig.maxRetries) {
    if (import.meta.env.DEV) {
      console.error(`[Axios] Max retries exceeded (${retryConfig.maxRetries})`);
    }
    return Promise.reject(error);
  }

  // Increment retry count
  retryCountMap.set(config, retryCount + 1);

  // Calculate delay with exponential backoff
  const delay = retryConfig.retryDelay * Math.pow(2, retryCount);

  if (import.meta.env.DEV) {
    console.log(
      `[Axios] Retry ${retryCount + 1}/${retryConfig.maxRetries} after ${delay}ms (${status} ${config.url})`
    );
  }

  // Wait and retry
  await new Promise((resolve) => setTimeout(resolve, delay));
  return axiosInstance(config);
}

/**
 * Handle response success
 */
function handleResponse(response: AxiosResponse): AxiosResponse {
  if (import.meta.env.DEV) {
    console.log(
      `[Axios] ← ${response.status} ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`
    );
  }
  return response;
}

/**
 * Handle response error
 */
async function handleResponseError(
  error: AxiosError,
  axiosInstance: AxiosInstance,
  config: typeof DEFAULT_CONFIG
): Promise<AxiosResponse> {
  // Log error (dev only)
  if (import.meta.env.DEV) {
    console.error(
      `[Axios] ✗ ${error.response?.status || 'Network'} ${
        error.config?.method?.toUpperCase() || ''
      } ${error.config?.url || ''}`,
      error.message
    );
  }

  // Handle 401 Unauthorized
  if (error.response?.status === 401) {
    return handle401(error, axiosInstance);
  }

  // Handle retryable errors
  if (error.response?.status) {
    return handleRetryableError(error, axiosInstance, config.retryConfig);
  }

  return Promise.reject(error);
}

// ==================== Axios Instance Factory ====================

/**
 * Tạo axios instance với interceptors
 */
function createAxiosInstance(config: typeof DEFAULT_CONFIG): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    handleRequest,
    (error) => Promise.reject(error)
  );

  // Response interceptors
  instance.interceptors.response.use(
    handleResponse,
    (error: AxiosError) => handleResponseError(error, instance, config)
  );

  return instance;
}

// ==================== Public API ====================

/**
 * Khởi tạo hoặc cập nhật axios client
 * 
 * @example
 * ```typescript
 * // Setup trong main.tsx
 * import { createAxiosClient } from '@spark-nest-ed/frontend-core-api';
 * import { getAuth0Client } from '@spark-nest-ed/frontend-core-auth';
 * 
 * createAxiosClient(async () => {
 *   const auth0 = getAuth0Client();
 *   try {
 *     return await auth0.getTokenSilently({
 *       authorizationParams: {
 *         audience: import.meta.env.VITE_AUTH0_AUDIENCE,
 *       },
 *     });
 *   } catch (error) {
 *     console.error('Failed to get token:', error);
 *     return null;
 *   }
 * });
 * ```
 */
export function createAxiosClient(
  tokenProvider?: TokenProvider,
  config?: Omit<AxiosClientConfig, 'tokenProvider'>
): AxiosInstance {
  const state = getGlobalState();

  // Merge config with defaults
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    tokenProvider: tokenProvider || DEFAULT_CONFIG.tokenProvider,
  };

  // Update global token provider
  if (tokenProvider) {
    state.tokenProvider = tokenProvider;
  }

  // Create or update instance
  if (!state.instance) {
    state.instance = createAxiosInstance(finalConfig);
  }

  return state.instance;
}

/**
 * Lấy axios instance hiện tại
 * Nếu chưa có sẽ tạo mới với default config
 */
export function getAxiosClient(): AxiosInstance {
  const state = getGlobalState();

  if (!state.instance) {
    state.instance = createAxiosInstance(DEFAULT_CONFIG);
  }

  return state.instance;
}

/**
 * Update token provider (useful khi Auth0 context thay đổi)
 */
export function updateTokenProvider(provider: TokenProvider): void {
  const state = getGlobalState();
  state.tokenProvider = provider;
}

/**
 * Reset axios client (useful cho testing)
 */
export function resetAxiosClient(): void {
  const state = getGlobalState();
  state.instance = null;
  state.tokenProvider = async () => null;
  state.isRefreshing = false;
  state.refreshQueue = [];
}

/**
 * Check if axios client is initialized
 */
export function isAxiosClientInitialized(): boolean {
  const state = getGlobalState();
  return state.instance !== null;
}
