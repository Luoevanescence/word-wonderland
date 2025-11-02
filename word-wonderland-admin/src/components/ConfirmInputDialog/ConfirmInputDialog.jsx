import React, { useState, useEffect, useRef } from 'react';
import './ConfirmInputDialog.css';

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

const ConfirmInputDialog = ({ 
  isOpen, 
  title = '确认操作', 
  message,
  inputLabel,
  expectedValue,
  onConfirm, 
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  type = 'danger' // 'confirm' | 'alert' | 'danger'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setInputValue('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputValue.trim() !== expectedValue) {
      setError(`请输入 "${expectedValue}" 以确认`);
      return;
    }
    onConfirm();
  };

  const handleCancel = () => {
    setInputValue('');
    setError('');
    onCancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
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
    <div className="confirm-input-dialog-overlay" onClick={handleCancel}>
      <div className={`confirm-input-dialog ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-input-dialog-icon">{getIcon()}</div>
        <div className="confirm-input-dialog-content">
          <h3 className="confirm-input-dialog-title">{title}</h3>
          <p className="confirm-input-dialog-message">{message}</p>
          <div className="confirm-input-dialog-input-wrapper">
            <label className="confirm-input-dialog-label">{inputLabel}</label>
            <input
              ref={inputRef}
              type="text"
              className={`confirm-input-dialog-input ${error ? 'error' : ''}`}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyPress}
              placeholder={expectedValue}
            />
            {error && <div className="confirm-input-dialog-error">{error}</div>}
          </div>
        </div>
        <div className="confirm-input-dialog-actions">
          <button 
            className="confirm-input-dialog-btn confirm-input-dialog-btn-cancel" 
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-input-dialog-btn confirm-input-dialog-btn-confirm ${type === 'danger' ? 'danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmInputDialog;
