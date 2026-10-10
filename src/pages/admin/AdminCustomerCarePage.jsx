import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  adminGetAllConversations,
  adminJoinConversation,
  adminSendMessage,
} from '../../services/chatbotService';

const STATUS_COLORS = {
  ACTIVE: '#10b981',
  WAITING_FOR_AGENT: '#f59e0b',
  HUMAN_AGENT_ACTIVE: '#3b82f6',
  CLOSED: '#6b7280',
};

const AdminCustomerCarePage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetAllConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const handleJoin = async (convId) => {
    try {
      const { data } = await adminJoinConversation(convId);
      setSelectedConv(data);
      fetchConversations();
    } catch { /* ignore */ }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;
    setSending(true);
    try {
      const { data } = await adminSendMessage(selectedConv.id, replyText.trim());
      setSelectedConv(data);
      setReplyText('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const formatDate = (ds) =>
    ds ? new Date(ds).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const filtered = conversations.filter((c) => {
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchSearch =
      !search ||
      c.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-care-page">
      <div className="admin-page-header">
        <h1>👩‍💼 Customer Care — Live Chats</h1>
        <button className="btn-secondary" onClick={fetchConversations}>🔄 Refresh</button>
      </div>

      <div className="admin-care-layout">
        {/* LEFT: conversation list */}
        <div className="admin-conv-list-panel">
          <div className="admin-ticket-filters">
            <input
              className="admin-search-input"
              placeholder="🔍 Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="admin-conv-search"
            />
            <select
              className="admin-status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="admin-conv-status-filter"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="WAITING_FOR_AGENT">WAITING FOR AGENT</option>
              <option value="HUMAN_AGENT_ACTIVE">AGENT ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {loading ? (
            <div className="tickets-loading">Loading conversations…</div>
          ) : filtered.length === 0 ? (
            <div className="tickets-empty"><p>No conversations found.</p></div>
          ) : (
            <div className="admin-conv-list">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className={`admin-conv-item ${selectedConv?.id === c.id ? 'selected' : ''}`}
                  onClick={() => handleJoin(c.id)}
                  id={`conv-item-${c.id}`}
                >
                  <div className="admin-conv-item-header">
                    <span className="conv-user-name">
                      {c.userId ? `👤 ${c.userFullName}` : '👥 Guest'}
                    </span>
                    <span
                      className="ticket-status"
                      style={{ background: STATUS_COLORS[c.status] || '#6b7280' }}
                    >
                      {c.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="conv-last-msg">{c.lastMessage || '(no messages)'}</p>
                  <div className="conv-meta">
                    <span>💬 {c.messageCount} msgs</span>
                    <span>{c.userEmail || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: conversation detail */}
        <div className="admin-conv-detail-panel">
          {!selectedConv ? (
            <div className="admin-no-ticket-selected">
              <span>💬</span>
              <p>Select a conversation to view and reply</p>
            </div>
          ) : (
            <>
              <div className="admin-conv-detail-header">
                <div>
                  <strong>{selectedConv.userFullName || 'Guest'}</strong>
                  {selectedConv.userEmail && <span> · {selectedConv.userEmail}</span>}
                </div>
                <span
                  className="ticket-status"
                  style={{ background: STATUS_COLORS[selectedConv.status] || '#6b7280' }}
                >
                  {selectedConv.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Messages */}
              <div className="admin-conv-messages">
                {(selectedConv.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`ticket-message ${msg.sender === 'ADMIN' ? 'admin-msg' : msg.sender === 'BOT' ? 'bot-chat-msg' : 'customer-msg'}`}
                  >
                    <div className="ticket-msg-header">
                      <strong>
                        {msg.sender === 'ADMIN'
                          ? '👨‍💼 You (Admin)'
                          : msg.sender === 'BOT'
                          ? '🤖 SmartBot'
                          : `👤 ${selectedConv.userFullName || 'User'}`}
                      </strong>
                      <span className="ticket-msg-time">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="ticket-msg-body">{msg.message}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply */}
              <form className="admin-reply-form" onSubmit={handleSendReply} id="admin-care-reply-form">
                <textarea
                  className="ticket-reply-input"
                  placeholder="Type your reply to the customer…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  id="admin-care-reply-input"
                />
                <button
                  type="submit"
                  className="btn-send-reply"
                  disabled={sending || !replyText.trim()}
                  id="admin-care-reply-btn"
                >
                  {sending ? '⏳ Sending…' : '📨 Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerCarePage;
