import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentPurchaseCard = ({
  item,
  onBuyAgain,
  onToggleWishlist,
  isWishlisted = false,
  loading = false,
}) => {
  const navigate = useNavigate();

  const {
    productId,
    productName,
    productImage,
    brand,
    categoryName,
    currentPrice,
    previousPrice,
    priceChanged,
    previousPurchaseDate,
    previousQuantity,
    stock,
    inStock,
    rating,
    reviewCount,
  } = item;

  const formattedDate = previousPurchaseDate
    ? new Date(previousPurchaseDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Earlier';

  const priceDiff = currentPrice - previousPrice;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Top badges: category & previous date */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          fontSize: '0.75rem',
        }}
      >
        <span
          style={{
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            padding: '2px 8px',
            borderRadius: '999px',
            fontWeight: 700,
          }}
        >
          {categoryName || brand || 'Retail'}
        </span>
        <span style={{ color: '#64748b' }}>Bought on {formattedDate}</span>
      </div>

      {/* Image and Wishlist button */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '170px',
          marginBottom: '0.85rem',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={productImage || 'https://via.placeholder.com/200'}
          alt={productName}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/products/${productId}`)}
        />

        {/* Wishlist toggle icon */}
        <button
          onClick={() => onToggleWishlist(item)}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Brand & Name */}
      {brand && (
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          {brand}
        </span>
      )}
      <h3
        style={{
          margin: '0.2rem 0 0.5rem',
          fontSize: '0.98rem',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: '1.35',
          cursor: 'pointer',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        onClick={() => navigate(`/products/${productId}`)}
      >
        {productName}
      </h3>

      {/* Ratings & Previously bought quantity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.65rem',
          fontSize: '0.82rem',
        }}
      >
        <span style={{ color: '#d97706', fontWeight: 700 }}>
          ⭐ {rating ? rating.toFixed(1) : '4.5'}
          {reviewCount ? ` (${reviewCount})` : ''}
        </span>
        <span style={{ color: '#64748b' }}>
          Previously bought: <strong>{previousQuantity} unit(s)</strong>
        </span>
      </div>

      {/* Price comparison section */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          padding: '0.65rem 0.85rem',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Current Price:</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb' }}>
              ₹{currentPrice ? currentPrice.toLocaleString('en-IN') : 0}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Previous Price:</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>
              ₹{previousPrice ? previousPrice.toLocaleString('en-IN') : 0}
            </span>
          </div>
        </div>

        {/* Price diff tag if changed */}
        {priceChanged && (
          <div style={{ marginTop: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: priceDiff > 0 ? '#fef3c7' : '#dcfce7',
                color: priceDiff > 0 ? '#92400e' : '#15803d',
              }}
            >
              {priceDiff > 0 ? `▲ Price went up by ₹${priceDiff}` : `▼ Price dropped by ₹${Math.abs(priceDiff)}`}
            </span>
          </div>
        )}
      </div>

      {/* Stock availability */}
      <div style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
        {inStock ? (
          <span style={{ color: '#16a34a', fontWeight: 600 }}>
            ✓ In Stock ({stock} units remaining)
          </span>
        ) : (
          <span style={{ color: '#ef4444', fontWeight: 700 }}>
            ✗ Currently Out of Stock
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => onBuyAgain(item)}
          disabled={!inStock || loading}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.55rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: !inStock || loading ? 'not-allowed' : 'pointer',
            opacity: !inStock ? 0.5 : 1,
          }}
        >
          {loading ? 'Adding...' : inStock ? '🔄 Buy Again' : 'Out of Stock'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <button
            onClick={() => navigate(`/products/${productId}`)}
            className="btn-outline"
            style={{ padding: '0.45rem', fontSize: '0.82rem' }}
          >
            View Product
          </button>
          <button
            onClick={() => onToggleWishlist(item)}
            className="btn-outline"
            style={{
              padding: '0.45rem',
              fontSize: '0.82rem',
              color: isWishlisted ? '#ef4444' : '#64748b',
              borderColor: isWishlisted ? '#fca5a5' : '#cbd5e1',
            }}
          >
            {isWishlisted ? 'Wishlisted ❤️' : '+ Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentPurchaseCard;
