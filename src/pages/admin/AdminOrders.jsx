import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllOrders, updateAdminOrderStatus } from '../../services/adminApi';
import './AdminTable.css';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    getAllOrders()
      .then((res) => setOrders(res.data))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAdminOrderStatus(id, status);
      toast.success('Status updated');
      loadOrders();
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  return (
    <div className="admin-table-page">
      <h1 className="admin-page-title">All orders</h1>
      <p className="admin-page-sub">{orders.length} order{orders.length !== 1 ? 's' : ''} across the platform</p>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : orders.length === 0 ? (
        <div className="empty-state"><h3>No orders yet</h3></div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head" style={{ gridTemplateColumns: '1fr 1.3fr 1fr 1fr 1fr' }}>
            <span>Order</span><span>Customer</span><span>Total</span><span>Payment</span><span>Status</span>
          </div>
          {orders.map((o) => (
            <div key={o._id} className="admin-table-row" style={{ gridTemplateColumns: '1fr 1.3fr 1fr 1fr 1fr' }}>
              <span>#{o._id.slice(-8).toUpperCase()}</span>
              <span>{o.userId?.name}</span>
              <span>Rs. {o.totalAmount.toLocaleString()}</span>
              <span>{o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online'}</span>
              <select
                value={o.orderStatus}
                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                className="seller-status-select"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
