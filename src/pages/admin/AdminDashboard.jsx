import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          orderService.getAdminStats(),
          orderService.getAllOrders()
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (ordersRes.data) setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading message="Loading admin dashboard analytics..." />;

  return (
    <div>
      <h1 className="admin-title" style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h1>

      {/* Metric Cards Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total Products</div>
          <div className="stat-card-value">{stats ? stats.totalProducts : 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Active in store</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Orders</div>
          <div className="stat-card-value">{stats ? stats.totalOrders : 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>All time customer orders</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Users</div>
          <div className="stat-card-value">{stats ? stats.totalUsers : 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Registered accounts</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Revenue</div>
          <div className="stat-card-value" style={{ color: '#10b981' }}>
            ₹{stats ? stats.totalRevenue.toLocaleString('en-IN') : '0'}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Gross sales value</span>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Order Status Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', display: 'block' }}>{stats ? stats.processingOrders : 0}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>Processing</span>
          </div>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', display: 'block' }}>{stats ? stats.shippedOrders : 0}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>Shipped</span>
          </div>
          <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', display: 'block' }}>{stats ? stats.deliveredOrders : 0}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>Delivered</span>
          </div>
          <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', display: 'block' }}>{stats ? stats.cancelledOrders : 0}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="table-responsive">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Customer Orders</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No orders recorded yet.</td></tr>
            ) : (
              recentOrders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{ord.orderNumber}</td>
                  <td>{ord.customerName}</td>
                  <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge badge-${ord.orderStatus.toLowerCase()}`}>{ord.orderStatus}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
