import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import Loading from '../../components/Loading';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [agentSubmitting, setAgentSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      if (res.data) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setMessage({ type: 'success', text: `Role updated to ${newRole} successfully!` });
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update role' });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setAgentSubmitting(true);
    try {
      await userService.createDeliveryAgent(newAgent);
      setMessage({ type: 'success', text: `Delivery agent ${newAgent.fullName} created successfully!` });
      setShowModal(false);
      setNewAgent({ fullName: '', email: '', phoneNumber: '', password: '' });
      fetchUsers();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to create delivery agent');
    } finally {
      setAgentSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading user accounts..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-title" style={{ margin: 0 }}>Manage Users</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            View accounts, assign delivery roles, and register delivery personnel.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          🛵 Register Delivery Agent
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#166534' : '#b91c1c',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {message.text}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role Assignment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usr) => (
              <tr key={usr.id}>
                <td style={{ fontWeight: 700 }}>#{usr.id}</td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{usr.fullName}</td>
                <td>{usr.email}</td>
                <td>{usr.phoneNumber || 'N/A'}</td>
                <td>
                  {usr.role === 'ROLE_ADMIN' ? (
                    <span style={{
                      backgroundColor: '#6366f1',
                      color: 'white',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      fontSize: '0.78rem'
                    }}>
                      ROLE_ADMIN
                    </span>
                  ) : (
                    <select
                      value={usr.role}
                      onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        backgroundColor: usr.role === 'ROLE_DELIVERY_AGENT' ? '#fff7ed' : '#f8fafc',
                        color: usr.role === 'ROLE_DELIVERY_AGENT' ? '#ea580c' : '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="ROLE_CUSTOMER">ROLE_CUSTOMER</option>
                      <option value="ROLE_DELIVERY_AGENT">ROLE_DELIVERY_AGENT 🛵</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                  )}
                </td>
                <td>
                  <span className={`badge badge-${usr.status.toLowerCase()}`}>{usr.status}</span>
                </td>
                <td>
                  {usr.role === 'ROLE_ADMIN' ? (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Protected Admin</span>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(usr.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        backgroundColor: usr.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
                        color: usr.status === 'ACTIVE' ? '#b91c1c' : '#15803d',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      {usr.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for creating a Delivery Agent */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                🛵 Register New Delivery Agent
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: '#64748b' }}>
              Creates an authorized driver account with secure password hashing.
            </p>

            <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newAgent.fullName}
                  onChange={(e) => setNewAgent({ ...newAgent, fullName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.agent@smartshop.com"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={newAgent.phoneNumber}
                  onChange={(e) => setNewAgent({ ...newAgent, phoneNumber: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={agentSubmitting}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  {agentSubmitting ? 'Creating...' : 'Create Agent Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
