import React, { useState } from 'react';
import './Card.css';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';

function PatternCard({ pattern, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 处理换行符，将 \n 转换为 <br />
  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div 
      className={`card ${isExpanded ? 'expanded' : 'collapsed'}`} 
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="card-header">
        <h3 className="card-title pattern-title">{pattern.pattern}</h3>
        <span className="expand-icon">
          {isExpanded ? (
            <ChevronUpIcon
              bookColor="#059669"  // 深薄荷绿（Emerald-600，与折叠状态呼应）
              pageColor="#D1FAE5"  // 浅薄荷绿（Emerald-100，柔和清新）
              bookmarkColor="#D97706"  // 深琥珀色（Amber-600，温暖且与浅色书页形成对比）
            />
          ) : (
            <ChevronDownIcon
              bookColor="#10B981"   // 薄荷绿主体
              bookmarkColor="#FAD15A" // 暖黄书签
            />
          )}
        </span>
      </div>
      {isExpanded && (
        <div className="card-content">
          <div className="description-text">{formatText(pattern.description)}</div>
          {pattern.example && (
            <div className="example-section">
              <div className="example-text">{formatText(pattern.example)}</div>
              {pattern.translation && (
                <div className="translation-text">{formatText(pattern.translation)}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatternCard;

