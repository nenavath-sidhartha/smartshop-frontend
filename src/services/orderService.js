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
  },

  // ─── REORDER & RECENT PURCHASES ──────────────────────────────────────────

  getMyRecentOrders: async (limit = 5, email) => {
    const params = { limit };
    if (email) params.email = email;
    return await api.get('/api/orders/my/recent', { params });
  },

  getMyRecentPurchasedProducts: async (email) => {
    const params = email ? { email } : {};
    return await api.get('/api/orders/my/recent-products', { params });
  },

  getReorderSummary: async (orderId, email) => {
    const params = email ? { email } : {};
    return await api.get(`/api/orders/${orderId}/reorder-summary`, { params });
  },

  reorder: async (orderId, requestData = {}, email) => {
    const params = email ? { email } : {};
    return await api.post(`/api/orders/${orderId}/reorder`, requestData, { params });
  },

  // ─── DELIVERY TRACKING ───────────────────────────────────────────────────

  getOrderTracking: async (orderId, email) => {
    const params = email ? { email } : {};
    return await api.get(`/api/orders/${orderId}/tracking`, { params });
  },

  getLatestTrackingLocation: async (orderId, email) => {
    const params = email ? { email } : {};
    return await api.get(`/api/orders/${orderId}/tracking/location`, { params });
  }
};

export default orderService;
