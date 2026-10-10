import React, { useState } from 'react';

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Found a better price',
  'Delivery taking too long',
  'Changed my mind',
  'Product no longer required',
  'Other',
];

/**
 * Two-step cancellation modal:
 *  Step 1 – Confirm intent (shows order summary + Keep/Yes buttons)
 *  Step 2 – Select reason + optional note, then submit
 */
const CancelOrderModal = ({ isOpen, order, onClose, onConfirm, loading }) => {
  const [step, setStep] = useState(1); // 1 = confirm, 2 = reason
  const [selectedReason, setSelectedReason] = useState('');
  const [cancellationNote, setCancellationNote] = useState('');

  if (!isOpen || !order) return null;

  const handleKeepOrder = () => {
    setStep(1);
    setSelectedReason('');
    setCancellationNote('');
    onClose();
  };

  const handleProceedToReason = () => {
    setStep(2);
  };

  const handleSubmit = () => {
    onConfirm({
      cancellationReason: selectedReason || 'No reason provided',
      cancellationNote: cancellationNote.trim(),
    });
  };

  const firstItem = order.items && order.items[0];

  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: '1rem',
  };

  const modalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    maxWidth: '480px',
    width: '100%',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'fadeIn 0.18s ease',
  };

  return (
    <div style={overlayStyle} onClick={handleKeepOrder}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* ── Step 1: Confirm ── */}
        {step === 1 && (
          <>
            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#fef2f2', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem'
              }}>🚫</div>
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Cancel Order?
            </h3>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel this order?
            </p>

            {/* Order summary card */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Order ID</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{order.orderNumber}</span>
              </div>
              {firstItem && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Product</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', maxWidth: '240px', textAlign: 'right' }}>
                    {firstItem.productName}
                    {order.items.length > 1 && <span style={{ color: '#94a3b8' }}> +{order.items.length - 1} more</span>}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Amount</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>
                  ₹{order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 0}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleKeepOrder}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', backgroundColor: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  color: '#0f172a', transition: 'all 0.18s'
                }}
              >
                Keep Order
              </button>
              <button
                onClick={handleProceedToReason}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px',
                  border: 'none', backgroundColor: '#ef4444',
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  color: '#fff', transition: 'all 0.18s'
                }}
              >
                Yes, Cancel Order
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Select Reason ── */}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              Select a Cancellation Reason
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Help us understand why you're cancelling this order.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: selectedReason === reason ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    backgroundColor: selectedReason === reason ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: selectedReason === reason ? '#1d4ed8' : '#374151',
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {/* Optional freetext */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                Tell us more <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
              </label>
              <textarea
                value={cancellationNote}
                onChange={e => setCancellationNote(e.target.value)}
                placeholder="Any additional details..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', backgroundColor: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  color: '#0f172a', opacity: loading ? 0.6 : 1
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedReason}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px',
                  border: 'none', backgroundColor: loading || !selectedReason ? '#fca5a5' : '#ef4444',
                  fontWeight: 700, fontSize: '0.95rem',
                  cursor: loading || !selectedReason ? 'not-allowed' : 'pointer',
                  color: '#fff', transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Cancelling...
                  </>
                ) : 'Confirm Cancellation'}
              </button>
            </div>

            {!selectedReason && (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Please select a reason to continue
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CancelOrderModal;
