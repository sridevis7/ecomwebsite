import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getMyOrders, requestReturn, getMyReturns } from '../services/api';
import './Returns.css';

const REASONS = ['Wrong size', 'Item damaged', 'Not as described', 'Changed my mind', 'Wrong item received', 'Other'];

const Returns = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ orderId: '', reason: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getMyOrders(), getMyReturns()])
      .then(([ordersRes, returnsRes]) => {
        // Only delivered orders can be returned
        setOrders(ordersRes.data.filter((o) => o.orderStatus === 'delivered'));
        setReturns(returnsRes.data);
      })
      .catch(() => toast.error('Could not load your orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestReturn(form);
      toast.success('Return request submitted');
      setForm({ orderId: '', reason: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;

  return (
    <div className="page-wrap returns-page">
      <div className="container">
        <h1 className="returns-title">Returns &amp; refunds</h1>
        <p className="returns-sub">Items can be returned within 7 days of delivery.</p>

        <div className="returns-layout">
          <div className="returns-form-card">
            <h3>Request a return</h3>

            {orders.length === 0 ? (
              <p style={{ marginTop: 8 }}>You don't have any delivered orders eligible for return yet.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="orderId">Select order</label>
                  <select
                    id="orderId"
                    value={form.orderId}
                    onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                    required
                  >
                    <option value="">Choose an order…</option>
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>
                        #{o._id.slice(-8).toUpperCase()} — Rs. {o.totalAmount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="reason">Reason</label>
                  <select
                    id="reason"
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    required
                  >
                    <option value="">Select a reason…</option>
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="description">Tell us more (optional)</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Any extra detail that helps us process this faster"
                  />
                </div>

                <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit return request'}
                </button>
              </form>
            )}
          </div>

          <div className="returns-history">
            <h3>Your return requests</h3>
            {returns.length === 0 ? (
              <div className="empty-state">
                <FiRefreshCw size={28} style={{ marginBottom: 10, color: 'var(--ink-soft)' }} />
                <p>No return requests yet.</p>
              </div>
            ) : (
              <div className="returns-list">
                {returns.map((r) => (
                  <div key={r._id} className="return-item">
                    <div>
                      <strong>Order #{r.orderId?._id?.slice(-8).toUpperCase() || '—'}</strong>
                      <span>{r.reason}</span>
                    </div>
                    <span className={`tag ${r.status === 'refunded' || r.status === 'approved' ? 'tag-sage' : r.status === 'rejected' ? 'tag-blush' : 'tag-butter'}`}>
                      {r.status === 'requested' && <FiClock size={11} style={{ marginRight: 4 }} />}
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
