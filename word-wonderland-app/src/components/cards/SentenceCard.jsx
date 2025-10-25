import React from 'react';
import './Card.css';

function SentenceCard({ sentence, index }) {
  return (
    <div className="card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-content">
        <div className="sentence-text">{sentence.sentence}</div>
        <div className="translation-text">{sentence.translation}</div>
        {sentence.note && (
          <div className="note-text">
            <strong>备注：</strong> {sentence.note}
          </div>
        )}
      </div>
    </div>
  );
}

export default SentenceCard;

