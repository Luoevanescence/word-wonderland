import React from 'react';
import './CategorySelector.css';

const categories = [
  { id: 'words', label: '单词', icon: '📝' },
  { id: 'phrases', label: '短语', icon: '🔤' },
  { id: 'sentences', label: '句子', icon: '📖' },
  { id: 'patterns', label: '句型', icon: '🎯' },
  { id: 'topics', label: '主题', icon: '🏷️' }
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

