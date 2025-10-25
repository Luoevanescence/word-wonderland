import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title = '确认操作', 
  message, 
  onConfirm, 
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  type = 'confirm' // 'confirm' | 'alert' | 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'alert':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleCancel}>
      <div className={`confirm-dialog ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-icon">{getIcon()}</div>
        <div className="confirm-dialog-content">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-btn confirm-dialog-btn-cancel" 
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn confirm-dialog-btn-confirm ${type === 'danger' ? 'danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

