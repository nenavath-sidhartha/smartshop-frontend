import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    return await api.get('/api/categories');
  },

  getCategoryById: async (id) => {
    return await api.get(`/api/categories/${id}`);
  },

  createCategory: async (categoryData) => {
    return await api.post('/api/categories', categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return await api.put(`/api/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return await api.delete(`/api/categories/${id}`);
  }
};

export default categoryService;
