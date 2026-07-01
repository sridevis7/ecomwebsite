import { FiX, FiPrinter } from 'react-icons/fi';
import './AddressLabel.css';

const AddressLabel = ({ label, onClose }) => {
  const handlePrint = () => window.print();

  if (!label) return null;

  return (
    <div className="label-overlay no-print-bg" onClick={onClose}>
      <div className="label-modal" onClick={(e) => e.stopPropagation()}>
        <div className="label-modal-toolbar no-print">
          <button className="seller-modal-close" onClick={onClose}><FiX size={20} /></button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <FiPrinter size={14} /> Print label
          </button>
        </div>

        <div className="address-label" id="print-label">
          <div className="label-header">
            <strong>StyleHub Order</strong>
            <span>#{label.orderId?.slice(-8).toUpperCase()}</span>
          </div>

          <hr className="seam" />

          <div className="label-section">
            <span className="label-tag">To</span>
            <strong>{label.to.fullName}</strong>
            <p>{label.to.street}</p>
            <p>{label.to.city}, {label.to.province} {label.to.zipCode}</p>
            <p>{label.to.country}</p>
            <p>Phone: {label.to.phone}</p>
          </div>

          <hr className="seam" />

          <div className="label-section">
            <span className="label-tag">From</span>
            <strong>{label.from.shopName}</strong>
            <p>{label.from.shopAddress || 'Address not set'}</p>
          </div>

          <hr className="seam" />

          <div className="label-footer">
            <span>Items: {label.itemCount}</span>
            <span>Total: Rs. {label.totalAmount?.toLocaleString()}</span>
            <span>{label.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressLabel;
