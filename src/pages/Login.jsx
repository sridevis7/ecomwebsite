import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap auth-page">
      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1 className="auth-title">Sign in to StyleHub</h1>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New to StyleHub? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-switch">
          Want to sell? <Link to="/register-seller">Apply as a seller</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
