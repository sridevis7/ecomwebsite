import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiTruck, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', city: '', province: '', zipCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);

  const handleChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await placeOrder({ shippingAddress: address, paymentMethod });
      toast.success(res.data.message || 'Order placed!');
      await refreshCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="container empty-state">
          <h3>Your bag is empty</h3>
          <p>Add something to your bag before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          <div className="checkout-main">
            <section className="checkout-section">
              <h3>Shipping address</h3>
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" value={address.fullName} onChange={handleChange} required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={address.phone} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">Postal code</label>
                  <input id="zipCode" name="zipCode" value={address.zipCode} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="street">Street address</label>
                <input id="street" name="street" value={address.street} onChange={handleChange} required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" value={address.city} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="province">Province</label>
                  <input id="province" name="province" value={address.province} onChange={handleChange} required />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h3>Payment method</h3>
              <label className={`radio-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <FiTruck size={18} />
                <div>
                  <strong>Cash on delivery</strong>
                  <p style={{ fontSize: 12.5 }}>Pay with cash when your order arrives</p>
                </div>
              </label>

              <label className={`radio-card ${paymentMethod === 'online' ? 'active' : ''}`} style={{ marginTop: 12 }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                />
                <FiCreditCard size={18} />
                <div>
                  <strong>Pay online</strong>
                  <p style={{ fontSize: 12.5 }}>Card or wallet payment at the next step</p>
                </div>
              </label>
            </section>
          </div>

          <aside className="checkout-summary">
            <h3>Order summary</h3>
            {cart.items.map((item) => (
              <div key={item._id} className="checkout-summary-item">
                <span>{item.productId?.name} × {item.quantity}</span>
                <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <hr className="seam" style={{ margin: '16px 0' }} />
            <div className="checkout-summary-item checkout-total">
              <span>Total</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={placing} style={{ marginTop: 18 }}>
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
