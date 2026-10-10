import React, { useEffect } from 'react';

/**
 * A lightweight toast notification.
 * Props:
 *  - message: string
 *  - type: 'success' | 'error' | 'info'
 *  - onClose: function
 *  - duration: number (ms, default 4000)
 */
const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', icon: '✅' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      backgroundColor: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: '14px',
      padding: '1rem 1.25rem',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
      maxWidth: '420px',
      animation: 'slideUp 0.25s ease',
    }}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '1px' }}>{c.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: c.text }}>{message}</p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '1.1rem', color: c.text, opacity: 0.7,
          flexShrink: 0, lineHeight: 1, marginTop: '1px'
        }}
      >×</button>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }`}</style>
    </div>
  );
};

export default Toast;
