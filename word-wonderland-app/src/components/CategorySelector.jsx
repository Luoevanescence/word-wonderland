import React from 'react';
import './CategorySelector.css';

import { WordsIcon, PhrasesIcon, SentencesIcon, PatternsIcon, TopicsIcon } from './icons/Icons';

const categories = [
  { id: 'words',    label: '单词', icon: <WordsIcon /> },
  { id: 'phrases',  label: '短语', icon: <PhrasesIcon /> },
  { id: 'sentences',label: '句子', icon: <SentencesIcon /> },
  { id: 'patterns', label: '句型', icon: <PatternsIcon /> },
  { id: 'topics',   label: '主题', icon: <TopicsIcon /> }
];

function CategorySelector({ activeCategory, setActiveCategory }) {
  return (
    <div className="category-selector">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => setActiveCategory(category.id)}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-label">{category.label}</span>
        </button>
      ))}
    </div>
  );
}

export default CategorySelector;

