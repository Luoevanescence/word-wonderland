import React from 'react';
import './ConfirmDialog.css';

// 警告图标
const WarningIcon = () => (
  <svg width="56" height="56" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2 L18 16 L2 16 Z"
      stroke="#F59E0B"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="#FEF3C7"
    />
    <path
      d="M10 7 L10 11"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="10"
      cy="13.5"
      r="0.8"
      fill="#F59E0B"
    />
  </svg>
);

// 信息图标
const InfoIcon = () => (
  <svg width="56" height="56" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke="#3B82F6"
      strokeWidth="1.5"
      fill="#DBEAFE"
    />
    <path
      d="M10 6 L10 10 M10 14 L10 14"
      stroke="#3B82F6"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 成功图标
const SuccessIcon = () => (
  <svg width="56" height="56" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke="#10B981"
      strokeWidth="1.5"
      fill="#D1FAE5"
    />
    <path
      d="M6 10 L8.5 12.5 L14 7"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 错误图标
const ErrorIcon = () => (
  <svg width="56" height="56" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke="#EF4444"
      strokeWidth="1.5"
      fill="#FEE2E2"
    />
    <path
      d="M7 7 L13 13 M13 7 L7 13"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 确认图标
const ConfirmIcon = () => (
  <svg width="56" height="56" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke="#6B7280"
      strokeWidth="1.5"
      fill="#F3F4F6"
    />
    <path
      d="M7 10 L9 12 L13 8"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
        return <WarningIcon />;
      case 'alert':
        return <InfoIcon />;
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <ConfirmIcon />;
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



