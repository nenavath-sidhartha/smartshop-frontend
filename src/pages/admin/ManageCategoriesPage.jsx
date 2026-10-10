import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'ACTIVE'
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', image: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      status: cat.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  if (loading) return <Loading message="Loading categories..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="admin-title">Manage Categories</h1>
        <Button onClick={handleOpenAdd}>➕ Add New Category</Button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Products Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <img src={cat.image || 'https://via.placeholder.com/50'} alt={cat.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{cat.name}</td>
                <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#64748b' }}>{cat.description || 'N/A'}</td>
                <td style={{ fontWeight: 700 }}>{cat.productCount || 0}</td>
                <td>
                  <span className={`badge badge-${cat.status.toLowerCase()}`}>{cat.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenEdit(cat)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Edit</button>
                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit}>
          <Input label="Category Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Input label="Category Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            {editingId ? 'Update Category' : 'Create Category'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategoriesPage;
