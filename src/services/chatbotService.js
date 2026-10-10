import api from './api';

// ─── Chatbot ───────────────────────────────────────────────────────────────

export const sendChatMessage = (messageData) =>
  api.post('/api/chatbot/message', messageData);

export const getConversation = (conversationId) =>
  api.get(`/api/chatbot/conversations/${conversationId}`);

export const getMyConversations = () =>
  api.get('/api/chatbot/my-conversations');

// ─── Admin Chatbot ─────────────────────────────────────────────────────────

export const adminGetAllConversations = () =>
  api.get('/api/chatbot/admin/conversations');

export const adminJoinConversation = (conversationId) =>
  api.post(`/api/chatbot/admin/conversations/${conversationId}/join`);

export const adminSendMessage = (conversationId, message) =>
  api.post(`/api/chatbot/admin/conversations/${conversationId}/message`, { message });
