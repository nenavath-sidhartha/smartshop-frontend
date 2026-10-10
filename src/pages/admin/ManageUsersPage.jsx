import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import Loading from '../../components/Loading';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loading message="Loading user accounts..." />;

  return (
    <div>
      <h1 className="admin-title" style={{ marginBottom: '1.5rem' }}>Manage Users</h1>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
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
                  <span style={{
                    backgroundColor: usr.role === 'ROLE_ADMIN' ? '#6366f1' : '#e2e8f0',
                    color: usr.role === 'ROLE_ADMIN' ? 'white' : '#0f172a',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem'
                  }}>
                    {usr.role}
                  </span>
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
    </div>
  );
};

export default ManageUsersPage;
