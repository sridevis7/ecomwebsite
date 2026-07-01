import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronDown, FiTruck } from 'react-icons/fi';
import { getMyOrders } from '../services/api';
import './Orders.css';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const statusLabel = {
  pending: 'Order placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;

  if (orders.length === 0) {
    return (
      <div className="page-wrap">
        <div className="container empty-state">
          <FiPackage size={36} style={{ marginBottom: 16, color: 'var(--ink-soft)' }} />
          <h3>No orders yet</h3>
          <p>Once you place an order, you can track it here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap orders-page">
      <div className="container">
        <h1 className="orders-title">Your orders</h1>

        <div className="orders-list">
          {orders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);
            const isOpen = expanded === order._id;

            return (
              <div key={order._id} className="order-card">
                <button className="order-card-head" onClick={() => setExpanded(isOpen ? null : order._id)}>
                  <div>
                    <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="order-head-right">
                    <span className={`tag ${order.orderStatus === 'delivered' ? 'tag-sage' : order.orderStatus === 'cancelled' ? 'tag-blush' : 'tag-butter'}`}>
                      {statusLabel[order.orderStatus]}
                    </span>
                    <strong>Rs. {order.totalAmount.toLocaleString()}</strong>
                    <FiChevronDown className={`order-chevron ${isOpen ? 'open' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="order-card-body">
                    {order.orderStatus !== 'cancelled' && (
                      <div className="order-progress">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className={`order-progress-step ${i <= stepIndex ? 'done' : ''}`}>
                            <span className="order-progress-dot" />
                            <span>{statusLabel[step]}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {order.estimatedDelivery && (
                      <div className="order-eta">
                        <FiTruck size={14} /> Estimated delivery: {order.estimatedDelivery}
                      </div>
                    )}

                    <div className="order-items">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item-row">
                          <img src={item.image || 'https://placehold.co/60x75/F2EDE3/6B6470?text=SH'} alt={item.name} />
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.size && `Size ${item.size}`} {item.color && `· ${item.color}`} · Qty {item.quantity}</span>
                          </div>
                          <span className="order-item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-meta-row">
                      <span>Payment: {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}</span>
                      <span>Delivering to: {order.shippingAddress?.city}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
