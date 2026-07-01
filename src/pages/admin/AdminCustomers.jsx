import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSlash } from 'react-icons/fi';
import { getAllCustomers, banCustomer } from '../../services/adminApi';
import './AdminTable.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = () => {
    setLoading(true);
    getAllCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error('Could not load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleBan = async (id, name) => {
    if (!window.confirm(`Ban ${name}? They will not be able to use their account.`)) return;
    try {
      await banCustomer(id);
      toast.success('Customer banned');
      loadCustomers();
    } catch (err) {
      toast.error('Could not ban customer');
    }
  };

  return (
    <div className="admin-table-page">
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">{customers.length} registered customer{customers.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : customers.length === 0 ? (
        <div className="empty-state"><h3>No customers yet</h3></div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 0.8fr' }}>
            <span>Name</span><span>Email</span><span>Phone</span><span>Status</span><span>Actions</span>
          </div>
          {customers.map((c) => (
            <div key={c._id} className="admin-table-row" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 0.8fr' }}>
              <span>{c.name}</span>
              <span>{c.email}</span>
              <span>{c.phone || '—'}</span>
              <span>
                <span className={`tag ${c.isActive ? 'tag-sage' : 'tag-blush'}`}>{c.isActive ? 'Active' : 'Banned'}</span>
              </span>
              <div className="admin-table-actions">
                {c.isActive && (
                  <button onClick={() => handleBan(c._id, c.name)} className="danger" title="Ban">
                    <FiSlash size={14} /> Ban
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
