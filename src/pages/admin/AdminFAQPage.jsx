import React, { useState, useEffect, useCallback } from 'react';
import { adminGetAllFAQs, adminCreateFAQ, adminUpdateFAQ, adminDeleteFAQ } from '../../services/faqService';

const CATEGORIES = ['GENERAL', 'ORDER', 'PAYMENT', 'DELIVERY', 'RETURN', 'REFUND', 'ACCOUNT', 'PRODUCT'];

const emptyForm = { question: '', answer: '', category: 'GENERAL', status: 'ACTIVE', sortOrder: 0 };

const AdminFAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetAllFAQs();
      setFaqs(Array.isArray(data) ? data : []);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFAQs(); }, [fetchFAQs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'sortOrder' ? Number(value) : value }));
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
      sortOrder: faq.sortOrder,
    });
    setShowForm(true);
    setError('');
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await adminUpdateFAQ(editingId, form);
      } else {
        await adminCreateFAQ(form);
      }
      setShowForm(false);
      setEditingId(null);
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await adminDeleteFAQ(id);
      fetchFAQs();
    } catch { /* ignore */ }
  };

  const filtered = faqs.filter(
    (f) =>
      !search ||
      f.question?.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-faq-page">
      <div className="admin-page-header">
        <h1>📚 Manage FAQs</h1>
        <button className="btn-primary" onClick={handleNew} id="btn-new-faq">
          + New FAQ
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-faq-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-faq-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit FAQ' : 'Create New FAQ'}</h2>
            {error && <div className="alert-error">{error}</div>}
            <form onSubmit={handleSave} id="faq-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={form.sortOrder}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Question *</label>
                <input
                  name="question"
                  type="text"
                  placeholder="e.g. How do I track my order?"
                  value={form.question}
                  onChange={handleChange}
                  id="faq-question-input"
                />
              </div>
              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  name="answer"
                  rows={4}
                  placeholder="Provide a clear and helpful answer…"
                  value={form.answer}
                  onChange={handleChange}
                  id="faq-answer-input"
                />
              </div>
              <div className="faq-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving} id="btn-save-faq">
                  {saving ? '⏳ Saving…' : '💾 Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="admin-faq-search-row">
        <input
          className="admin-search-input"
          placeholder="🔍 Search FAQs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="admin-faq-search"
        />
        <span className="faq-count">{filtered.length} FAQ{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* FAQ Table */}
      {loading ? (
        <div className="tickets-loading">Loading FAQs…</div>
      ) : filtered.length === 0 ? (
        <div className="tickets-empty">
          <span>📚</span>
          <p>No FAQs found. Create the first one!</p>
        </div>
      ) : (
        <div className="admin-faq-table-wrap">
          <table className="admin-faq-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Question</th>
                <th>Status</th>
                <th>Sort</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((faq, idx) => (
                <tr key={faq.id} id={`faq-row-${faq.id}`}>
                  <td>{idx + 1}</td>
                  <td><span className="faq-cat-badge">{faq.category}</span></td>
                  <td className="faq-question-cell" title={faq.question}>
                    {faq.question?.length > 70 ? faq.question.slice(0, 70) + '…' : faq.question}
                  </td>
                  <td>
                    <span className={`faq-status-badge ${faq.status?.toLowerCase()}`}>
                      {faq.status}
                    </span>
                  </td>
                  <td>{faq.sortOrder}</td>
                  <td className="faq-actions-cell">
                    <button
                      className="btn-edit-sm"
                      onClick={() => handleEdit(faq)}
                      id={`edit-faq-${faq.id}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete-sm"
                      onClick={() => handleDelete(faq.id)}
                      id={`delete-faq-${faq.id}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFAQPage;
