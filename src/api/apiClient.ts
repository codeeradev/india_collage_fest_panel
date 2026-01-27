import type {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import axios from 'axios';

import { API_BASE_URL } from './endpoint';

// ----------------------------------------------------------------------
// Extend Axios config to support authRequired flag
// ----------------------------------------------------------------------

interface AuthAxiosRequestConfig extends AxiosRequestConfig {
  authRequired?: boolean;
}

// ----------------------------------------------------------------------
// Create axios instance
// ----------------------------------------------------------------------

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
});

// ----------------------------------------------------------------------
// Token helpers
// ----------------------------------------------------------------------

const getToken = (): string | null => localStorage.getItem('accessToken');

// ----------------------------------------------------------------------
// Helper to attach auth header
// ----------------------------------------------------------------------

const withAuth = (
  config: AuthAxiosRequestConfig = {}
): AuthAxiosRequestConfig => {
  const token = getToken();

  if (!token) return config;

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

// ----------------------------------------------------------------------
// Request interceptor
// ----------------------------------------------------------------------

apiClient.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig & { authRequired?: boolean }
  ) => {
    if (config.authRequired) {
      const token = getToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // remove custom flag so it doesn't go to backend
      delete config.authRequired;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------
// Response interceptor
// ----------------------------------------------------------------------

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    const message: string | undefined = error.response?.data?.message;

    if (message === 'Permission denied') {
      // showAlert('error', 'You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    if (message === 'Token missing' || message === 'Invalid Token') {
      localStorage.removeItem('token');
      // showAlert('error', 'Session expired. Please login again.');
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const msg =
        error.response?.data?.message?.toLowerCase?.() || '';

      if (
        msg.includes('unauthorized') ||
        msg.includes('invalid token') ||
        msg.includes('token expired')
      ) {
        localStorage.removeItem('token');
      }
    }

    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------
// Helper HTTP methods
// ----------------------------------------------------------------------

export const get = (
  endpoint: string,
  config: AuthAxiosRequestConfig = {}
) => {
  const finalConfig = config.authRequired
    ? withAuth(config)
    : config;

  return apiClient.get(endpoint, finalConfig);
};

export const post = (
  endpoint: string,
  data?: any,
  config: AuthAxiosRequestConfig = {}
) => {
  const finalConfig = config.authRequired
    ? withAuth(config)
    : config;

  return apiClient.post(endpoint, data, finalConfig);
};

export const put = (
  endpoint: string,
  data?: any,
  config: AuthAxiosRequestConfig = {}
) => {
  const finalConfig = config.authRequired
    ? withAuth(config)
    : config;

  return apiClient.put(endpoint, data, finalConfig);
};

export const del = (
  endpoint: string,
  config: AuthAxiosRequestConfig = {}
) => {
  const finalConfig = config.authRequired
    ? withAuth(config)
    : config;

  return apiClient.delete(endpoint, finalConfig);
};

export const patch = (
  endpoint: string,
  data?: any,
  config: AuthAxiosRequestConfig = {}
) => {
  const finalConfig = config.authRequired
    ? withAuth(config)
    : config;

  return apiClient.patch(endpoint, data, finalConfig);
};

export default apiClient;
