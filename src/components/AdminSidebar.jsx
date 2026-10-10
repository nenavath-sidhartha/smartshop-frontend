import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        Smart<span>Admin</span>
      </div>

      <ul className="admin-menu">
        <li className="admin-menu-item">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            📊 Dashboard
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            📦 Manage Products
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
            📁 Manage Categories
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            🛒 Manage Orders
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/deliveries" className={({ isActive }) => (isActive ? 'active' : '')}>
            🛵 Delivery Fleet
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
            👥 Manage Users
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? 'active' : '')}>
            🏬 Inventory
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
            📈 Reports
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/support" className={({ isActive }) => (isActive ? 'active' : '')}>
            🎫 Support Tickets
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/faqs" className={({ isActive }) => (isActive ? 'active' : '')}>
            📚 Manage FAQs
          </NavLink>
        </li>
        <li className="admin-menu-item">
          <NavLink to="/admin/customer-care" className={({ isActive }) => (isActive ? 'active' : '')}>
            👩‍💼 Customer Care
          </NavLink>
        </li>
        <li className="admin-menu-item" style={{ marginTop: 'auto' }}>
          <button
            onClick={() => {
              if (onLogout) onLogout();
              navigate('/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: '#ef4444',
              backgroundColor: 'transparent',
              border: 'none',
              width: '100%',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🚪 Logout Admin
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default AdminSidebar;
