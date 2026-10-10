import api from './api';

export const cartService = {
  getCart: async (userId, email) => {
    const params = {};
    if (userId) params.userId = userId;
    if (email) params.email = email;
    return await api.get('/api/cart', { params });
  },

  addToCart: async (userId, productId, quantity = 1) => {
    return await api.post('/api/cart/items', { userId, productId, quantity });
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    return await api.put(`/api/cart/items/${itemId}`, { quantity });
  },

  removeCartItem: async (itemId) => {
    return await api.delete(`/api/cart/items/${itemId}`);
  },

  clearCart: async (userId) => {
    return await api.delete(`/api/cart/clear?userId=${userId}`);
  }
};

export default cartService;
