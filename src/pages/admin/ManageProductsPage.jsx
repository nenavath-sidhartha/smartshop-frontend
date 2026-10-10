import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '0',
    stock: '10',
    brand: '',
    categoryId: '',
    image: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories()
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discount: '0',
      stock: '10',
      brand: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      image: '',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      discount: prod.discount || '0',
      stock: prod.stock || '0',
      brand: prod.brand || '',
      categoryId: prod.categoryId || '',
      image: prod.image || '',
      status: prod.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
        brand: formData.brand,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        image: formData.image,
        status: formData.status
      };

      if (editingId) {
        await productService.updateProduct(editingId, payload);
      } else {
        await productService.createProduct(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  if (loading) return <Loading message="Loading inventory products..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="admin-title">Manage Products</h1>
        <Button onClick={handleOpenAdd}>➕ Add New Product</Button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <img src={prod.image || 'https://via.placeholder.com/50'} alt={prod.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</td>
                <td>{prod.categoryName || 'N/A'}</td>
                <td>{prod.brand || 'N/A'}</td>
                <td style={{ fontWeight: 700 }}>₹{prod.price ? prod.price.toLocaleString('en-IN') : 0}</td>
                <td>
                  <span style={{ fontWeight: 700, color: prod.stock <= 5 ? '#ef4444' : '#0f172a' }}>
                    {prod.stock}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${prod.status.toLowerCase()}`}>{prod.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenEdit(prod)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Edit</button>
                    <button onClick={() => handleDelete(prod.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit}>
          <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Selling Price (₹)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <Input label="Original MRP (₹)" type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Discount (%)" type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
            <Input label="Stock Count" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
            <Input label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <Input label="Product Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />

          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            {editingId ? 'Update Product' : 'Create Product'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageProductsPage;
