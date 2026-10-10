import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products = [], onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No products found</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try clearing filters or changing your search query.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;
