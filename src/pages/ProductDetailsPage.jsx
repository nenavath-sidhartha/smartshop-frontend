import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProductById(id);
      if (res.data) setProduct(res.data);
    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (product) {
      const success = await addToCart(product.id, quantity);
      if (success) {
        alert(`${quantity} unit(s) of "${product.name}" added to cart!`);
      }
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      const success = await addToCart(product.id, quantity);
      if (success) {
        navigate('/cart');
      }
    }
  };

  if (loading) return <Loading message="Loading product details..." />;
  if (error) return <div className="container" style={{ padding: '3rem' }}><ErrorMessage message={error} onRetry={fetchProduct} /></div>;
  if (!product) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '2.5rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 450px) 1fr',
        gap: '3rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Product Image Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '100%',
            height: '400px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img
              src={product.image || 'https://via.placeholder.com/400'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.discount > 0 && (
              <span className="discount-badge" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', top: '15px', left: '15px' }}>
                {product.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Product Information Section */}
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {product.categoryName || 'General'} • {product.brand || 'SmartShop'}
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 1rem', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.9rem' }}>
              ⭐ {product.rating ? product.rating.toFixed(1) : '4.5'} / 5.0
            </span>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
              {product.reviewCount || 0} verified customer reviews
            </span>
            <span style={{
              color: product.stock > 0 ? '#16a34a' : '#dc2626',
              backgroundColor: product.stock > 0 ? '#dcfce7' : '#fee2e2',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem'
            }}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', pb: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>
              ₹{product.price ? product.price.toLocaleString('en-IN') : 0}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ fontSize: '1.25rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span style={{ fontSize: '0.95rem', color: '#16a34a', fontWeight: 700 }}>
              Save ₹{((product.originalPrice || product.price) - product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Description</h4>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {product.description || 'High-quality official product backed by SmartShop brand warranty and satisfaction guarantee.'}
            </p>
          </div>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Quantity:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ padding: '0.5rem 1.25rem', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary"
              style={{ flex: 1, padding: '1rem', fontSize: '1.05rem', fontWeight: 700 }}
            >
              🛒 Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Trust Guarantees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            textAlign: 'center'
          }}>
            <div>
              <span style={{ fontSize: '1.5rem', display: 'block' }}>🚚</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Free Delivery</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>On orders above ₹1,000</span>
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', display: 'block' }}>🔄</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>7 Days Return</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Hassle free replacement</span>
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', display: 'block' }}>🔒</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Secure Payment</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>UPI, Cards & COD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
