import { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiBox, FiUserCheck, FiClock } from 'react-icons/fi';
import { getAdminDashboard } from '../../services/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  const maxRevenue = Math.max(...(stats?.monthlySales?.map((m) => m.revenue) || [1]), 1);

  return (
    <div className="admin-dash">
      <h1 className="admin-page-title">Platform overview</h1>
      <p className="admin-page-sub">A live snapshot of StyleHub across every seller and customer.</p>

      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-blush">
          <FiDollarSign size={20} />
          <span className="admin-stat-value">Rs. {(stats?.totalRevenue ?? 0).toLocaleString()}</span>
          <span className="admin-stat-label">Total revenue</span>
        </div>
        <div className="admin-stat-card stat-sage">
          <FiShoppingBag size={20} />
          <span className="admin-stat-value">{stats?.totalOrders ?? 0}</span>
          <span className="admin-stat-label">Total orders</span>
        </div>
        <div className="admin-stat-card stat-butter">
          <FiUsers size={20} />
          <span className="admin-stat-value">{stats?.totalCustomers ?? 0}</span>
          <span className="admin-stat-label">Customers</span>
        </div>
        <div className="admin-stat-card stat-plum">
          <FiUserCheck size={20} />
          <span className="admin-stat-value">{stats?.totalSellers ?? 0}</span>
          <span className="admin-stat-label">Approved sellers</span>
        </div>
      </div>

      {stats?.pendingSellers > 0 && (
        <a href="/admin/sellers" className="admin-pending-banner">
          <FiClock size={18} />
          <span><strong>{stats.pendingSellers} seller application{stats.pendingSellers !== 1 ? 's' : ''}</strong> waiting for your review</span>
        </a>
      )}

      <div className="admin-chart-card">
        <div className="admin-chart-head">
          <FiBox size={16} />
          <strong>Monthly revenue</strong>
        </div>
        {stats?.monthlySales?.length === 0 ? (
          <p style={{ padding: '20px 0' }}>No sales data yet.</p>
        ) : (
          <div className="admin-bar-chart">
            {stats?.monthlySales?.map((m, i) => (
              <div key={i} className="admin-bar-col">
                <div className="admin-bar" style={{ height: `${(m.revenue / maxRevenue) * 140}px` }} />
                <span className="admin-bar-label">{m._id.month}/{m._id.year}</span>
                <span className="admin-bar-value">Rs. {m.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
