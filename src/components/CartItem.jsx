import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { id, productName, price, image, quantity, itemTotal } = item;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '1rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
        <img
          src={image || 'https://via.placeholder.com/80'}
          alt={productName}
          style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f1f5f9' }}
        />
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{productName}</h4>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>₹{price ? price.toLocaleString('en-IN') : 0} each</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onUpdateQuantity(id, quantity - 1)}
          className="btn-outline"
          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
        >
          -
        </button>
        <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{quantity}</span>
        <button
          onClick={() => onUpdateQuantity(id, quantity + 1)}
          className="btn-outline"
          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
        >
          +
        </button>
      </div>

      <div style={{ textAlign: 'right', minWidth: '100px' }}>
        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
          ₹{itemTotal ? itemTotal.toLocaleString('en-IN') : 0}
        </span>
        <button
          onClick={() => onRemove(id)}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
