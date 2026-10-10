import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import OrderCard from '../components/OrderCard';
import ReorderModal from '../components/ReorderModal';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import CancelOrderModal from '../components/CancelOrderModal';
import Toast from '../components/Toast';

const MyOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Reorder modal
  const [reorderOrderId, setReorderOrderId] = useState(null);

  // View Details modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancel Order modal
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast({ message: '', type: 'success' });

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await orderService.getUserOrders(user.id, activeTab === 'ALL' ? null : activeTab);
      if (res.data) setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Cancel order handler ──────────────────────────────────────────────────
  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
  };

  const handleCancelConfirm = async ({ cancellationReason, cancellationNote }) => {
    if (!orderToCancel || !user) return;
    setCancelling(true);
    try {
      const res = await orderService.cancelOrder(orderToCancel.id, {
        userId: user.id,
        cancellationReason,
        cancellationNote,
      });

      if (res.data) {
        const updatedOrder = res.data;

        // Update the order in local state without a full page reload
        setOrders(prev =>
          prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
        );

        // If viewing details for the cancelled order, sync it
        if (selectedOrder && selectedOrder.id === updatedOrder.id) {
          setSelectedOrder(updatedOrder);
        }

        // Build success message with payment-aware refund note
        const isCOD = updatedOrder.paymentMethod === 'CASH_ON_DELIVERY';
        const refundNote = isCOD
          ? 'Cancellation confirmed. No payment is required.'
          : 'Refund will be processed according to your payment method.';

        showToast(
          `Order ${updatedOrder.orderNumber} has been cancelled successfully. ${refundNote}`,
          'success'
        );
      }

      setOrderToCancel(null);
    } catch (err) {
      showToast(err.message || 'Unable to cancel this order. Please try again.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelModalClose = () => {
    if (!cancelling) setOrderToCancel(null);
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>My Orders</h1>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px 10px 0 0',
              fontWeight: 700,
              fontSize: '0.95rem',
              backgroundColor: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              border: activeTab === tab.key ? '1px solid #e2e8f0' : 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Order list ── */}
      {loading ? (
        <Loading message="Fetching your orders..." />
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No orders found</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You don't have any orders in this category.</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={(ord) => setSelectedOrder(ord)}
              onCancelOrder={handleCancelOrder}
              onReorder={(ord) => setReorderOrderId(ord.id)}
              onTrackOrder={(ord) => navigate(`/orders/${ord.id}/track`)}
            />
          ))}
        </div>
      )}

      {/* ── View Details Modal ── */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div>
            {/* Meta */}
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                Placed on: <strong>{new Date(selectedOrder.createdAt).toLocaleString()}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Shipping Address: <strong>{selectedOrder.shippingAddress}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Payment: <strong>{selectedOrder.paymentMethod}</strong>
                {' · '}
                <span style={{ color: selectedOrder.paymentStatus === 'PAID' ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                  {selectedOrder.paymentStatus}
                </span>
              </p>
              <p style={{ margin: '0.4rem 0 0' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#64748b' }}>Status: </span>
                <StatusChip status={selectedOrder.orderStatus} />
              </p>
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Items Ordered</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {selectedOrder.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
                  <img
                    src={item.productImage || 'https://via.placeholder.com/60'}
                    alt={item.productName}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{item.productName}</h5>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span style={{ fontWeight: 800 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total ({selectedOrder.paymentMethod}):</span>
              <span style={{ color: '#2563eb' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Cancellation info (shown if cancelled) */}
            {selectedOrder.orderStatus === 'CANCELLED' && (
              <div style={{
                marginTop: '1.25rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '1rem',
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b91c1c', margin: '0 0 0.5rem' }}>
                  Cancellation Information
                </h4>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', color: '#7f1d1d' }}>
                  <strong>Reason:</strong> {selectedOrder.cancellationReason || 'Not specified'}
                </p>
                {selectedOrder.cancellationNote && (
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', color: '#7f1d1d' }}>
                    <strong>Note:</strong> {selectedOrder.cancellationNote}
                  </p>
                )}
                {selectedOrder.cancelledAt && (
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#7f1d1d' }}>
                    <strong>Cancelled On:</strong>{' '}
                    {new Date(selectedOrder.cancelledAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
                {/* Payment/refund note */}
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#374151', fontStyle: 'italic' }}>
                  {selectedOrder.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Cancellation confirmed. No payment is required.'
                    : 'Refund will be processed according to your payment method.'}
                </p>
              </div>
            )}
            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              {selectedOrder.orderStatus !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    const id = selectedOrder.id;
                    setSelectedOrder(null);
                    navigate(`/orders/${id}/track`);
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.55rem' }}
                >
                  📍 Track on Map
                </button>
              )}
              <button
                onClick={() => {
                  const id = selectedOrder.id;
                  setSelectedOrder(null);
                  setReorderOrderId(id);
                }}
                className="btn-outline"
                style={{ flex: 1, padding: '0.55rem' }}
              >
                🔄 Reorder Items
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reorder Modal ── */}
      <ReorderModal
        isOpen={!!reorderOrderId}
        orderId={reorderOrderId}
        onClose={() => setReorderOrderId(null)}
        onToast={showToast}
      />

      {/* ── Cancel Order Modal ── */}
      <CancelOrderModal
        isOpen={!!orderToCancel}
        order={orderToCancel}
        onClose={handleCancelModalClose}
        onConfirm={handleCancelConfirm}
        loading={cancelling}
      />

      {/* ── Toast ── */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

// Small helper: inline status chip used in the details modal
const StatusChip = ({ status }) => {
  const map = {
    PLACED: { label: 'Placed', color: '#1d4ed8', bg: '#eff6ff' },
    CONFIRMED: { label: 'Confirmed', color: '#0e7490', bg: '#ecfeff' },
    PROCESSING: { label: 'Processing', color: '#d97706', bg: '#fffbeb' },
    SHIPPED: { label: 'Shipped', color: '#7c3aed', bg: '#f5f3ff' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#ea580c', bg: '#fff7ed' },
    DELIVERED: { label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
    CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
  };
  const s = map[status] || { label: status, color: '#374151', bg: '#f3f4f6' };
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      fontWeight: 700,
      fontSize: '0.82rem',
      padding: '0.2rem 0.65rem',
      borderRadius: '999px',
      display: 'inline-block',
    }}>
      {s.label}
    </span>
  );
};

export default MyOrdersPage;
