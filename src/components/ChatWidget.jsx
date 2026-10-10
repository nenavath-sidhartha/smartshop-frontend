import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/chatbotService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QUICK_REPLIES = [
  '🛍️ Track my order',
  '📦 Show products',
  '🔄 Return policy',
  '💳 Payment methods',
  '📞 Talk to an agent',
];

const TypingIndicator = () => (
  <div className="chat-bubble bot typing-bubble">
    <span className="typing-dot" />
    <span className="typing-dot" />
    <span className="typing-dot" />
  </div>
);

const ChatBubble = ({ msg, navigate }) => {
  const isBot = msg.sender === 'bot';
  return (
    <div className={`chat-msg-row ${isBot ? 'bot-row' : 'user-row'}`}>
      {isBot && (
        <div className="chat-avatar bot-avatar">🤖</div>
      )}
      <div className={`chat-bubble ${isBot ? 'bot' : 'user'}`}>
        <p className="bubble-text">{msg.text}</p>

        {/* Product cards */}
        {msg.products && msg.products.length > 0 && (
          <div className="chat-product-list">
            {msg.products.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="chat-product-card"
                onClick={() => navigate(`/products/${p.id}`)}
              >
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
                <div className="chat-product-info">
                  <span className="chat-product-name">{p.name}</span>
                  <span className="chat-product-price">₹{p.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {msg.actions && msg.actions.length > 0 && (
          <div className="chat-actions">
            {msg.actions.map((a, i) => (
              <button
                key={i}
                className="chat-action-btn"
                onClick={() => navigate(a.url)}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        <span className="bubble-time">
          {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {!isBot && <div className="chat-avatar user-avatar">👤</div>}
    </div>
  );
};

const ChatWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm SmartBot, your SmartShop assistant. How can I help you today?",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: trimmed,
        sessionId: user ? undefined : sessionId,
        conversationId: conversationId || undefined,
      };
      const { data } = await sendChatMessage(payload);
      if (data.conversationId) setConversationId(data.conversationId);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || "Sorry, I couldn't process that. Please try again.",
        products: data.products,
        actions: data.actions,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'bot',
          text: '⚠️ Connection error. Please check your network and try again.',
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        id="chat-widget-toggle"
        className={`chat-widget-toggle ${open ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat"
      >
        {open ? '✕' : '💬'}
        {!open && <span className="chat-badge">1</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chat-widget-panel" id="chat-widget-panel">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-header-info">
              <div className="chat-bot-icon">🤖</div>
              <div>
                <div className="chat-header-title">SmartBot</div>
                <div className="chat-header-sub">
                  <span className="online-dot" />
                  Online · SmartShop Support
                </div>
              </div>
            </div>
            <button className="chat-header-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages-area">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} navigate={navigate} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="chat-quick-replies">
            {QUICK_REPLIES.map((q) => (
              <button key={q} className="quick-reply-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              id="chat-message-input"
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              id="chat-send-btn"
            >
              ➤
            </button>
          </div>

          <div className="chat-footer-bar">
            Powered by SmartShop AI ·{' '}
            <span className="chat-support-link" onClick={() => { navigate('/support'); setOpen(false); }}>
              Open a ticket
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
