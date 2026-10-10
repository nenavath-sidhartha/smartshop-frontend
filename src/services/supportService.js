import api from './api';

// ─── Customer Support Tickets ──────────────────────────────────────────────

export const createTicket = (data) => api.post('/api/support/tickets', data);

export const getMyTickets = () => api.get('/api/support/tickets/my');

export const getMyTicketById = (id) => api.get(`/api/support/tickets/my/${id}`);

export const addCustomerMessage = (id, message) =>
  api.post(`/api/support/tickets/my/${id}/messages`, { message });

// ─── Admin Support Tickets ─────────────────────────────────────────────────

export const adminGetAllTickets = (status = 'ALL') =>
  api.get(`/api/support/admin/tickets?status=${status}`);

export const adminGetTicketById = (id) => api.get(`/api/support/admin/tickets/${id}`);

export const adminUpdateTicket = (id, params) =>
  api.patch(`/api/support/admin/tickets/${id}`, null, { params });

export const adminAddMessage = (id, message) =>
  api.post(`/api/support/admin/tickets/${id}/messages`, { message });

export const adminDeleteTicket = (id) => api.delete(`/api/support/admin/tickets/${id}`);

export const adminGetDashboardStats = () => api.get('/api/support/admin/dashboard');
