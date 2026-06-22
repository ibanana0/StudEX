import axios from 'axios';

const api = axios.create({
  // Empty/unset NEXT_PUBLIC_API_URL -> relative `/api`, proxied to backend via
  // next.config rewrite (avoids HTTPS->HTTP mixed content in prod). Local dev
  // sets it to http://localhost:3001 for a direct call.
  baseURL: (() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === 'undefined') {
      return '/api';
    }
    return `${apiUrl}/api`;
  })(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const isUnauthorized = error?.response?.status === 401;
      const isBannedOrSuspended =
        error?.response?.status === 403 &&
        error?.response?.data?.message?.includes('Akun Anda');

      if (isUnauthorized || isBannedOrSuspended) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('session_mode');
        
        // Only redirect if they are not already on the login page to avoid loops
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
