import React from 'react';
import './DetailViewModal.css';

/**
 * 详情查看弹窗组件
 * @param {boolean} show - 是否显示弹窗
 * @param {function} onClose - 关闭弹窗回调
 * @param {string} title - 弹窗标题
 * @param {string} content - 要显示的内容（支持 \n 换行）
 */
function DetailViewModal({ show, onClose, title, content }) {
  if (!show) return null;

  // 处理换行符，将 \n 转换为实际的换行
  const formatContent = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

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
            ×
          </button>
        </div>
        <div className="detail-modal-body">
          {formatContent(content)}
        </div>
        <div className="detail-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailViewModal;

