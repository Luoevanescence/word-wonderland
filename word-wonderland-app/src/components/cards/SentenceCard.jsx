import React, { useState } from 'react';
import './Card.css';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';

function SentenceCard({ sentence, index }) {
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
        <h3 className="card-title sentence-title">{sentence.sentence}</h3>
        <span className="expand-icon">
          {isExpanded ? (
            <ChevronUpIcon color="#f59e0b" />
          ) : (
            <ChevronDownIcon color="#10b981" />
          )}
        </span>
      </div>
      {isExpanded && (
        <div className="card-content">
          <div className="translation-text">{formatText(sentence.translation)}</div>
          {sentence.note && (
            <div className="note-text">
              <strong>备注：</strong> {formatText(sentence.note)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SentenceCard;

