import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminReturns, updateAdminReturn } from '../../services/adminApi';
import './AdminTable.css';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReturns = () => {
    setLoading(true);
    getAdminReturns()
      .then((res) => setReturns(res.data))
      .catch(() => toast.error('Could not load return requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReturns(); }, []);

  const handleUpdate = async (id, status) => {
    try {
      await updateAdminReturn(id, { status });
      toast.success(`Return ${status}`);
      loadReturns();
    } catch (err) {
      toast.error('Could not update return');
    }
  };

  return (
    <div className="admin-table-page">
      <h1 className="admin-page-title">Returns &amp; refunds</h1>
      <p className="admin-page-sub">{returns.length} request{returns.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : returns.length === 0 ? (
        <div className="empty-state"><h3>No return requests</h3><p>Customer return requests will show up here.</p></div>
      ) : (
        <div className="admin-card-list">
          {returns.map((r) => (
            <div key={r._id} className="admin-seller-card">
              <div className="admin-seller-info">
                <strong>Order #{r.orderId?._id?.slice(-8).toUpperCase() || '—'}</strong>
                <span>{r.userId?.name} · {r.userId?.email}</span>
                <span>Reason: {r.reason}</span>
                {r.description && <p>{r.description}</p>}
              </div>

              <div className="admin-seller-right">
                <span className={`tag ${r.status === 'approved' || r.status === 'refunded' ? 'tag-sage' : r.status === 'rejected' ? 'tag-blush' : 'tag-butter'}`}>
                  {r.status}
                </span>

                {r.status === 'requested' && (
                  <div className="admin-seller-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(r._id, 'approved')}>Approve</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleUpdate(r._id, 'rejected')}>Reject</button>
                  </div>
                )}
                {r.status === 'approved' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(r._id, 'refunded')}>Mark refunded</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
