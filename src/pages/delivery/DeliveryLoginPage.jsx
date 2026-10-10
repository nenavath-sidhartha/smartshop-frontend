import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeliveryLoginPage = () => {
  const [email, setEmail] = useState('agent@smartshop.com');
  const [password, setPassword] = useState('agent123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      const authData = res && res.data ? res.data : res;
      const user = authData && authData.user ? authData.user : null;

      if (!user) {
        throw new Error('Authentication succeeded but user profile was not returned.');
      }

      if (user.role !== 'ROLE_DELIVERY_AGENT' && user.role !== 'ROLE_ADMIN') {
        logout();
        setError('Access Denied: This portal is strictly reserved for SmartShop Delivery Agents.');
        return;
      }

      navigate('/delivery/dashboard');
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('connect')) {
        setError('Connection error: Unable to reach the SmartShop backend server. Please verify the backend is online.');
      } else {
        setError(err.message || 'Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '2px solid #fed7aa',
            }}
          >
            🛵
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
            Delivery Partner Portal
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            SmartShop Driver & Logistics Management
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Delivery Agent Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="agent@smartshop.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Quick Demo Credentials Tip */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              padding: '0.75rem',
              fontSize: '0.8rem',
              color: '#475569',
            }}
          >
            <strong>Default Demo Agent:</strong><br />
            Email: <code style={{ color: '#0284c7' }}>agent@smartshop.com</code> | Password: <code style={{ color: '#0284c7' }}>agent123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 800,
              backgroundColor: '#ea580c',
              borderColor: '#ea580c',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Delivery Partner 🛵'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to SmartShop Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLoginPage;
