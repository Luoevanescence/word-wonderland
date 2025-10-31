import React from 'react';
import './RelatedTag.css';

/**
 * 关联项标签组件
 * @param {string} type - 标签类型：'pattern' | 'word' | 'phrase'
 * @param {string} label - 标签文本
 * @param {function} onClick - 点击回调
 */
function RelatedTag({ type, label, onClick }) {
  return (
    <span 
      className={`related-tag related-tag-${type}`}
      onClick={(e) => {
        e.stopPropagation(); // 阻止事件冒泡到卡片
        if (onClick) onClick();
      }}
    >
      {label}
    </span>
  );
}

export default RelatedTag;

