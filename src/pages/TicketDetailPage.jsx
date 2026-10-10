import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTicketById, addCustomerMessage } from '../services/supportService';

const STATUS_COLORS = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  WAITING_FOR_CUSTOMER: '#8b5cf6',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchTicket();
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const { data } = await getMyTicketById(id);
      setTicket(data);
    } catch {
      setError('Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    setError('');
    try {
      const { data } = await addCustomerMessage(id, replyText.trim());
      setTicket(data);
      setReplyText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (ds) =>
    ds ? new Date(ds).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  if (loading) return <div className="ticket-detail-loading">Loading ticket…</div>;
  if (error && !ticket) return (
    <div className="ticket-detail-error">
      <p>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/support')}>Back to Support</button>
    </div>
  );

  const isClosed = ticket?.status === 'CLOSED' || ticket?.status === 'RESOLVED';

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-container">
        {/* Header */}
        <div className="ticket-detail-header">
          <button className="back-btn" onClick={() => navigate('/support?tab=my')}>← Back</button>
          <div className="ticket-detail-title">
            <h2>{ticket?.subject}</h2>
            <div className="ticket-detail-meta">
              <span className="ticket-number">#{ticket?.ticketNumber}</span>
              <span
                className="ticket-status"
                style={{ background: STATUS_COLORS[ticket?.status] || '#6b7280' }}
              >
                {ticket?.status?.replace(/_/g, ' ')}
              </span>
              <span>📁 {ticket?.category}</span>
              <span>⚡ {ticket?.priority}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="ticket-messages-area">
          {ticket?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`ticket-message ${msg.senderRole === 'CUSTOMER' ? 'customer-msg' : 'admin-msg'}`}
            >
              <div className="ticket-msg-header">
                <strong>{msg.senderRole === 'CUSTOMER' ? '👤 You' : '👨‍💼 Support Team'}</strong>
                <span className="ticket-msg-time">{formatDate(msg.createdAt)}</span>
              </div>
              <p className="ticket-msg-body">{msg.message}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply box */}
        {isClosed ? (
          <div className="ticket-closed-note">
            🔒 This ticket is {ticket?.status?.toLowerCase()}. Please{' '}
            <span className="link" onClick={() => navigate('/support')}>open a new ticket</span>{' '}
            if you need further help.
          </div>
        ) : (
          <form className="ticket-reply-form" onSubmit={handleReply} id="ticket-reply-form">
            {error && <div className="alert-error">{error}</div>}
            <textarea
              className="ticket-reply-input"
              placeholder="Type your reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              id="ticket-reply-input"
            />
            <button
              id="ticket-reply-btn"
              type="submit"
              className="btn-send-reply"
              disabled={sending || !replyText.trim()}
            >
              {sending ? '⏳ Sending…' : '📨 Send Reply'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage;
