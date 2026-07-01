import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSeller } from '../services/api';
import './Auth.css';

const RegisterSeller = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    shopName: '', shopDescription: '', cnicNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerSeller(form);
      toast.success('Application submitted — we will review it shortly');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <span className="eyebrow">Sell on StyleHub</span>
        <h1 className="auth-title">Apply as a seller</h1>
        <p style={{ marginBottom: 22, fontSize: 13.5 }}>
          Your shop goes live once our team approves your application — usually within a day.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />
          </div>

          <hr className="seam" style={{ margin: '20px 0' }} />

          <div className="field">
            <label htmlFor="shopName">Shop name</label>
            <input id="shopName" name="shopName" value={form.shopName} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="shopDescription">Shop description</label>
            <textarea
              id="shopDescription"
              name="shopDescription"
              rows={3}
              value={form.shopDescription}
              onChange={handleChange}
              placeholder="What kind of clothing do you sell?"
            />
          </div>

          <div className="field">
            <label htmlFor="cnicNumber">CNIC number</label>
            <input id="cnicNumber" name="cnicNumber" value={form.cnicNumber} onChange={handleChange} placeholder="xxxxx-xxxxxxx-x" required />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit application'}
          </button>
        </form>

        <p className="auth-switch">
          Already approved? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterSeller;
