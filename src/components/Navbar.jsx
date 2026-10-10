import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');
  const isProductsPath = location.pathname === '/products';

  const navLinkClass = (isActive) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <nav className="nav-bar">
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products"
            end
            className={isProductsPath && !currentCategory ? 'nav-link active' : 'nav-link'}
          >
            All Products
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products?category=Electronics"
            className={isProductsPath && currentCategory === 'Electronics' ? 'nav-link active' : 'nav-link'}
          >
            Electronics
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products?category=Fashion"
            className={isProductsPath && currentCategory === 'Fashion' ? 'nav-link active' : 'nav-link'}
          >
            Fashion
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products?category=Home%20%26%20Living"
            className={isProductsPath && currentCategory === 'Home & Living' ? 'nav-link active' : 'nav-link'}
          >
            Home & Living
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className={({ isActive }) => navLinkClass(isActive)}>
            My Orders
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
