import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  const { id, name, image, productCount } = category;

  return (
    <Link
      to={`/products?categoryId=${id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        textAlign: 'center',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = '#2563eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src={image || 'https://via.placeholder.com/80'} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{name}</h4>
      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{productCount ? `${productCount} Products` : 'Explore'}</span>
    </Link>
  );
};

export default CategoryCard;
