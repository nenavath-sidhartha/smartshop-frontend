import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartshop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global error responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 401) {
        errorMessage = 'Unauthorized access. Please login.';
      } else if (error.response.status === 403) {
        errorMessage = 'Forbidden. You do not have permission.';
      } else if (error.response.status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (error.response.status === 500) {
        errorMessage = 'Internal server error. Please try later.';
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to SmartShop backend server.';
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
