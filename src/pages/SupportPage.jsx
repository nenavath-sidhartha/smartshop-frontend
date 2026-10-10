import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createTicket, getMyTickets } from '../services/supportService';

const CATEGORIES = ['ORDER', 'PAYMENT', 'DELIVERY', 'RETURN', 'REFUND', 'PRODUCT', 'ACCOUNT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STATUS_COLORS = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  WAITING_FOR_CUSTOMER: '#8b5cf6',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
};

const SupportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('new'); // 'new' | 'my'
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    relatedOrderNumber: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/support' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (tab === 'my' && user) fetchMyTickets();
  }, [tab, user]);

  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data } = await getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await createTicket(form);
      setSuccess(`✅ Ticket ${data.ticketNumber} created successfully! We'll respond within 24 hours.`);
      setForm({ subject: '', description: '', category: 'OTHER', priority: 'MEDIUM', relatedOrderNumber: '' });
      setTab('my');
      fetchMyTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="support-page">
      {/* Hero */}
      <div className="support-hero">
        <h1>🎫 Support Center</h1>
        <p>We're here to help. Create a ticket or view your existing requests.</p>
      </div>

      <div className="support-container">
        {/* Tabs */}
        <div className="support-tabs">
          <button
            id="tab-new-ticket"
            className={`support-tab ${tab === 'new' ? 'active' : ''}`}
            onClick={() => setTab('new')}
          >
            ✏️ New Ticket
          </button>
          <button
            id="tab-my-tickets"
            className={`support-tab ${tab === 'my' ? 'active' : ''}`}
            onClick={() => setTab('my')}
          >
            📋 My Tickets
          </button>
        </div>

        {/* ── NEW TICKET FORM ── */}
        {tab === 'new' && (
          <div className="support-form-card">
            <h2>Submit a Support Request</h2>

            {success && <div className="alert-success">{success}</div>}
            {error && <div className="alert-error">{error}</div>}

            <form className="support-form" onSubmit={handleSubmit} id="support-ticket-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="ticket-category">Category *</label>
                  <select id="ticket-category" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ticket-priority">Priority</label>
                  <select id="ticket-priority" name="priority" value={form.priority} onChange={handleChange}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ticket-subject">Subject *</label>
                <input
                  id="ticket-subject"
                  name="subject"
                  type="text"
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={300}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticket-order">Related Order Number (optional)</label>
                <input
                  id="ticket-order"
                  name="relatedOrderNumber"
                  type="text"
                  placeholder="e.g. ORD-20241001-1234"
                  value={form.relatedOrderNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticket-description">Describe your issue *</label>
                <textarea
                  id="ticket-description"
                  name="description"
                  rows={5}
                  placeholder="Please provide as much detail as possible…"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <button
                id="submit-ticket-btn"
                type="submit"
                className="btn-submit-ticket"
                disabled={submitting}
              >
                {submitting ? '⏳ Submitting…' : '🚀 Submit Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* ── MY TICKETS ── */}
        {tab === 'my' && (
          <div className="my-tickets-section">
            <h2>My Support Tickets</h2>
            {loadingTickets ? (
              <div className="tickets-loading">Loading your tickets…</div>
            ) : tickets.length === 0 ? (
              <div className="tickets-empty">
                <span>🎫</span>
                <p>You haven't submitted any tickets yet.</p>
                <button className="btn-primary" onClick={() => setTab('new')}>Create First Ticket</button>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="ticket-card"
                    onClick={() => navigate(`/support/${t.id}`)}
                    id={`ticket-${t.id}`}
                  >
                    <div className="ticket-header">
                      <span className="ticket-number">#{t.ticketNumber}</span>
                      <span
                        className="ticket-status"
                        style={{ background: STATUS_COLORS[t.status] || '#6b7280' }}
                      >
                        {t.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="ticket-subject">{t.subject}</div>
                    <div className="ticket-meta">
                      <span>📁 {t.category}</span>
                      <span>⚡ {t.priority}</span>
                      <span>📅 {formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
