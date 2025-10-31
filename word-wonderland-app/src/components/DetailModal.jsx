import React from 'react';
import './DetailModal.css';

function DetailModal({ show, onClose, title, children }) {
  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'detail-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="detail-modal-overlay" onClick={handleOverlayClick}>
      <div className="detail-modal-content">
        <div className="detail-modal-header">
          <h2>{title}</h2>
          <button className="detail-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="detail-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DetailModal;

