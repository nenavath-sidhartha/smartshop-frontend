import React from 'react';

// Statuses that allow customer-initiated cancellation
const CANCELLABLE_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING'];

const OrderCard = ({ order, onViewDetails, onCancelOrder, onReorder, onTrackOrder }) => {
  const { orderNumber, createdAt, orderStatus, totalAmount, items, paymentMethod } = order;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':      return <span className="badge badge-placed">Placed</span>;
      case 'CONFIRMED':   return <span className="badge badge-confirmed">Confirmed</span>;
      case 'PROCESSING':  return <span className="badge badge-processing">Processing</span>;
      case 'SHIPPED':     return <span className="badge badge-shipped">Shipped</span>;
      case 'OUT_FOR_DELIVERY': return <span className="badge" style={{ backgroundColor: '#ffedd5', color: '#c2410c', fontWeight: 700 }}>Out for Delivery 🚚</span>;
      case 'DELIVERED':   return <span className="badge badge-delivered">Delivered ✓</span>;
      case 'CANCELLED':   return <span className="badge badge-cancelled">Cancelled</span>;
      default:            return <span className="badge">{status}</span>;
    }
  };

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Recently';

  const isCancellable = CANCELLABLE_STATUSES.includes(orderStatus);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: orderStatus === 'CANCELLED' ? '1px solid #fecaca' : '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.25rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      opacity: orderStatus === 'CANCELLED' ? 0.85 : 1,
      transition: 'all 0.2s ease'
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Order ID: </span>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>{orderNumber}</span>
          <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>Placed on {formattedDate}</span>
        </div>
        <div>{getStatusBadge(orderStatus)}</div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {items && items.slice(0, 2).map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={item.productImage || 'https://via.placeholder.com/60'} alt={item.productName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
            <div style={{ flex: 1 }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.productName}</h5>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price ? item.price.toLocaleString('en-IN') : 0}</span>
            </div>
          </div>
        ))}
        {items && items.length > 2 && (
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>+ {items.length - 2} more item(s)</span>
        )}
      </div>

      {/* Cancellation info strip */}
      {orderStatus === 'CANCELLED' && order.cancellationReason && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '0.6rem 0.9rem',
          marginBottom: '0.75rem',
          fontSize: '0.82rem',
          color: '#b91c1c'
        }}>
          <strong>Cancelled:</strong> {order.cancellationReason}
          {order.cancellationNote && <span style={{ color: '#991b1b' }}> — "{order.cancellationNote}"</span>}
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Payment: {paymentMethod}</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Total: ₹{totalAmount ? totalAmount.toLocaleString('en-IN') : 0}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order)}
              className="btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              View Details
            </button>
          )}

          {/* Track Order button */}
          {orderStatus !== 'CANCELLED' && onTrackOrder && (
            <button
              onClick={() => onTrackOrder(order)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1.5px solid #0284c7',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.18s ease'
              }}
            >
              📍 Track Order
            </button>
          )}

          {/* Reorder button */}
          {onReorder && (
            <button
              onClick={() => onReorder(order)}
              className="btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            >
              🔄 Reorder
            </button>
          )}

          {/* Cancel button */}
          {isCancellable && onCancelOrder && (
            <button
              onClick={() => onCancelOrder(order)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1.5px solid #ef4444',
                backgroundColor: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={e => { e.target.style.backgroundColor = '#ef4444'; e.target.style.color = '#fff'; }}
              onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ef4444'; }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
