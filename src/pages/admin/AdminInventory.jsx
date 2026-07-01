import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminInventory } from '../../services/adminApi';
import './AdminTable.css';

const AdminInventory = () => {
  const [data, setData] = useState({ lowStock: [], outStock: [], allProducts: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('low');

  useEffect(() => {
    getAdminInventory()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Could not load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const list = tab === 'low' ? data.lowStock : tab === 'out' ? data.outStock : data.allProducts;

  return (
    <div className="admin-table-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Inventory</h1>
          <p className="admin-page-sub">Stock levels across all sellers</p>
        </div>
        <div className="admin-filter-tabs">
          <button className={tab === 'low' ? 'active' : ''} onClick={() => setTab('low')}>Low stock ({data.lowStock.length})</button>
          <button className={tab === 'out' ? 'active' : ''} onClick={() => setTab('out')}>Out of stock ({data.outStock.length})</button>
          <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All products</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }} />
      ) : list.length === 0 ? (
        <div className="empty-state"><h3>Nothing here</h3><p>No products match this view.</p></div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <span>Product</span><span>Seller</span><span>Stock</span><span>Sold</span>
          </div>
          {list.map((p) => (
            <div key={p._id} className="admin-table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
              <span>{p.name}</span>
              <span>{p.sellerId?.shopName || '—'}</span>
              <span>
                {p.stock === 0 ? <span className="tag tag-blush">Out</span> : p.stock < 5 ? <span className="tag tag-butter">{p.stock}</span> : p.stock}
              </span>
              <span>{p.sold || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
