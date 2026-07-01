import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 8, sort: 'newest' })
      .then((res) => setFeatured(res.data.products))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">

      {/* ───────── HERO ───────── */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">New season, new sellers</span>
            <h1 className="hero-title">
              Clothes with a<br />story to <em>wear</em>.
            </h1>
            <p className="hero-sub">
              StyleHub gathers independent clothing sellers into one easy place to shop —
              with AI sizing help, outfit pairing, and real return windows.
            </p>
            <div className="hero-cta">
              <Link to="/products" className="btn btn-primary">
                Shop the new arrivals <FiArrowRight />
              </Link>
              <Link to="/register-seller" className="btn btn-outline">Sell with us</Link>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-art-block hero-block-blush">
              <span className="tag tag-blush">Best seller</span>
              <strong>Linen Co-ord Set</strong>
              <span>Rs. 4,200</span>
            </div>
            <div className="hero-art-block hero-block-sage">
              <span className="tag tag-sage">Restocked</span>
              <strong>Relaxed Denim</strong>
              <span>Rs. 3,150</span>
            </div>
            <div className="hero-art-block hero-block-butter">
              <span className="tag tag-butter">New seller</span>
              <strong>Handloom Scarves</strong>
              <span>From Rs. 950</span>
            </div>
          </div>
        </div>
      </section>

      <div className="seam container" />

      {/* ───────── TRUST STRIP ───────── */}
      <section className="trust-strip container">
        <div className="trust-item">
          <FiTruck size={20} />
          <div><strong>Cash on delivery</strong><span>or pay online — your call</span></div>
        </div>
        <div className="trust-item">
          <FiRefreshCw size={20} />
          <div><strong>7-day returns</strong><span>real refunds, no runaround</span></div>
        </div>
        <div className="trust-item">
          <FiShield size={20} />
          <div><strong>Verified sellers</strong><span>every shop is approved by hand</span></div>
        </div>
      </section>

      {/* ───────── CATEGORY BLOCKS ───────── */}
      <section className="section container">
        <span className="eyebrow">Shop by category</span>
        <h2 className="section-title">Find your fit</h2>

        <div className="category-grid">
          <Link to="/products?category=women" className="category-card cat-blush">
            <span>Women</span>
          </Link>
          <Link to="/products?category=men" className="category-card cat-sage">
            <span>Men</span>
          </Link>
          <Link to="/products?category=kids" className="category-card cat-butter">
            <span>Kids</span>
          </Link>
          <Link to="/products?sale=true" className="category-card cat-plum">
            <span>Sale</span>
          </Link>
        </div>
      </section>

      {/* ───────── FEATURED PRODUCTS ───────── */}
      <section className="section container">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Fresh in</span>
            <h2 className="section-title">Just landed</h2>
          </div>
          <Link to="/products" className="section-link">View all <FiArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: '40px auto' }} />
        ) : featured.length === 0 ? (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Once sellers list items, they'll show up right here.</p>
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ───────── SELLER CTA ───────── */}
      <section className="seller-cta container">
        <div className="seller-cta-box">
          <div>
            <span className="eyebrow">For makers &amp; shop owners</span>
            <h2>Have a clothing brand?<br/>Bring it to StyleHub.</h2>
            <p>List your pieces, manage your own orders, and reach customers already looking to buy.</p>
          </div>
          <Link to="/register-seller" className="btn btn-primary">Start selling <FiArrowRight /></Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
