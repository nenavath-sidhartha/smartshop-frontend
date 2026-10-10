import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';

const UserProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user ? user.fullName || '' : '',
    phoneNumber: user ? user.phoneNumber || '' : '',
    newPassword: ''
  });
  const [message, setMessage] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateProfile(user.email, formData);
      if (res.data) {
        updateUser(res.data);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>My Profile</h1>

      {message && (
        <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Profile Sidebar */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', pb: '1.25rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              fontSize: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              fontWeight: 800
            }}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{user.fullName}</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</span>
          </div>

          <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
            ✏️ Edit Profile
          </button>

          <button onClick={logout} className="btn-outline" style={{ width: '100%', color: '#ef4444', borderColor: '#fee2e2' }}>
            🚪 Logout
          </button>
        </div>

        {/* Profile Content */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', pb: '0.75rem' }}>
            Account Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block' }}>FULL NAME</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{user.fullName}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block' }}>EMAIL ADDRESS</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{user.email}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block' }}>PHONE NUMBER</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{user.phoneNumber || 'Not provided'}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block' }}>ACCOUNT ROLE</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb' }}>{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
        <form onSubmit={handleUpdate}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
