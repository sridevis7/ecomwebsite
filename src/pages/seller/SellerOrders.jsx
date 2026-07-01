import { useEffect, useState } from 'react';
import { FiPrinter, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getSellerOrders, updateSellerOrderStatus, getAddressLabel } from '../../services/sellerApi';
import AddressLabel from '../../components/AddressLabel';
import './SellerOrders.css';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    getSellerOrders()
      .then((res) => setOrders(res.data))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateSellerOrderStatus(orderId, status);
      toast.success('Order status updated');
      loadOrders();
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const handlePrintLabel = async (orderId) => {
    try {
      const res = await getAddressLabel(orderId);
      setLabel(res.data);
    } catch (err) {
      toast.error('Could not load address label');
    }
  };

  return (
    <div className="seller-orders-page">
      <h1 className="seller-page-title">Orders</h1>
      <p className="seller-page-sub">{orders.length} order{orders.length !== 1 ? 's' : ''} on your products</p>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={32} style={{ marginBottom: 14, color: 'var(--ink-soft)' }} />
          <h3>No orders yet</h3>
          <p>Orders for your products will appear here.</p>
        </div>
      ) : (
        <div className="seller-orders-list">
          {orders.map((order) => (
            <div key={order._id} className="seller-order-card">
              <div className="seller-order-top">
                <div>
                  <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="seller-order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span className="seller-order-customer">{order.userId?.name} · {order.userId?.email}</span>
              </div>

              <div className="seller-order-items">
                {order.items
                  .filter((item) => item.sellerId === order.items[0].sellerId) // show all, simplest case
                  .map((item, i) => (
                    <div key={i} className="seller-order-item-row">
                      <span>{item.name}</span>
                      <span>{item.size && `Size ${item.size}`} {item.color && `· ${item.color}`} · Qty {item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
              </div>

              <div className="seller-order-bottom">
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="seller-status-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>

                <div className="seller-order-bottom-right">
                  <span>{order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}</span>
                  <strong>Rs. {order.totalAmount.toLocaleString()}</strong>
                  <button className="btn btn-outline btn-sm" onClick={() => handlePrintLabel(order._id)}>
                    <FiPrinter size={14} /> Print label
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {label && <AddressLabel label={label} onClose={() => setLabel(null)} />}
    </div>
  );
};

export default SellerOrders;
