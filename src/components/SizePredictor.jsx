import { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { aiSizePredictor } from '../services/api';
import './SizePredictor.css';

const SizePredictor = ({ category, onClose }) => {
  const [form, setForm] = useState({ height: '', weight: '', chest: '', waist: '', hips: '', gender: 'women' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await aiSizePredictor({ ...form, category: category || 'clothing' });
      setResult(res.data.recommendation);
    } catch (err) {
      toast.error('Could not get a size recommendation right now');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-modal-overlay" onClick={onClose}>
      <div className="size-modal" onClick={(e) => e.stopPropagation()}>
        <button className="size-modal-close" onClick={onClose} aria-label="Close"><FiX size={20} /></button>

        <span className="eyebrow"><FiStar size={12} style={{ marginRight: 4 }} />Smart size predictor</span>
        <h2 className="size-modal-title">What's your size?</h2>
        <p className="size-modal-sub">Add your measurements and we'll suggest the best fit for this item.</p>

        {!result ? (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="gender">I'm shopping for</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
                <option value="women">Women's fit</option>
                <option value="men">Men's fit</option>
                <option value="kids">Kids' fit</option>
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="height">Height (cm)</label>
                <input id="height" name="height" type="number" value={form.height} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="weight">Weight (kg)</label>
                <input id="weight" name="weight" type="number" value={form.weight} onChange={handleChange} required />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="chest">Chest (cm)</label>
                <input id="chest" name="chest" type="number" value={form.chest} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="waist">Waist (cm)</label>
                <input id="waist" name="waist" type="number" value={form.waist} onChange={handleChange} required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="hips">Hips (cm)</label>
              <input id="hips" name="hips" type="number" value={form.hips} onChange={handleChange} required />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Calculating…' : 'Get my size'}
            </button>
          </form>
        ) : (
          <div className="size-result">
            <p>{result}</p>
            <button className="btn btn-outline btn-full" onClick={() => setResult('')} style={{ marginTop: 16 }}>
              Try different measurements
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SizePredictor;
