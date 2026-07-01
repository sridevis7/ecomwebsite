import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeItem, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="container empty-state">
          <FiShoppingBag size={36} style={{ marginBottom: 16, color: 'var(--ink-soft)' }} />
          <h3>Your bag is empty</h3>
          <p>Items you add will show up here, ready for checkout.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
            Browse products <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap cart-page">
      <div className="container">
        <h1 className="cart-title">Your bag</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.productId?.images?.[0] || 'https://placehold.co/120x150/F2EDE3/6B6470?text=StyleHub'}
                  alt={item.productId?.name}
                />
                <div className="cart-item-info">
                  <h4>{item.productId?.name}</h4>
                  <div className="cart-item-meta">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <div className="cart-item-bottom">
                    <div className="qty-stepper">
                      <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeItem(item._id)} aria-label="Remove">
                  <FiTrash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery</span>
              <span className="cart-free">Calculated at checkout</span>
            </div>
            <hr className="seam" style={{ margin: '16px 0' }} />
            <div className="cart-summary-row cart-total-row">
              <span>Total</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 18 }} onClick={() => navigate('/checkout')}>
              Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
