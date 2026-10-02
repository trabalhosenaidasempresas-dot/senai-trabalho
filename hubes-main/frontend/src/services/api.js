import axios from 'axios';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearTokens,
} from '../utils/token';

const viteApiUrl = import.meta.env.VITE_API_URL;
const baseURL = viteApiUrl ? viteApiUrl.replace(/\/$/, '') : '/api';

const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!originalRequest || err.response?.status !== 401) {
      return Promise.reject(err);
    }

    if (originalRequest._retry) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(err);
    }

    try {
      const refreshResponse = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const payload = refreshResponse.data?.data || refreshResponse.data;
      const { token, refreshToken: newRefreshToken } = payload || {};

      if (!token || !newRefreshToken) {
        throw new Error('Falha ao renovar token');
      }

      setToken(token);
      setRefreshToken(newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default api;

