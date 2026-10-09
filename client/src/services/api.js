import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create central Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically attach Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If receiving 401 Unauthorized and not on login/register endpoints, handle logout
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        // Let AuthContext handle user state cleanup
      }
    }
    return Promise.reject(error);
  }
);

export default api;
