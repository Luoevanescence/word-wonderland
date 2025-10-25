import React from 'react';
import './Card.css';

function TopicCard({ topic, index }) {
  return (
    <div className="card topic-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-header">
        <h3 className="card-title">🏷️ {topic.name}</h3>
      </div>
      {topic.description && (
        <div className="card-content">
          <div className="description-text">{topic.description}</div>
        </div>
      )}
    </div>
  );
}

export default TopicCard;

