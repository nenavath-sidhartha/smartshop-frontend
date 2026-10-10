import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import Loading from '../components/Loading';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <Loading message="Updating shopping cart..." />;

  const items = cart.items || [];
  const subtotal = cart.subtotal || 0;
  const deliveryFee = cart.deliveryFee || 0;
  const total = cart.total || 0;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '4rem 2rem',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
            Start Shopping ➔
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>{items.length} Item(s) in your cart</span>
            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          <Link to="/products" style={{ display: 'inline-block', marginTop: '1rem', color: '#2563eb', fontWeight: 700 }}>
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary Box */}
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
            Order Summary
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
            <span>Delivery Fee</span>
            <span style={{ fontWeight: 700, color: deliveryFee === 0 ? '#16a34a' : '#0f172a' }}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>

          {subtotal < 1000 && (
            <p style={{ fontSize: '0.8rem', color: '#d97706', backgroundColor: '#fef3c7', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem' }}>
              💡 Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for FREE delivery!
            </p>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            marginTop: '1rem',
            borderTop: '2px solid #f1f5f9',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '1.5rem'
          }}>
            <span>Total Amount</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: 700 }}
          >
            Proceed to Checkout ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
