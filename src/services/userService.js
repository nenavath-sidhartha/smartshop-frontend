import api from './api';

export const userService = {
  getProfile: async (email) => {
    return await api.get(`/api/users/profile?email=${encodeURIComponent(email)}`);
  },

  updateProfile: async (email, profileData) => {
    return await api.put(`/api/users/profile?email=${encodeURIComponent(email)}`, profileData);
  },

  getAllUsers: async () => {
    return await api.get('/api/users');
  },

  toggleUserStatus: async (userId) => {
    return await api.put(`/api/users/${userId}/status`);
  }
};

export default userService;
