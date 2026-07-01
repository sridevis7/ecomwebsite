import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiShoppingBag, FiTag, FiPercent, FiRefreshCw, FiBox, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">Style<span>Hub</span><small>Admin</small></div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-nav-link">
            <FiGrid size={17} /> Dashboard
          </NavLink>
          <NavLink to="/admin/sellers" className="admin-nav-link">
            <FiUsers size={17} /> Sellers
          </NavLink>
          <NavLink to="/admin/customers" className="admin-nav-link">
            <FiUsers size={17} /> Customers
          </NavLink>
          <NavLink to="/admin/orders" className="admin-nav-link">
            <FiShoppingBag size={17} /> Orders
          </NavLink>
          <NavLink to="/admin/inventory" className="admin-nav-link">
            <FiBox size={17} /> Inventory
          </NavLink>
          <NavLink to="/admin/categories" className="admin-nav-link">
            <FiTag size={17} /> Categories
          </NavLink>
          <NavLink to="/admin/coupons" className="admin-nav-link">
            <FiPercent size={17} /> Coupons
          </NavLink>
          <NavLink to="/admin/returns" className="admin-nav-link">
            <FiRefreshCw size={17} /> Returns
          </NavLink>
        </nav>

        <button className="admin-sidebar-logout" onClick={logout}>
          <FiLogOut size={16} /> Sign out
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
