import api from './api';

export const orderService = {
  placeOrder: async (orderData) => {
    return await api.post('/api/orders', orderData);
  },

  getAllOrders: async (status) => {
    const params = status ? { status } : {};
    return await api.get('/api/orders', { params });
  },

  getOrderById: async (id) => {
    return await api.get(`/api/orders/${id}`);
  },

  getOrderByNumber: async (orderNumber) => {
    return await api.get(`/api/orders/number/${orderNumber}`);
  },

  getUserOrders: async (userId, status) => {
    const params = status ? { status } : {};
    return await api.get(`/api/orders/user/${userId}`, { params });
  },

  updateOrderStatus: async (id, statusData) => {
    return await api.put(`/api/orders/${id}/status`, statusData);
  },

  /**
   * Customer-initiated order cancellation.
   * PATCH /api/orders/{orderId}/cancel
   */
  cancelOrder: async (orderId, cancelData) => {
    return await api.patch(`/api/orders/${orderId}/cancel`, cancelData);
  },

  getAdminStats: async () => {
    return await api.get('/api/orders/admin/stats');
  }
};

export default orderService;
