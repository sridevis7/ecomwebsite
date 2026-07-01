import { useEffect, useState } from 'react';
import { FiGift, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getLoyaltyPoints } from '../services/api';
import './Loyalty.css';

const Loyalty = () => {
  const [loyalty, setLoyalty] = useState({ totalPoints: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoyaltyPoints()
      .then((res) => setLoyalty(res.data || { totalPoints: 0, transactions: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;

  const transactions = [...(loyalty.transactions || [])].reverse();
  const rupeeValue = Math.floor(loyalty.totalPoints / 10); // 10 points = Rs.1, matches backend earn rate

  return (
    <div className="page-wrap loyalty-page">
      <div className="container">
        <h1 className="loyalty-title">Loyalty points</h1>

        <div className="loyalty-balance-card">
          <div className="loyalty-balance-icon"><FiGift size={26} /></div>
          <div>
            <span className="loyalty-balance-label">Your balance</span>
            <h2 className="loyalty-balance-amount">{loyalty.totalPoints.toLocaleString()} pts</h2>
            <span className="loyalty-balance-note">≈ Rs. {rupeeValue.toLocaleString()} off your next order</span>
          </div>
        </div>

        <div className="loyalty-info-row">
          <div className="loyalty-info-card">
            <strong>How it works</strong>
            <p>Earn 1 point for every Rs. 10 you spend. Redeem points at checkout for instant discounts.</p>
          </div>
          <div className="loyalty-info-card">
            <strong>Redeeming</strong>
            <p>Points can be applied during checkout — look for the redeem option before placing your order.</p>
          </div>
        </div>

        <h3 className="loyalty-history-title">History</h3>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No activity yet</h3>
            <p>Place an order to start earning points.</p>
          </div>
        ) : (
          <div className="loyalty-history-list">
            {transactions.map((t, i) => (
              <div key={i} className="loyalty-history-item">
                <div className={`loyalty-history-icon ${t.type}`}>
                  {t.type === 'earned' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </div>
                <div className="loyalty-history-info">
                  <strong>{t.description || (t.type === 'earned' ? 'Points earned' : 'Points redeemed')}</strong>
                  <span>{t.date ? new Date(t.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                </div>
                <span className={`loyalty-history-points ${t.type}`}>
                  {t.type === 'earned' ? '+' : '-'}{t.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loyalty;
