import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const { id, name, price, originalPrice, discount, image, categoryName, rating, reviewCount, stock } = product;

  return (
    <div className="product-card">
      <Link to={`/products/${id}`} className="product-card-img-wrap">
        <img src={image || 'https://via.placeholder.com/300x300?text=Product'} alt={name} className="product-card-img" />
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
      </Link>

      <div className="product-card-body">
        <span className="product-category-tag">{categoryName || 'General'}</span>
        <Link to={`/products/${id}`} className="product-title">
          {name}
        </Link>

        <div className="product-rating">
          <span>⭐ {rating ? rating.toFixed(1) : '4.5'}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({reviewCount || 0})</span>
        </div>

        <div className="product-price-row">
          <span className="product-price">₹{price ? price.toLocaleString('en-IN') : '0'}</span>
          {originalPrice && originalPrice > price && (
            <span className="product-original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <button
          className="btn-add-cart"
          onClick={() => onAddToCart && onAddToCart(product)}
          disabled={stock <= 0}
          style={{ opacity: stock <= 0 ? 0.6 : 1, cursor: stock <= 0 ? 'not-allowed' : 'pointer' }}
        >
          {stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
