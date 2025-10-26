import React, { useState } from 'react';
import './Card.css';

function PhraseCard({ phrase, index }) {
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
        <h3 className="card-title">{phrase.phrase}</h3>
        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="card-content">
          <div className="meaning-text">{formatText(phrase.meaning)}</div>
          {phrase.example && (
            <div className="example-text">
              <strong>例句：</strong> {formatText(phrase.example)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PhraseCard;

