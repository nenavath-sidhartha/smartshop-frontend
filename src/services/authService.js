import api from './api';

export const authService = {
  register: async (registerData) => {
    const res = await api.post('/api/auth/register', registerData);
    if (res && res.data && res.data.token) {
      localStorage.setItem('smartshop_token', res.data.token);
      localStorage.setItem('smartshop_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  login: async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    if (res && res.data && res.data.token) {
      localStorage.setItem('smartshop_token', res.data.token);
      localStorage.setItem('smartshop_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('smartshop_token');
    localStorage.removeItem('smartshop_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('smartshop_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('smartshop_token');
  }
};

export default authService;
