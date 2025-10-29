import React, { useState } from 'react';
import './Card.css';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';

function TopicCard({ topic, index }) {
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
      className={`card topic-card ${isExpanded ? 'expanded' : 'collapsed'}`} 
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="card-header">
        <h3 className="card-title">🏷️ {topic.name}</h3>
        <span className="expand-icon">
          {isExpanded ? (
            <ChevronUpIcon color="#f59e0b" />
          ) : (
            <ChevronDownIcon color="#10b981" />
          )}
        </span>
      </div>
      {isExpanded && topic.description && (
        <div className="card-content">
          <div className="description-text">{formatText(topic.description)}</div>
        </div>
      )}
    </div>
  );
}

export default TopicCard;

