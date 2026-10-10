import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar onLogout={logout} />
      <main className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#ffffff', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Logged in as</span>
            <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>{user.fullName} ({user.email})</h4>
          </div>
          <span style={{ backgroundColor: '#6366f1', color: 'white', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>
            SUPER ADMIN
          </span>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
