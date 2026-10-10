import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import ProductGrid from '../components/ProductGrid';
import CategoryCard from '../components/CategoryCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catRes, prodRes] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getAllProducts({ sort: 'popularity' })
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setFeaturedProducts(prodRes.data.slice(0, 8));
    } catch (err) {
      setError(err.message || 'Failed to load home page content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '4rem 0',
        borderRadius: '0 0 24px 24px',
        marginBottom: '3rem',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              🔥 Big Indian Festive Sale - Up to 60% OFF
            </span>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '1.25rem 0 1rem', lineHeight: 1.15 }}>
              Upgrade Your Style<br />
              <span style={{ color: '#f59e0b' }}>Shop the Latest Trends</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#e0e7ff', marginBottom: '2rem', maxWidth: '540px' }}>
              Discover top-rated Indian e-commerce electronics, fashion, wearables, home essentials, and lifestyle products with instant free shipping and easy 7-day returns.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/products" className="btn-primary" style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '0.9rem 2rem', fontSize: '1.05rem', fontWeight: 700 }}>
                Shop Now ➔
              </Link>
              <Link to="/products?sort=popularity" className="btn-outline" style={{ borderColor: '#ffffff', color: '#ffffff', padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Featured Deals
              </Link>
            </div>
          </div>

          <div style={{ flex: '0 0 380px', display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
              alt="SmartShop Featured Product"
              style={{
                width: '100%',
                maxHeight: '340px',
                objectFit: 'cover',
                borderRadius: '20px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                border: '4px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          </div>
        </div>
      </section>

      <div className="container">
        {loading ? (
          <Loading message="Loading SmartShop products..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchData} />
        ) : (
          <>
            {/* Category Section */}
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Shop By Category</h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Explore top categories handpicked for you</p>
                </div>
                <Link to="/products" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>
                  View All Categories ➔
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
                {categories.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            </section>

            {/* Featured Products Section */}
            <section style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Featured Products</h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Bestsellers with verified reviews and special discounts</p>
                </div>
                <Link to="/products" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>
                  Explore All Products ➔
                </Link>
              </div>

              <ProductGrid products={featuredProducts} onAddToCart={(prod) => addToCart(prod.id, 1)} />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
