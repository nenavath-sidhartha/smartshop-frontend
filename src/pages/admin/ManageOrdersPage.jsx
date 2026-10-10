import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders(filterStatus === 'ALL' ? null : filterStatus);
      if (res.data) setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const toggleExpand = (id) => setExpandedOrderId(prev => (prev === id ? null : id));

  if (loading) return <Loading message="Loading customer orders..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="admin-title">Manage Orders</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
          >
            <option value="ALL">All Orders</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Shipping Address</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <React.Fragment key={ord.id}>
                <tr>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{ord.orderNumber}</td>
                  <td>
                    <span style={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>{ord.customerName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ord.customerEmail}</span>
                  </td>
                  <td style={{ maxWidth: '220px', fontSize: '0.85rem', color: '#475569' }}>{ord.shippingAddress}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>₹{ord.totalAmount ? ord.totalAmount.toLocaleString('en-IN') : 0}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>{ord.paymentMethod}</span>
                    <span style={{ fontSize: '0.75rem', color: ord.paymentStatus === 'PAID' ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${ord.orderStatus.toLowerCase().replace('_', '-')}`}>
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {ord.orderStatus !== 'CANCELLED' ? (
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 700 }}>Cancelled</span>
                    )}
                  </td>
                  <td>
                    {ord.orderStatus === 'CANCELLED' && (
                      <button
                        onClick={() => toggleExpand(ord.id)}
                        style={{
                          fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.65rem',
                          borderRadius: '6px', border: '1px solid #fca5a5',
                          backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer'
                        }}
                      >
                        {expandedOrderId === ord.id ? 'Hide' : 'View'} Reason
                      </button>
                    )}
                  </td>
                </tr>

                {/* Cancellation details row */}
                {expandedOrderId === ord.id && ord.orderStatus === 'CANCELLED' && (
                  <tr>
                    <td colSpan={8}>
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '0.9rem 1.25rem',
                        margin: '0 0 0.5rem',
                      }}>
                        <p style={{ margin: '0 0 0.3rem', fontSize: '0.88rem', color: '#7f1d1d' }}>
                          <strong>Cancellation Reason:</strong>{' '}
                          {ord.cancellationReason || <span style={{ color: '#94a3b8' }}>Not provided</span>}
                        </p>
                        {ord.cancellationNote && (
                          <p style={{ margin: '0 0 0.3rem', fontSize: '0.88rem', color: '#7f1d1d' }}>
                            <strong>Customer Note:</strong> {ord.cancellationNote}
                          </p>
                        )}
                        {ord.cancelledAt && (
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#7f1d1d' }}>
                            <strong>Cancelled At:</strong>{' '}
                            {new Date(ord.cancelledAt).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrdersPage;
