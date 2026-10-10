import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SearchBar from './SearchBar';

const Header = ({ cartCount = 0, user, onLogout }) => {
  const navigate = useNavigate();

  const handleSearchSubmit = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-top">
          <Link to="/" className="brand-logo">
            🛒 Smart<span>Shop</span>
          </Link>

          <SearchBar onSearch={handleSearchSubmit} />

          <div className="header-actions">
            <Link to="/cart" className="header-btn">
              <span>🛒</span> Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to={user.role === 'ROLE_ADMIN' ? '/admin' : '/profile'} className="header-btn" style={{ backgroundColor: '#f1f5f9' }}>
                  👤 {user.fullName ? user.fullName.split(' ')[0] : 'Account'}
                  {user.role === 'ROLE_ADMIN' && <span style={{ fontSize: '0.7rem', background: '#6366f1', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>ADMIN</span>}
                </Link>
                <button onClick={onLogout} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Login / Register
              </Link>
            )}
          </div>
        </div>

        <Navbar />
      </div>
    </header>
  );
};

export default Header;
