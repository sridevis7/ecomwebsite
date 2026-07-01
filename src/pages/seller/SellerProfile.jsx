import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSellerProfile, updateSellerProfile } from '../../services/sellerApi';
import './SellerProfile.css';

const SellerProfile = () => {
  const [form, setForm] = useState({ shopName: '', shopDescription: '', shopAddress: '', bankAccount: '' });
  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSellerProfile()
      .then((res) => {
        setForm({
          shopName: res.data.shopName || '',
          shopDescription: res.data.shopDescription || '',
          shopAddress: res.data.shopAddress || '',
          bankAccount: res.data.bankAccount || '',
        });
        setApprovalStatus(res.data.approvalStatus);
      })
      .catch(() => toast.error('Could not load shop profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSellerProfile(form);
      toast.success('Shop profile updated');
    } catch (err) {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div className="seller-profile-page">
      <h1 className="seller-page-title">Shop profile</h1>
      <p className="seller-page-sub">
        Approval status: <span className={`tag ${approvalStatus === 'approved' ? 'tag-sage' : 'tag-butter'}`}>{approvalStatus}</span>
      </p>

      <form className="seller-profile-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="shopName">Shop name</label>
          <input id="shopName" name="shopName" value={form.shopName} onChange={handleChange} required />
        </div>

        <div className="field">
          <label htmlFor="shopDescription">Shop description</label>
          <textarea id="shopDescription" name="shopDescription" rows={3} value={form.shopDescription} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="shopAddress">Shop address (used on shipping labels)</label>
          <textarea id="shopAddress" name="shopAddress" rows={2} value={form.shopAddress} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="bankAccount">Bank account (for payouts)</label>
          <input id="bankAccount" name="bankAccount" value={form.bankAccount} onChange={handleChange} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default SellerProfile;
