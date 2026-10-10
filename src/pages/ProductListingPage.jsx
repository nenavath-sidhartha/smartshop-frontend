import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import ProductGrid from '../components/ProductGrid';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';

const ProductListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [maxPrice, setMaxPrice] = useState(60000);
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  const { addToCart } = useCart();

  // Fetch all categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Sync state from URL whenever URL changes (or categories become available)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTerm = urlParams.get('search') || '';
    const categoryName = urlParams.get('category') || '';

    setSearch(searchTerm);

    if (!categoryName) {
      // "All Products" — no category filter
      setSelectedCategory(null);
    } else if (categories.length > 0) {
      // Resolve category name → ID
      const matched = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      setSelectedCategory(matched ? matched.id : null);
    }
  }, [location.search, categories]);

  // Fetch products whenever any filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          maxPrice: maxPrice < 60000 ? maxPrice : undefined,
          sort: sortBy,
        };
        const res = await productService.getAllProducts(params);
        if (res.data) setProducts(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, selectedCategory, selectedBrand, maxPrice, sortBy]);

  // When sidebar category button is clicked, update the URL (keeps Navbar in sync)
  const handleSelectCategory = (catId) => {
    if (!catId) {
      navigate('/products');
    } else {
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        navigate(`/products?category=${encodeURIComponent(cat.name)}`);
      }
    }
  };

  // Derive a display title
  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const pageTitle = search
    ? `Search Results for "${search}"`
    : selectedCategoryName || 'All Products';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filter Sidebar */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          priceRange={maxPrice}
          onPriceChange={(val) => setMaxPrice(val)}
          selectedBrand={selectedBrand}
          onSelectBrand={(brand) => setSelectedBrand(brand)}
        />

        {/* Product Grid & Controls */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              padding: '1.25rem 1.5rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {pageTitle}
              </h2>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                Showing {products.length} products
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceasc">Price: Low to High</option>
                <option value="pricedesc">Price: High to Low</option>
                <option value="popularity">Popularity / Rating</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading message="Fetching products..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          ) : (
            <ProductGrid products={products} onAddToCart={(prod) => addToCart(prod.id, 1)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
