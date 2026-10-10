import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'ROLE_CUSTOMER'
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await register(formData);
      if (res.data && res.data.user) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '3rem 2.5rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Create Account</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Join SmartShop for fast shopping and exclusive deals</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="fullName"
            placeholder="e.g. Rahul Sharma"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="e.g. rahul@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            placeholder="e.g. 9876543210"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <Button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }}>
            {submitting ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
