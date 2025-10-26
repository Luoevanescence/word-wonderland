import React from 'react';
import './Card.css';

function WordCard({ word, index }) {
  return (
    <div className="card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-header">
        <h3 className="card-title">{word.word}</h3>
      </div>
      <div className="card-content">
        {word.definitions.map((def, idx) => (
          <div key={idx} className="definition">
            <span className="part-of-speech">{def.partOfSpeech}</span>
            <span className="meaning">{def.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordCard;

