import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await login(email, password);

      // res is the ApiResponse object from the server
      // res.data is AuthResponse { token, user }
      const authData = res && res.data ? res.data : res;
      const user = authData && authData.user ? authData.user : null;

      if (user) {
        const role = user.role;
        if (role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else if (role === 'ROLE_DELIVERY_AGENT') {
          navigate('/delivery/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Even without user data in response, if login succeeded, go to home
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f5f3ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '3rem 2.5rem',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)'
          }}>
            🛍️
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Welcome Back!</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Sign in to your SmartShop account</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. rahul@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }}
          >
            {submitting ? '⏳ Signing In...' : '🔐 Login to SmartShop'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1',
          fontSize: '0.85rem'
        }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#334155' }}>🧪 Demo Credentials:</p>
          <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
            <strong>Customer:</strong> customer@smartshop.com / customer123
          </p>
          <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
            <strong>Admin:</strong> admin@smartshop.com / admin123
          </p>
          <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
            <strong>Delivery Partner:</strong> agent@smartshop.com / agent123
          </p>
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/delivery/login" style={{ color: '#ea580c', fontWeight: 700, textDecoration: 'none', fontSize: '0.82rem' }}>
              🛵 Delivery Partner Login Portal →
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Register Now →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
