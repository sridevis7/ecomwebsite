import { Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { _id, name, price, discountPrice, images, avgRating, reviewCount, sellerId } = product;
  const { isWishlisted, toggleWishlist } = useWishlist();
  const hasDiscount = discountPrice && discountPrice < price;
  const percentOff = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const wishlisted = isWishlisted(_id);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(_id);
  };

  return (
    <Link to={`/products/${_id}`} className="product-card">
      <div className="product-card-image">
        <img
          src={images?.[0] || 'https://placehold.co/400x500/F2EDE3/6B6470?text=StyleHub'}
          alt={name}
          loading="lazy"
        />
        {hasDiscount && <span className="product-card-discount">-{percentOff}%</span>}
        <button
          className={`product-card-heart ${wishlisted ? 'active' : ''}`}
          onClick={handleHeartClick}
          aria-label="Toggle wishlist"
        >
          <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        {sellerId?.shopName && <span className="product-card-seller">{sellerId.shopName}</span>}
        <h4 className="product-card-name">{name}</h4>

        <div className="product-card-bottom">
          <div className="product-card-price">
            {hasDiscount ? (
              <>
                <span className="price-now">Rs. {discountPrice.toLocaleString()}</span>
                <span className="price-was">Rs. {price.toLocaleString()}</span>
              </>
            ) : (
              <span className="price-now">Rs. {price.toLocaleString()}</span>
            )}
          </div>

          {avgRating > 0 && (
            <div className="product-card-rating">
              <FiStar size={12} fill="currentColor" />
              <span>{avgRating}</span>
              {reviewCount > 0 && <span className="product-card-reviews">({reviewCount})</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
