import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './SellerLayout.css';

const SellerLayout = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'seller' && user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="seller-shell">
      <aside className="seller-sidebar">
        <div className="seller-sidebar-brand">Style<span>Hub</span><small>Seller</small></div>

        <nav className="seller-nav">
          <NavLink to="/seller" end className="seller-nav-link">
            <FiGrid size={17} /> Dashboard
          </NavLink>
          <NavLink to="/seller/products" className="seller-nav-link">
            <FiBox size={17} /> Products
          </NavLink>
          <NavLink to="/seller/orders" className="seller-nav-link">
            <FiShoppingBag size={17} /> Orders
          </NavLink>
          <NavLink to="/seller/profile" className="seller-nav-link">
            <FiUser size={17} /> Shop profile
          </NavLink>
        </nav>

        <button className="seller-sidebar-logout" onClick={logout}>
          <FiLogOut size={16} /> Sign out
        </button>
      </aside>

      <main className="seller-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
