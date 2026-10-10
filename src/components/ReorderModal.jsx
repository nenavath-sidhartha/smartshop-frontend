import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useCart } from '../context/CartContext';
import Modal from './Modal';
import Loading from './Loading';

const ReorderModal = ({ isOpen, orderId, onClose, onToast }) => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [summary, setSummary] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && orderId) {
      loadReorderSummary();
    } else {
      setSummary(null);
      setQuantities({});
      setError(null);
    }
  }, [isOpen, orderId]);

  const loadReorderSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getReorderSummary(orderId);
      if (res.data) {
        setSummary(res.data);
        const initialQty = {};
        res.data.items.forEach((item) => {
          if (item.inStock && !item.discontinued) {
            initialQty[item.productId] = Math.min(item.quantity, item.availableStock);
          }
        });
        setQuantities(initialQty);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reorder information.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, newQty, maxStock) => {
    const val = Math.max(1, Math.min(Number(newQty), maxStock));
    setQuantities((prev) => ({ ...prev, [productId]: val }));
  };

  const calculateSubtotal = () => {
    if (!summary || !summary.items) return 0;
    return summary.items.reduce((sum, item) => {
      if (item.inStock && !item.discontinued && quantities[item.productId]) {
        return sum + item.currentPrice * quantities[item.productId];
      }
      return sum;
    }, 0);
  };

  const handleAddToCart = async (proceedToCheckout = false) => {
    if (!orderId) return;
    setSubmitting(true);
    try {
      const payload = { itemQuantities: quantities };
      const res = await orderService.reorder(orderId, payload);
      await fetchCart();

      if (onToast) {
        onToast(
          res.data?.priceChangeMessage ||
            'Available items added to your cart successfully!',
          'success'
        );
      }

      onClose();

      if (proceedToCheckout) {
        navigate('/checkout');
      } else {
        navigate('/cart');
      }
    } catch (err) {
      if (onToast) {
        onToast(err.message || 'Failed to add items to cart.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reorder Items • Order #${summary?.orderNumber || ''}`}
    >
      {loading ? (
        <Loading message="Checking current prices and inventory availability..." />
      ) : error ? (
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
          <button onClick={loadReorderSummary} className="btn-outline" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      ) : summary ? (
        <div>
          {/* Price Difference Alert */}
          {summary.hasPriceChanges && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.88rem',
                color: '#92400e',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Notice:</strong> Some prices have been updated since your previous order. Current prices are shown below.
              </div>
            </div>
          )}

          {/* Out of stock note */}
          {summary.unavailableItemsCount > 0 && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.88rem',
                color: '#b91c1c',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
              <div>
                {summary.unavailableItemsCount} item(s) are currently out of stock or discontinued and cannot be added.
              </div>
            </div>
          )}

          {/* Product Items List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              maxHeight: '360px',
              overflowY: 'auto',
              paddingRight: '0.35rem',
              marginBottom: '1.25rem',
            }}
          >
            {summary.items.map((item) => {
              const isAvailable = item.inStock && !item.discontinued;
              const hasDiff = item.priceChanged;
              const diffAmount = item.currentPrice - item.previousPrice;

              return (
                <div
                  key={item.productId || item.productName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: isAvailable ? '1px solid #e2e8f0' : '1px solid #fee2e2',
                    backgroundColor: isAvailable ? '#ffffff' : '#fef2f2',
                    opacity: isAvailable ? 1 : 0.75,
                  }}
                >
                  <img
                    src={item.productImage || 'https://via.placeholder.com/60'}
                    alt={item.productName}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '240px',
                        }}
                      >
                        {item.productName}
                      </h4>
                      {item.brand && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {item.brand}
                        </span>
                      )}
                    </div>

                    {/* Price and diff */}
                    <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>
                        ₹{item.currentPrice.toLocaleString('en-IN')}
                      </span>

                      {hasDiff && (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: diffAmount > 0 ? '#fef3c7' : '#dcfce7',
                            color: diffAmount > 0 ? '#92400e' : '#15803d',
                            fontWeight: 700,
                          }}
                        >
                          {diffAmount > 0 ? `+₹${diffAmount}` : `-₹${Math.abs(diffAmount)}`} from previous (₹{item.previousPrice})
                        </span>
                      )}

                      {!hasDiff && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          (Same as last purchase)
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div style={{ marginTop: '0.25rem' }}>
                      {item.discontinued ? (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                          Discontinued product
                        </span>
                      ) : !item.inStock ? (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                          Sorry, this product is currently out of stock.
                        </span>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                          ✓ In Stock ({item.availableStock} available)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  {isAvailable && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={quantities[item.productId] || 1}
                        onChange={(e) =>
                          handleQuantityChange(item.productId, e.target.value, item.availableStock)
                        }
                        style={{
                          width: '56px',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          border: '1.5px solid #cbd5e1',
                          fontWeight: 700,
                          textAlign: 'center',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Subtotal and Actions */}
          <div
            style={{
              borderTop: '2px solid #f1f5f9',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>
                Eligible Items Subtotal:
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                ₹{calculateSubtotal().toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={onClose}
                className="btn-outline"
                style={{ padding: '0.55rem 1rem', fontSize: '0.88rem' }}
                disabled={submitting}
              >
                Continue Shopping
              </button>

              <button
                onClick={() => handleAddToCart(false)}
                disabled={submitting || calculateSubtotal() === 0}
                style={{
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  cursor: submitting || calculateSubtotal() === 0 ? 'not-allowed' : 'pointer',
                  opacity: submitting || calculateSubtotal() === 0 ? 0.6 : 1,
                }}
              >
                {submitting ? 'Adding...' : '🛒 Add to Cart'}
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={submitting || calculateSubtotal() === 0}
                className="btn-primary"
                style={{
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.88rem',
                  cursor: submitting || calculateSubtotal() === 0 ? 'not-allowed' : 'pointer',
                  opacity: submitting || calculateSubtotal() === 0 ? 0.6 : 1,
                }}
              >
                {submitting ? 'Preparing...' : '⚡ Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ReorderModal;
