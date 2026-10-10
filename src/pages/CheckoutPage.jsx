import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Input from '../components/Input';
import Loading from '../components/Loading';

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? user.fullName || '' : '',
    phoneNumber: user ? user.phoneNumber || '' : '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const items = cart.items || [];
  const total = cart.total || 0;

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to complete your order.');
      navigate('/login');
      return;
    }

    if (!shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    const fullAddress = `${shippingAddress.fullName} (${shippingAddress.phoneNumber}), ${shippingAddress.addressLine}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`;

    try {
      setSubmitting(true);
      setError(null);
      const res = await orderService.placeOrder({
        userId: user.id,
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod
      });

      if (res.data) {
        await fetchCart();
        navigate(`/order-confirmation/${res.data.orderNumber}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Checkout</h1>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Address & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Shipping Address */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', pb: '0.75rem' }}>
              📍 1. Shipping Address
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Full Name"
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={shippingAddress.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <Input
              label="Street Address / House No / Flat"
              name="addressLine"
              value={shippingAddress.addressLine}
              onChange={handleInputChange}
              placeholder="e.g. Flat 302, Green Valley Apartments"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input
                label="City"
                name="city"
                value={shippingAddress.city}
                onChange={handleInputChange}
                required
              />
              <Input
                label="State"
                name="state"
                value={shippingAddress.state}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Pincode"
                name="pincode"
                value={shippingAddress.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', pb: '0.75rem' }}>
              💳 2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                border: paymentMethod === 'CASH_ON_DELIVERY' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'CASH_ON_DELIVERY' ? '#eff6ff' : '#ffffff'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <span style={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>💵 Cash on Delivery (COD)</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Pay in cash upon physical delivery at your doorstep</span>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                border: paymentMethod === 'UPI' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'UPI' ? '#eff6ff' : '#ffffff'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <span style={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>📱 Instant UPI Payment</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Google Pay, PhonePe, Paytm, BHIM UPI</span>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                border: paymentMethod === 'CARD' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'CARD' ? '#eff6ff' : '#ffffff'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <span style={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>💳 Credit / Debit Card</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Visa, MasterCard, RuPay, Maestro</span>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                border: paymentMethod === 'NET_BANKING' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'NET_BANKING' ? '#eff6ff' : '#ffffff'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="NET_BANKING"
                  checked={paymentMethod === 'NET_BANKING'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <span style={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>🏦 Net Banking</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>All major Indian nationalized and private banks</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: '90px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', pb: '0.75rem' }}>
            Order Items ({items.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>{item.quantity} × {item.productName}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Total Payable</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: 700, backgroundColor: '#16a34a' }}
          >
            {submitting ? 'Placing Order...' : '🚀 Place Order Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
