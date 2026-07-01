import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiGift,
  FiPackage,
  FiGrid,
  FiSettings,
  FiHeart,
  FiRefreshCw,
  FiCamera,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-top container">
        <button className="navbar-burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <Link to="/" className="navbar-logo">
          Style<span>Hub</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search dresses, denim, sneakers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link to="/visual-search" className="navbar-search-camera" aria-label="Search by photo" title="Search by photo">
            <FiCamera size={16} />
          </Link>
        </form>

        <div className="navbar-actions">
          <Link to="/wishlist" className="navbar-icon-link" aria-label="Wishlist">
            <FiHeart size={20} />
          </Link>

          <Link to="/cart" className="navbar-icon-link" aria-label="Shopping bag">
            <FiShoppingBag size={20} />
            {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-user-wrap" onMouseLeave={() => setUserMenuOpen(false)}>
              <button className="navbar-user" onClick={() => setUserMenuOpen((v) => !v)}>
                <span className="navbar-avatar"><FiUser size={15} /></span>
                <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div className="navbar-dropdown">
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}>
                      <FiSettings size={15} /> Admin panel
                    </Link>
                  )}
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <Link to="/seller" onClick={() => setUserMenuOpen(false)}>
                      <FiGrid size={15} /> Seller dashboard
                    </Link>
                  )}
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                    <FiPackage size={15} /> My orders
                  </Link>
                  <Link to="/returns" onClick={() => setUserMenuOpen(false)}>
                    <FiRefreshCw size={15} /> Returns
                  </Link>
                  <Link to="/loyalty" onClick={() => setUserMenuOpen(false)}>
                    <FiGift size={15} /> Loyalty points
                  </Link>
                  <button className="navbar-dropdown-logout" onClick={logout}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>
          )}
        </div>
      </div>

      <nav className={`navbar-categories ${menuOpen ? 'open' : ''}`}>
        <Link to="/products?category=women" onClick={() => setMenuOpen(false)}>Women</Link>
        <Link to="/products?category=men" onClick={() => setMenuOpen(false)}>Men</Link>
        <Link to="/products?category=kids" onClick={() => setMenuOpen(false)}>Kids</Link>
        <Link to="/products?sort=newest" onClick={() => setMenuOpen(false)}>New In</Link>
        <Link to="/community" onClick={() => setMenuOpen(false)}>Fashion Feed</Link>
        <Link to="/visual-search" onClick={() => setMenuOpen(false)}>Visual Search</Link>
        <Link to="/products?sale=true" className="navbar-sale" onClick={() => setMenuOpen(false)}>Sale</Link>
        <div className="navbar-categories-divider" />
        <Link to="/register-seller" onClick={() => setMenuOpen(false)}>Sell on StyleHub</Link>
      </nav>
    </header>
  );
};

export default Navbar;
