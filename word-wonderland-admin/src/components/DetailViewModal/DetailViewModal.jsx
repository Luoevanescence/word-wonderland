import React from 'react';
import './DetailViewModal.css';
import CategoryTags from '../CategoryTags/CategoryTags';

/**
 * 详情查看弹窗组件
 * @param {boolean} show - 是否显示弹窗
 * @param {function} onClose - 关闭弹窗回调
 * @param {string} title - 弹窗标题
 * @param {string} content - 要显示的内容（支持 \n 换行）
 * @param {Array} categoryIds - 分类ID数组（可选）
 * @param {Array} categories - 所有分类列表（可选）
 */
function DetailViewModal({ show, onClose, title, content, categoryIds = [], categories = [] }) {
  if (!show) return null;

  // 处理换行符，将 \n 转换为实际的换行
  // 优化显示：代码字段加粗并换颜色，过滤创建时间和更新时间
  const formatContent = (text) => {
    if (!text) return '';
    
    const lines = text.split('\n')
      .filter(line => {
        // 过滤掉创建时间和更新时间
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('创建时间') && !trimmed.startsWith('更新时间');
      })
      .filter(line => line.trim()); // 过滤空行
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      const separator = trimmed.includes('：') ? '：' : (trimmed.includes(':') ? ':' : null);
      
      // 如果包含标签：值格式
      if (separator) {
        const parts = line.split(separator);
        const label = parts[0].trim();
        const value = parts.slice(1).join(separator).trim();
        
        // 检查是否是"代码："行
        const isCodeField = label === '代码';
        
        return (
          <div key={index} style={{ marginBottom: index < lines.length - 1 ? '12px' : 0, lineHeight: '1.8' }}>
            <span style={{ fontWeight: 600 }}>{label}{separator}</span>
            {isCodeField ? (
              <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{value}</span>
            ) : (
              <span>{value}</span>
            )}
          </div>
        );
      }
      
      // 其他行正常显示
      return (
      <React.Fragment key={index}>
        {line}
          {index < lines.length - 1 && <br />}
      </React.Fragment>
      );
    });
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="detail-modal-body">
          {categoryIds && categoryIds.length > 0 && categories.length > 0 && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line-divider)' }}>
              <div style={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>分类：</div>
              <CategoryTags
                categoryIds={categoryIds}
                categories={categories}
                showAll={true}
              />
            </div>
          )}
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



