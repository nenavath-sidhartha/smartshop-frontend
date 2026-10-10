import api from './api';

// ─── Public FAQ ────────────────────────────────────────────────────────────

export const getActiveFAQs = () => api.get('/api/faqs');

export const getFAQsByCategory = (category) =>
  api.get(`/api/faqs/category/${category}`);

export const getFAQById = (id) => api.get(`/api/faqs/${id}`);

// ─── Admin FAQ ─────────────────────────────────────────────────────────────

export const adminGetAllFAQs = () => api.get('/api/faqs/admin/all');

export const adminCreateFAQ = (data) => api.post('/api/faqs/admin', data);

export const adminUpdateFAQ = (id, data) => api.put(`/api/faqs/admin/${id}`, data);

export const adminDeleteFAQ = (id) => api.delete(`/api/faqs/admin/${id}`);
