// services/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthError';
  }
}

export const API_BASE = import.meta.env.VITE_API_URL as string;

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * 1) Attach the JWT on every request
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('jwtToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // For any admin endpoint, disable browser caching:
  if (config.url?.startsWith("/api/admin") && config.headers) {
    // ↓ cast to any so TS doesn’t complain about unknown header keys
    const h = config.headers as any;
    h["Cache-Control"] = "no-store";
    h.Pragma = "no-cache";
  }

  return config;
});


/**
 * Token‐refresh queueing logic
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 401 → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new AuthError('No refresh token available');
        }

        const resp = await api.post<RefreshTokenResponse>('/api/auth/refresh', {
          refreshToken,
        });
        const { token, refreshToken: newRefreshToken } = resp.data;

        localStorage.setItem('jwtToken', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        processQueue();
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        throw new AuthError('Session expired');
      } finally {
        isRefreshing = false;
      }
    }

    // 403 → permission
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action');
    }

    // network
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error: Please check your internet connection');
    }

    return Promise.reject(error);
  }
);

/**
 * Our simplified wrapper that always returns `response.data`
 */
export const apiClient = {
  get: <T>(url: string, config = {}) =>
    api.get<T>(url, config).then((r) => r.data),

  post: <T>(url: string, data?: any, config = {}) =>
    api.post<T>(url, data, config).then((r) => r.data),

  put: <T>(url: string, data?: any, config = {}) =>
    api.put<T>(url, data, config).then((r) => r.data),

  delete: <T>(url: string, config = {}) =>
    api.delete<T>(url, config).then((r) => r.data),
};

export default api;
