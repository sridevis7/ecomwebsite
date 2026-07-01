import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { getAdminCoupons, addCoupon, deleteCoupon } from '../../services/adminApi';
import './AdminTable.css';

const EMPTY = { code: '', discountType: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '' };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const loadCoupons = () => {
    setLoading(true);
    getAdminCoupons()
      .then((res) => setCoupons(res.data))
      .catch(() => toast.error('Could not load coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addCoupon(form);
      toast.success('Coupon created');
      setShowForm(false);
      setForm(EMPTY);
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (err) {
      toast.error('Could not delete coupon');
    }
  };

  return (
    <div className="admin-table-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-sub">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} created</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus size={16} /> New coupon</button>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : coupons.length === 0 ? (
        <div className="empty-state">
          <h3>No coupons yet</h3>
          <p>Create discount codes for customers to use at checkout.</p>
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => setShowForm(true)}><FiPlus size={16} /> New coupon</button>
        </div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 0.6fr' }}>
            <span>Code</span><span>Discount</span><span>Min order</span><span>Used / Max</span><span>Actions</span>
          </div>
          {coupons.map((c) => (
            <div key={c._id} className="admin-table-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 0.6fr' }}>
              <span><strong>{c.code}</strong></span>
              <span>{c.discountType === 'percent' ? `${c.value}%` : `Rs. ${c.value}`}</span>
              <span>Rs. {c.minOrder?.toLocaleString() || 0}</span>
              <span>{c.usedCount} / {c.maxUses}</span>
              <div className="admin-table-actions">
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
            <h2>Create coupon</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="code">Coupon code</label>
                <input id="code" name="code" value={form.code} onChange={handleChange} placeholder="SAVE20" required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="discountType">Discount type</label>
                  <select id="discountType" name="discountType" value={form.discountType} onChange={handleChange}>
                    <option value="percent">Percentage</option>
                    <option value="flat">Flat amount</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="value">Value</label>
                  <input id="value" name="value" type="number" value={form.value} onChange={handleChange} required />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="minOrder">Min order (Rs.)</label>
                  <input id="minOrder" name="minOrder" type="number" value={form.minOrder} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="maxUses">Max uses</label>
                  <input id="maxUses" name="maxUses" type="number" value={form.maxUses} onChange={handleChange} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="expiresAt">Expires on</label>
                <input id="expiresAt" name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
