import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import Loading from '../../components/Loading';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      if (res.data) setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading message="Loading inventory status..." />;

  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return <span className="badge badge-cancelled">OUT OF STOCK</span>;
    } else if (stock <= threshold) {
      return <span className="badge badge-shipped">LOW STOCK ({stock})</span>;
    } else {
      return <span className="badge badge-delivered">IN STOCK ({stock})</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="admin-title">Inventory Control</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#ffffff', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Low Stock Alert Threshold:</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: '60px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, textAlign: 'center' }}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Current Stock</th>
              <th>Stock Level Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} style={{ backgroundColor: prod.stock <= threshold ? '#fff8f6' : 'transparent' }}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</td>
                <td>{prod.categoryName || 'N/A'}</td>
                <td style={{ fontWeight: 700 }}>₹{prod.price ? prod.price.toLocaleString('en-IN') : 0}</td>
                <td style={{ fontWeight: 800, fontSize: '1.1rem', color: prod.stock <= threshold ? '#ef4444' : '#0f172a' }}>
                  {prod.stock}
                </td>
                <td>{getStockStatus(prod.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
