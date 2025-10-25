import React from 'react';
import './Card.css';

function PhraseCard({ phrase, index }) {
  return (
    <div className="card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-header">
        <h3 className="card-title">{phrase.phrase}</h3>
      </div>
      <div className="card-content">
        <div className="meaning-text">{phrase.meaning}</div>
        {phrase.example && (
          <div className="example-text">
            <strong>例句：</strong> {phrase.example}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhraseCard;

