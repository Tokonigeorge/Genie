import axios, { AxiosInstance } from 'axios';
import { supabase } from '../lib/supabase';

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token if possible
      const {
        data: { session },
      } = await supabase.auth.refreshSession();
      if (session) {
        // Retry the original request
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return api(originalRequest);
      }
      // If no session, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
