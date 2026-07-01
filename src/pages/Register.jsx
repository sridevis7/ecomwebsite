import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap auth-page">
      <div className="auth-card">
        <span className="eyebrow">Join StyleHub</span>
        <h1 className="auth-title">Create your account</h1>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} minLength={6} required />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="auth-switch">
          Want to sell on StyleHub? <Link to="/register-seller">Apply as a seller</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
