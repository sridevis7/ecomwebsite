import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiDollarSign, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { getSellerDashboard } from '../../services/sellerApi';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerDashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div className="seller-dash">
      <h1 className="seller-page-title">Dashboard</h1>
      <p className="seller-page-sub">A quick look at how your shop is doing.</p>

      <div className="seller-stats-grid">
        <div className="seller-stat-card stat-blush">
          <FiBox size={20} />
          <span className="seller-stat-value">{stats?.totalProducts ?? 0}</span>
          <span className="seller-stat-label">Products listed</span>
        </div>
        <div className="seller-stat-card stat-sage">
          <FiShoppingBag size={20} />
          <span className="seller-stat-value">{stats?.totalOrders ?? 0}</span>
          <span className="seller-stat-label">Total orders</span>
        </div>
        <div className="seller-stat-card stat-butter">
          <FiDollarSign size={20} />
          <span className="seller-stat-value">Rs. {(stats?.totalRevenue ?? 0).toLocaleString()}</span>
          <span className="seller-stat-label">Total revenue</span>
        </div>
        <div className="seller-stat-card stat-plum">
          <FiAlertTriangle size={20} />
          <span className="seller-stat-value">{stats?.lowStockCount ?? 0}</span>
          <span className="seller-stat-label">Low stock items</span>
        </div>
      </div>

      {stats?.lowStockProducts?.length > 0 && (
        <div className="seller-lowstock-card">
          <div className="seller-lowstock-head">
            <strong>Running low on stock</strong>
            <Link to="/seller/products">Manage products <FiArrowRight size={13} /></Link>
          </div>
          <div className="seller-lowstock-list">
            {stats.lowStockProducts.map((p) => (
              <div key={p._id} className="seller-lowstock-item">
                <span>{p.name}</span>
                <span className="tag tag-blush">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="seller-quick-actions">
        <Link to="/seller/products" className="seller-quick-card">
          <FiBox size={22} />
          <strong>Manage products</strong>
          <span>Add new items, edit prices, update stock</span>
        </Link>
        <Link to="/seller/orders" className="seller-quick-card">
          <FiShoppingBag size={22} />
          <strong>View orders</strong>
          <span>Update status, print shipping labels</span>
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
