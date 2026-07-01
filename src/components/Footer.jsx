import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="seam" />
    <div className="container footer-grid">
      <div className="footer-brand">
        <h3 className="footer-logo">Style<span>Hub</span></h3>
        <p>Clothing from independent sellers across the country, curated in one place — try it on, track it, return it with ease.</p>
      </div>

      <div className="footer-col">
        <span className="footer-heading">Shop</span>
        <Link to="/products?category=women">Women</Link>
        <Link to="/products?category=men">Men</Link>
        <Link to="/products?category=kids">Kids</Link>
        <Link to="/community">Fashion feed</Link>
      </div>

      <div className="footer-col">
        <span className="footer-heading">Account</span>
        <Link to="/login">Sign in</Link>
        <Link to="/register">Create account</Link>
        <Link to="/register-seller">Sell on StyleHub</Link>
      </div>

      <div className="footer-col">
        <span className="footer-heading">Support</span>
        <Link to="/orders">Track an order</Link>
        <Link to="/returns">Returns &amp; refunds</Link>
      </div>
    </div>

    <div className="footer-bottom container">
      <span>© {new Date().getFullYear()} StyleHub Marketplace</span>
      <span>Made for people who actually wear their clothes twice.</span>
    </div>
  </footer>
);

export default Footer;
