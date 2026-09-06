import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qpeduli_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export default api;

export function apiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: string } | undefined)?.error || fallback;
  }
  return fallback;
}
