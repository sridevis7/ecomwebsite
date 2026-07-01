import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import { getAllSellers, approveSeller } from '../../services/adminApi';
import './AdminTable.css';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const loadSellers = () => {
    setLoading(true);
    getAllSellers()
      .then((res) => setSellers(res.data))
      .catch(() => toast.error('Could not load sellers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSellers(); }, []);

  const handleApprove = async (id, status) => {
    try {
      await approveSeller(id, status);
      toast.success(`Seller ${status}`);
      loadSellers();
    } catch (err) {
      toast.error('Could not update seller');
    }
  };

  const filtered = filter === 'all' ? sellers : sellers.filter((s) => s.approvalStatus === filter);

  return (
    <div className="admin-table-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Sellers</h1>
          <p className="admin-page-sub">{sellers.filter((s) => s.approvalStatus === 'pending').length} pending review</p>
        </div>
        <div className="admin-filter-tabs">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No sellers here</h3>
          <p>Nothing matches this filter right now.</p>
        </div>
      ) : (
        <div className="admin-card-list">
          {filtered.map((s) => (
            <div key={s._id} className="admin-seller-card">
              <div className="admin-seller-info">
                <strong>{s.shopName}</strong>
                <span>{s.userId?.name} · {s.userId?.email}</span>
                <span>{s.userId?.phone}</span>
                {s.shopDescription && <p>{s.shopDescription}</p>}
              </div>

              <div className="admin-seller-right">
                <span className={`tag ${s.approvalStatus === 'approved' ? 'tag-sage' : s.approvalStatus === 'rejected' ? 'tag-blush' : 'tag-butter'}`}>
                  {s.approvalStatus}
                </span>

                {s.approvalStatus === 'pending' && (
                  <div className="admin-seller-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(s._id, 'approved')}>
                      <FiCheck size={14} /> Approve
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleApprove(s._id, 'rejected')}>
                      <FiX size={14} /> Reject
                    </button>
                  </div>
                )}
                {s.approvalStatus === 'approved' && (
                  <button className="admin-text-action" onClick={() => handleApprove(s._id, 'rejected')}>Revoke access</button>
                )}
                {s.approvalStatus === 'rejected' && (
                  <button className="admin-text-action" onClick={() => handleApprove(s._id, 'approved')}>Approve anyway</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
