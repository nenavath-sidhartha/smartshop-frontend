import React from 'react';

const Sidebar = ({ categories = [], selectedCategory, onSelectCategory, priceRange, onPriceChange, selectedBrand, onSelectBrand }) => {
  const brands = ['FitPulse', 'SoundPro', 'TechCorp', 'LensCraft', 'UrbanFit'];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem'
    }}>
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', pb: '0.5rem' }}>
          📁 Categories
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: selectedCategory === null ? '#eff6ff' : 'transparent',
              color: selectedCategory === null ? '#2563eb' : '#475569',
              fontWeight: selectedCategory === null ? 700 : 500,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: selectedCategory === cat.id ? '#eff6ff' : 'transparent',
                color: selectedCategory === cat.id ? '#2563eb' : '#475569',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {cat.name} ({cat.productCount || 0})
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', pb: '0.5rem' }}>
          💰 Max Price: ₹{priceRange ? priceRange.toLocaleString('en-IN') : '60000'}
        </h4>
        <input
          type="range"
          min="500"
          max="60000"
          step="500"
          value={priceRange || 60000}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
          <span>₹500</span>
          <span>₹60,000</span>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', pb: '0.5rem' }}>
          🏷️ Brands
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => onSelectBrand(null)}
            style={{
              textAlign: 'left',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: selectedBrand === null ? '#eff6ff' : 'transparent',
              color: selectedBrand === null ? '#2563eb' : '#475569',
              fontWeight: selectedBrand === null ? 700 : 500,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              style={{
                textAlign: 'left',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: selectedBrand === brand ? '#eff6ff' : 'transparent',
                color: selectedBrand === brand ? '#2563eb' : '#475569',
                fontWeight: selectedBrand === brand ? 700 : 500,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
