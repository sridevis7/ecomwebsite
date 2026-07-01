import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiHeart, FiTruck, FiRefreshCw, FiZap, FiMaximize2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProduct, getRecommendations, getReviews, addReview, aiStylist } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import SizePredictor from '../components/SizePredictor';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [stylistTips, setStylistTips] = useState('');
  const [stylistLoading, setStylistLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProduct(id), getReviews(id)])
      .then(([prodRes, reviewRes]) => {
        setProduct(prodRes.data);
        setReviews(reviewRes.data);
        setSelectedSize(prodRes.data.sizes?.[0] || '');
        setSelectedColor(prodRes.data.colors?.[0] || '');
      })
      .catch(() => toast.error('Could not load this product'))
      .finally(() => setLoading(false));

    getRecommendations(id).then((res) => setRecommended(res.data)).catch(() => {});
  }, [id]);

  const handleAddToCart = async () => {
    if (product.sizes?.length && !selectedSize) return toast.error('Pick a size first');
    const price = product.discountPrice || product.price;
    await addItem(product._id, quantity, selectedSize, selectedColor, price);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Sign in to leave a review');
    try {
      await addReview(id, reviewForm);
      toast.success('Thanks for your review!');
      const res = await getReviews(id);
      setReviews(res.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  const handleAskStylist = async () => {
    setStylistLoading(true);
    try {
      const res = await aiStylist({
        productName: product.name,
        category: product.category?.name || 'clothing',
        color: selectedColor || product.colors?.[0] || 'neutral',
      });
      setStylistTips(res.data.suggestions);
    } catch (err) {
      toast.error('Stylist is unavailable right now');
    } finally {
      setStylistLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="page-wrap pdp">
      <div className="container pdp-grid">

        {/* ---------- IMAGES ---------- */}
        <div className="pdp-images">
          <div className="pdp-main-image">
            <img
              src={product.images?.[activeImage] || 'https://placehold.co/600x750/F2EDE3/6B6470?text=StyleHub'}
              alt={product.name}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------- INFO ---------- */}
        <div className="pdp-info">
          {product.sellerId?.shopName && (
            <Link to="#" className="pdp-seller">{product.sellerId.shopName}</Link>
          )}
          <h1 className="pdp-title">{product.name}</h1>

          {product.avgRating > 0 && (
            <div className="pdp-rating">
              <FiStar size={14} fill="currentColor" />
              <span>{product.avgRating}</span>
              <span className="pdp-rating-count">({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="pdp-price">
            {hasDiscount ? (
              <>
                <span className="price-now">Rs. {product.discountPrice.toLocaleString()}</span>
                <span className="price-was">Rs. {product.price.toLocaleString()}</span>
                <span className="tag tag-blush">Sale</span>
              </>
            ) : (
              <span className="price-now">Rs. {product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="pdp-description">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="pdp-option-group">
              <div className="pdp-option-label-row">
                <span className="pdp-option-label">Size</span>
                <button className="pdp-size-helper" onClick={() => setShowSizeModal(true)}>
                  <FiMaximize2 size={12} /> Not sure? Find my size
                </button>
              </div>
              <div className="size-pills">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-pill ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="pdp-option-group">
              <span className="pdp-option-label">Color</span>
              <div className="size-pills">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`size-pill ${selectedColor === c ? 'active' : ''}`}
                    onClick={() => setSelectedColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pdp-qty-row">
            <span className="pdp-option-label">Quantity</span>
            <div className="qty-stepper">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
          </div>

          <div className="pdp-actions">
            <button className="btn btn-primary btn-full" onClick={handleAddToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of stock' : 'Add to bag'}
            </button>
            <button
              className={`btn btn-ghost ${wishlisted ? 'pdp-wishlist-active' : ''}`}
              aria-label="Add to wishlist"
              onClick={() => toggleWishlist(product._id)}
            >
              <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="pdp-trust">
            <div><FiTruck size={16} /> Cash on delivery available</div>
            <div><FiRefreshCw size={16} /> 7-day easy returns</div>
          </div>

          {/* AI Outfit Stylist */}
          <div className="pdp-stylist">
            <button className="stylist-trigger" onClick={handleAskStylist} disabled={stylistLoading}>
              <FiZap size={16} />
              {stylistLoading ? 'Styling…' : 'Ask the AI Stylist what to pair this with'}
            </button>
            {stylistTips && <p className="stylist-result">{stylistTips}</p>}
          </div>
        </div>
      </div>

      {/* ---------- REVIEWS ---------- */}
      <div className="container pdp-reviews">
        <hr className="seam" />
        <h2 className="section-title" style={{ marginTop: 40 }}>Reviews</h2>

        {reviews.length === 0 ? (
          <p style={{ marginTop: 12 }}>No reviews yet — be the first to share your experience.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-head">
                  <strong>{r.userId?.name || 'Customer'}</strong>
                  <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {user && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <span className="pdp-option-label">Leave a review</span>
            <div className="review-form-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={n <= reviewForm.rating ? 'star active' : 'star'}
                  onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                >★</button>
              ))}
            </div>
            <textarea
              placeholder="Tell other shoppers how it fit, felt, looked..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              required
            />
            <button className="btn btn-primary btn-sm" type="submit">Submit review</button>
          </form>
        )}
      </div>

      {/* ---------- RECOMMENDATIONS ---------- */}
      {recommended.length > 0 && (
        <section className="section container">
          <span className="eyebrow">You might also like</span>
          <h2 className="section-title">Pairs well with this</h2>
          <div className="product-grid">
            {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {showSizeModal && (
        <SizePredictor category={product.category?.name} onClose={() => setShowSizeModal(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
