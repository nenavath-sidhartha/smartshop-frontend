import api from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    return await api.get('/api/products', { params });
  },

  getProductById: async (id) => {
    return await api.get(`/api/products/${id}`);
  },

  createProduct: async (productData) => {
    return await api.post('/api/products', productData);
  },

  updateProduct: async (id, productData) => {
    return await api.put(`/api/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return await api.delete(`/api/products/${id}`);
  },

  checkStock: async (id, quantity = 1) => {
    return await api.get(`/api/products/${id}/check-stock?quantity=${quantity}`);
  }
};

export default productService;
