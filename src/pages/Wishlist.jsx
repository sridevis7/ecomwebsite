import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="page-wrap">
        <div className="container empty-state">
          <FiHeart size={36} style={{ marginBottom: 16, color: 'var(--ink-soft)' }} />
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on any product to save it here for later.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap wishlist-page">
      <div className="container">
        <h1 className="wishlist-title">Your wishlist</h1>
        <p className="wishlist-sub">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>

        <div className="product-grid">
          {wishlist.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
