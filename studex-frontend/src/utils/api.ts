import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
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
