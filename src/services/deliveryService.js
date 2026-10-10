import api from './api';

export const deliveryService = {
  // ── Delivery Agent Operations ──────────────────────────────────────────────
  getMyAssignedOrders: async (email) => {
    const params = email ? { email } : {};
    return await api.get('/api/delivery/my-orders', { params });
  },

  getOrderDetails: async (orderId, email) => {
    const params = email ? { email } : {};
    return await api.get(`/api/delivery/orders/${orderId}`, { params });
  },

  startDelivery: async (orderId, email) => {
    const params = email ? { email } : {};
    return await api.post(`/api/delivery/orders/${orderId}/start`, {}, { params });
  },

  updateLocation: async (orderId, locationData, email) => {
    const params = email ? { email } : {};
    return await api.post(`/api/delivery/orders/${orderId}/location`, locationData, { params });
  },

  completeDelivery: async (orderId, email) => {
    const params = email ? { email } : {};
    return await api.post(`/api/delivery/orders/${orderId}/complete`, {}, { params });
  },

  // ── Admin Operations ───────────────────────────────────────────────────────
  getUnassignedOrders: async () => {
    return await api.get('/api/admin/deliveries/unassigned');
  },

  getDeliveryAgents: async () => {
    return await api.get('/api/admin/deliveries/agents');
  },

  getAllAssignments: async () => {
    return await api.get('/api/admin/deliveries/assignments');
  },

  assignAgent: async (assignmentData) => {
    return await api.post('/api/admin/deliveries/assign', assignmentData);
  },

  reassignAgent: async (assignmentData) => {
    return await api.post('/api/admin/deliveries/reassign', assignmentData);
  }
};

export default deliveryService;
