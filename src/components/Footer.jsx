import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🛒 SmartShop</h4>
            <p style={{ marginTop: '0.75rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
              SmartShop is India's leading online e-commerce platform for high-quality electronics, fashion, home decor, and lifestyle products with instant delivery and secure payments.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/profile">User Profile</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Electronics">Electronics</Link></li>
              <li><Link to="/products?category=Fashion">Fashion</Link></li>
              <li><Link to="/products?category=Home%20%26%20Living">Home & Living</Link></li>
              <li><Link to="/products?category=Beauty">Beauty</Link></li>
              <li><Link to="/products?category=Sports">Sports</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact & Support</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📍 MG Road, Bengaluru, Karnataka - 560001</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📞 +91 98765 43210</p>
            <p style={{ fontSize: '0.9rem' }}>✉️ support@smartshop.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SmartShop E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
