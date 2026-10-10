import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminGetAllTickets,
  adminGetTicketById,
  adminUpdateTicket,
  adminAddMessage,
  adminDeleteTicket,
  adminGetDashboardStats,
} from '../../services/supportService';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];

const STATUS_COLORS = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  WAITING_FOR_CUSTOMER: '#8b5cf6',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
};

const AdminSupportPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      const { data } = await adminGetDashboardStats();
      setStats(data);
    } catch { /* ignore */ }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetAllTickets(filterStatus);
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (id) => {
    try {
      const { data } = await adminGetTicketById(id);
      setSelectedTicket(data);
      setNewStatus(data.status);
      setReplyText('');
    } catch { /* ignore */ }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTicket) return;
    try {
      const { data } = await adminUpdateTicket(selectedTicket.id, { status: newStatus });
      setSelectedTicket(data);
      fetchTickets();
      fetchStats();
    } catch { /* ignore */ }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const { data } = await adminAddMessage(selectedTicket.id, replyText.trim());
      setSelectedTicket(data);
      setReplyText('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await adminDeleteTicket(id);
      if (selectedTicket?.id === id) setSelectedTicket(null);
      fetchTickets();
      fetchStats();
    } catch { /* ignore */ }
  };

  const formatDate = (ds) =>
    ds ? new Date(ds).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '';

  const filteredTickets = tickets.filter((t) =>
    !search ||
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.userFullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-support-page">
      <div className="admin-page-header">
        <h1>🎫 Support Tickets</h1>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="admin-support-stats">
          {[
            { label: 'Open', value: stats.openTickets, color: '#3b82f6' },
            { label: 'In Progress', value: stats.inProgressTickets, color: '#f59e0b' },
            { label: 'Waiting', value: stats.waitingForCustomer, color: '#8b5cf6' },
            { label: 'Resolved Today', value: stats.resolvedToday, color: '#10b981' },
            { label: 'Total', value: stats.totalTickets, color: '#6366f1' },
          ].map((s) => (
            <div key={s.label} className="admin-stat-card" style={{ borderLeftColor: s.color }}>
              <span className="stat-val" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-support-layout">
        {/* LEFT: ticket list */}
        <div className="admin-ticket-list-panel">
          {/* Filters */}
          <div className="admin-ticket-filters">
            <input
              className="admin-search-input"
              placeholder="🔍 Search tickets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="admin-ticket-search"
            />
            <select
              className="admin-status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="admin-status-filter"
            >
              <option value="ALL">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="tickets-loading">Loading…</div>
          ) : filteredTickets.length === 0 ? (
            <div className="tickets-empty"><p>No tickets found.</p></div>
          ) : (
            <div className="admin-ticket-list">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className={`admin-ticket-item ${selectedTicket?.id === t.id ? 'selected' : ''}`}
                  onClick={() => openTicket(t.id)}
                  id={`admin-ticket-${t.id}`}
                >
                  <div className="admin-ticket-item-header">
                    <span className="ticket-number">#{t.ticketNumber}</span>
                    <span className="ticket-status" style={{ background: STATUS_COLORS[t.status] }}>
                      {t.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="admin-ticket-subject">{t.subject}</div>
                  <div className="admin-ticket-meta">
                    <span>👤 {t.userFullName}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: ticket detail */}
        <div className="admin-ticket-detail-panel">
          {!selectedTicket ? (
            <div className="admin-no-ticket-selected">
              <span>🎫</span>
              <p>Select a ticket to view details</p>
            </div>
          ) : (
            <>
              {/* Ticket info */}
              <div className="admin-ticket-info">
                <div className="admin-ticket-info-header">
                  <div>
                    <h3>{selectedTicket.subject}</h3>
                    <div className="admin-ticket-badges">
                      <span>#{selectedTicket.ticketNumber}</span>
                      <span>📁 {selectedTicket.category}</span>
                      <span>⚡ {selectedTicket.priority}</span>
                      {selectedTicket.relatedOrderNumber && (
                        <span>🛒 {selectedTicket.relatedOrderNumber}</span>
                      )}
                    </div>
                    <div className="admin-ticket-user-info">
                      <span>👤 {selectedTicket.userFullName}</span>
                      <span>✉️ {selectedTicket.userEmail}</span>
                    </div>
                  </div>
                  <button
                    className="btn-delete-ticket"
                    onClick={() => handleDelete(selectedTicket.id)}
                    id={`delete-ticket-${selectedTicket.id}`}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* Status updater */}
                <div className="admin-ticket-status-row">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="admin-status-select"
                    id="admin-ticket-status-select"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <button
                    className="btn-update-status"
                    onClick={handleStatusUpdate}
                    id="btn-update-ticket-status"
                  >
                    Update Status
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="admin-ticket-messages">
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ticket-message ${msg.senderRole === 'CUSTOMER' ? 'customer-msg' : 'admin-msg'}`}
                  >
                    <div className="ticket-msg-header">
                      <strong>{msg.senderRole === 'CUSTOMER' ? `👤 ${msg.senderName}` : '👨‍💼 Support Team'}</strong>
                      <span className="ticket-msg-time">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="ticket-msg-body">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply */}
              <form className="admin-reply-form" onSubmit={handleReply} id="admin-reply-form">
                <textarea
                  className="ticket-reply-input"
                  placeholder="Type your reply to the customer…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  id="admin-reply-input"
                />
                <button
                  type="submit"
                  className="btn-send-reply"
                  disabled={sending || !replyText.trim()}
                  id="admin-reply-btn"
                >
                  {sending ? '⏳ Sending…' : '📨 Send Reply'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;
