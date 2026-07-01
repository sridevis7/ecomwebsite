import { useState, useRef } from 'react';
import { FiCamera, FiUpload, FiX, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { visualSearch } from '../services/visualSearchApi';
import ProductCard from '../components/ProductCard';
import './VisualSearch.css';

const VisualSearch = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleSearch = async () => {
    if (!image) return;
    setSearching(true);
    try {
      const data = new FormData();
      data.append('image', image);
      const res = await visualSearch(data);
      setResults(res.data);
      if (res.data.products.length === 0) {
        toast('No close matches found — try a clearer photo', { icon: '🔍' });
      }
    } catch (err) {
      toast.error('Could not search right now — please try again');
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResults(null);
  };

  return (
    <div className="page-wrap visual-search-page">
      <div className="container">
        <span className="eyebrow">Snap it, find it</span>
        <h1 className="vs-title">Visual search</h1>
        <p className="vs-sub">Upload a photo of an outfit or item you love — we'll find similar pieces from our sellers.</p>

        {!preview ? (
          <div
            className="vs-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <FiUpload size={28} />
            <strong>Click to upload or drag a photo here</strong>
            <span>JPG or PNG, clear shot of the item works best</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="vs-preview-row">
            <div className="vs-preview-image">
              <img src={preview} alt="Uploaded" />
              <button className="vs-preview-remove" onClick={handleReset}><FiX size={16} /></button>
            </div>

            {!results && (
              <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
                <FiCamera size={16} /> {searching ? 'Analyzing photo…' : 'Find similar items'}
              </button>
            )}
          </div>
        )}

        {results && (
          <div className="vs-results">
            {results.detected && (
              <div className="vs-detected">
                <span className="vs-detected-label">We spotted:</span>
                {results.detected.category && <span className="tag tag-blush">{results.detected.category}</span>}
                {results.detected.colors?.map((c) => <span key={c} className="tag tag-sage">{c}</span>)}
                {results.detected.keywords?.map((k) => <span key={k} className="tag tag-butter">{k}</span>)}
              </div>
            )}

            {results.products.length === 0 ? (
              <div className="empty-state">
                <h3>No close matches yet</h3>
                <p>Try a clearer photo, or browse all products instead.</p>
              </div>
            ) : (
              <>
                <h3 className="vs-results-title">{results.total} similar item{results.total !== 1 ? 's' : ''} found</h3>
                <div className="product-grid">
                  {results.products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
              </>
            )}

            <button className="btn btn-outline" onClick={handleReset} style={{ marginTop: 24 }}>
              Try another photo <FiArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualSearch;
