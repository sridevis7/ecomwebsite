import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Beige', 'Blue', 'Green', 'Pink'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (size) params.size = size;
    if (color) params.color = color;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    getProducts(params)
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, search, sort, size, color, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const activeFilterCount = [category, size, color, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="page-wrap products-page">
      <div className="container">
        <div className="products-header">
          <div>
            <span className="eyebrow">{search ? `Results for "${search}"` : category ? category : 'All products'}</span>
            <h1 className="products-title">{loading ? 'Searching…' : `${total} ${total === 1 ? 'item' : 'items'}`}</h1>
          </div>

          <div className="products-controls">
            <select className="sort-select" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              <option value="">Sort: Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters((v) => !v)}>
              <FiFilter size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>

        <div className="products-layout">
          {showFilters && (
            <aside className="filters-panel">
              <div className="filters-panel-head">
                <strong>Filters</strong>
                <button onClick={clearFilters} className="filters-clear">Clear all</button>
              </div>

              <div className="filter-group">
                <span className="filter-label">Category</span>
                {['men', 'women', 'kids'].map((c) => (
                  <label key={c} className="filter-checkbox">
                    <input
                      type="radio"
                      checked={category === c}
                      onChange={() => updateParam('category', c)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{c}</span>
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <span className="filter-label">Size</span>
                <div className="size-pills">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      className={`size-pill ${size === s ? 'active' : ''}`}
                      onClick={() => updateParam('size', size === s ? '' : s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">Color</span>
                {COLORS.map((c) => (
                  <label key={c} className="filter-checkbox">
                    <input
                      type="radio"
                      checked={color === c}
                      onChange={() => updateParam('color', color === c ? '' : c)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <span className="filter-label">Price range (Rs.)</span>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </aside>
          )}

          <div className="products-results">
            {loading ? (
              <div className="spinner" style={{ margin: '60px auto' }} />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h3>No items match these filters</h3>
                <p>Try widening your search or clearing a few filters.</p>
                <button className="btn btn-outline" style={{ marginTop: 18 }} onClick={clearFilters}>
                  <FiX size={14} /> Clear filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
