import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { getAdminCategories, addCategory, updateCategory, deleteCategory } from '../../services/adminApi';
import './AdminTable.css';

const slugify = (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', image: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    getAdminCategories()
      .then((res) => setCategories(res.data))
      .catch(() => toast.error('Could not load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const openAdd = () => { setForm({ name: '', image: '' }); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ name: c.name, image: c.image || '' }); setEditingId(c._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success('Category updated');
      } else {
        await addCategory({ ...form, slug: slugify(form.name) });
        toast.success('Category added');
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error('Could not delete category');
    }
  };

  return (
    <div className="admin-table-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-sub">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> Add category</button>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories yet</h3>
          <p>Add categories like Men, Women, Kids so sellers can tag their products.</p>
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={openAdd}><FiPlus size={16} /> Add category</button>
        </div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr' }}>
            <span>Name</span><span>Slug</span><span>Actions</span>
          </div>
          {categories.map((c) => (
            <div key={c._id} className="admin-table-row" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr' }}>
              <span>{c.name}</span>
              <span>{c.slug}</span>
              <div className="admin-table-actions">
                <button onClick={() => openEdit(c)}><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(c._id)} className="danger"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowForm(false)}><FiX size={20} /></button>
            <h2>{editingId ? 'Edit category' : 'Add category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Women"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="image">Image URL (optional)</label>
                <input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
