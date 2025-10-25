import React from 'react';
import './Card.css';

function PatternCard({ pattern, index }) {
  return (
    <div className="card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-header">
        <h3 className="card-title pattern-title">{pattern.pattern}</h3>
      </div>
      <div className="card-content">
        <div className="description-text">{pattern.description}</div>
        {pattern.example && (
          <div className="example-section">
            <div className="example-text">{pattern.example}</div>
            {pattern.translation && (
              <div className="translation-text">{pattern.translation}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatternCard;

