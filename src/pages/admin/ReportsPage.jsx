import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import Loading from '../../components/Loading';

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const [statsRes, prodRes] = await Promise.all([
          orderService.getAdminStats(),
          productService.getAllProducts({ sort: 'popularity' })
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (prodRes.data) setTopProducts(prodRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, []);

  if (loading) return <Loading message="Generating analytics reports..." />;

  return (
    <div>
      <h1 className="admin-title" style={{ marginBottom: '1.5rem' }}>Sales & Business Reports</h1>

      {/* Report Cards Summary */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Gross Revenue Generated</div>
          <div className="stat-card-value" style={{ color: '#10b981' }}>
            ₹{stats ? stats.totalRevenue.toLocaleString('en-IN') : 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Processed Orders</div>
          <div className="stat-card-value">{stats ? stats.totalOrders : 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Fulfillment Rate</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>
            {stats && stats.totalOrders > 0 
              ? `${Math.round((stats.deliveredOrders / stats.totalOrders) * 100)}%` 
              : '100%'}
          </div>
        </div>
      </div>

      {/* Top Performing Products Report */}
      <div className="table-responsive" style={{ marginTop: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>⭐ Top Rated & Popular Products</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Reviews Count</th>
              <th>Price</th>
              <th>Stock Remaining</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((prod) => (
              <tr key={prod.id}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</td>
                <td>{prod.categoryName || 'N/A'}</td>
                <td style={{ fontWeight: 700, color: '#f59e0b' }}>⭐ {prod.rating ? prod.rating.toFixed(1) : '4.5'}</td>
                <td>{prod.reviewCount || 0} reviews</td>
                <td style={{ fontWeight: 700 }}>₹{prod.price ? prod.price.toLocaleString('en-IN') : 0}</td>
                <td style={{ fontWeight: 700 }}>{prod.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
