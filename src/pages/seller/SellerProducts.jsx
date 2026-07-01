import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getSellerProducts,
  addSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  restockSellerProduct,
} from '../../services/sellerApi';
import { getCategories } from '../../services/api';
import './SellerProducts.css';

const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '',
  category: '', brand: '', sizes: '', colors: '', stock: '', tags: '',
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    getSellerProducts()
      .then((res) => setProducts(res.data))
      .catch(() => toast.error('Could not load your products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setImages([]);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice || '',
      category: p.category?._id || p.category || '',
      brand: p.brand || '',
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      stock: p.stock,
      tags: p.tags?.join(', ') || '',
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateSellerProduct(editingId, {
          ...form,
          sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
          colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        });
        toast.success('Product updated');
      } else {
        const data = new FormData();
        Object.entries(form).forEach(([key, val]) => data.append(key, val));
        images.forEach((img) => data.append('images', img));
        await addSellerProduct(data);
        toast.success('Product added');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteSellerProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Could not delete product');
    }
  };

  const handleRestock = async (id) => {
    const stock = window.prompt('New stock quantity:');
    if (stock === null || stock === '') return;
    try {
      const res = await restockSellerProduct(id, Number(stock));
      toast.success(
        res.data.notifiedCount > 0
          ? `Stock updated — ${res.data.notifiedCount} customer(s) notified by email`
          : 'Stock updated'
      );
      loadProducts();
    } catch (err) {
      toast.error('Could not update stock');
    }
  };

  return (
    <div className="seller-products-page">
      <div className="seller-page-head">
        <div>
          <h1 className="seller-page-title">Products</h1>
          <p className="seller-page-sub">{products.length} item{products.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <FiPlus size={16} /> Add product
        </button>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first item to start selling on StyleHub.</p>
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={openAddForm}>
            <FiPlus size={16} /> Add product
          </button>
        </div>
      ) : (
        <div className="seller-products-table">
          <div className="seller-table-row seller-table-head">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Sold</span>
            <span>Actions</span>
          </div>
          {products.map((p) => (
            <div key={p._id} className="seller-table-row">
              <div className="seller-table-product">
                <img src={p.images?.[0] || 'https://placehold.co/56x70/F2EDE3/6B6470?text=SH'} alt={p.name} />
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.category?.name || 'Uncategorized'}</span>
                </div>
              </div>
              <span>Rs. {p.price.toLocaleString()}</span>
              <span>
                {p.stock === 0 ? (
                  <span className="tag tag-blush">Out of stock</span>
                ) : p.stock < 5 ? (
                  <span className="tag tag-butter">{p.stock} left</span>
                ) : (
                  p.stock
                )}
              </span>
              <span>{p.sold || 0}</span>
              <div className="seller-table-actions">
                <button onClick={() => handleRestock(p._id)} title="Update stock">Restock</button>
                <button onClick={() => openEditForm(p)} title="Edit"><FiEdit2 size={15} /></button>
                <button onClick={() => handleDelete(p._id)} title="Delete" className="danger"><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="seller-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="seller-modal" onClick={(e) => e.stopPropagation()}>
            <button className="seller-modal-close" onClick={() => setShowForm(false)}><FiX size={20} /></button>
            <h2>{editingId ? 'Edit product' : 'Add a new product'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Product name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} required />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="price">Price (Rs.)</label>
                  <input id="price" name="price" type="number" value={form.price} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="discountPrice">Sale price (optional)</label>
                  <input id="discountPrice" name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select…</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="brand">Brand (optional)</label>
                  <input id="brand" name="brand" value={form.brand} onChange={handleChange} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="sizes">Sizes (comma separated)</label>
                  <input id="sizes" name="sizes" placeholder="S, M, L, XL" value={form.sizes} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="colors">Colors (comma separated)</label>
                  <input id="colors" name="colors" placeholder="Black, White" value={form.colors} onChange={handleChange} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="stock">Stock quantity</label>
                <input id="stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
              </div>

              <div className="field">
                <label htmlFor="tags">Tags (comma separated, helps with search)</label>
                <input id="tags" name="tags" placeholder="summer, cotton, casual" value={form.tags} onChange={handleChange} />
              </div>

              {!editingId && (
                <div className="field">
                  <label htmlFor="images">Product images</label>
                  <label className="seller-upload-box">
                    <FiUpload size={18} />
                    <span>{images.length > 0 ? `${images.length} image(s) selected` : 'Click to upload images'}</span>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImages(Array.from(e.target.files))}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}

              <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
