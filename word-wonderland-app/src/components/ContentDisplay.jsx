import React, { useState, useEffect } from 'react';
import {
  getRandomWords,
  getRandomPhrases,
  getRandomSentences,
  getRandomPatterns,
  getRandomTopics
} from '../services/api';
import WordCard from './cards/WordCard';
import PhraseCard from './cards/PhraseCard';
import SentenceCard from './cards/SentenceCard';
import PatternCard from './cards/PatternCard';
import TopicCard from './cards/TopicCard';
import './ContentDisplay.css';

function ContentDisplay({ category, count, setCount }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCount, setInputCount] = useState(count);

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      switch (category) {
        case 'words':
          response = await getRandomWords(count);
          break;
        case 'phrases':
          response = await getRandomPhrases(count);
          break;
        case 'sentences':
          response = await getRandomSentences(count);
          break;
        case 'patterns':
          response = await getRandomPatterns(count);
          break;
        case 'topics':
          response = await getRandomTopics(count);
          break;
        default:
          response = { data: { data: [] } };
      }
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setCount(inputCount);
    fetchItems();
  };

  const renderCard = (item, index) => {
    switch (category) {
      case 'words':
        return <WordCard key={item.id} word={item} index={index} />;
      case 'phrases':
        return <PhraseCard key={item.id} phrase={item} index={index} />;
      case 'sentences':
        return <SentenceCard key={item.id} sentence={item} index={index} />;
      case 'patterns':
        return <PatternCard key={item.id} pattern={item} index={index} />;
      case 'topics':
        return <TopicCard key={item.id} topic={item} index={index} />;
      default:
        return null;
    }
  };

  const getCategoryLabel = () => {
    const labels = {
      words: '单词',
      phrases: '短语',
      sentences: '句子',
      patterns: '句型',
      topics: '主题'
    };
    return labels[category] || '';
  };

  return (
    <div className="content-display">
      <div className="controls">
        <div className="count-control">
          <label htmlFor="count">项目数量：</label>
          <input
            id="count"
            type="number"
            min="1"
            max="50"
            value={inputCount}
            onChange={(e) => setInputCount(parseInt(e.target.value) || 1)}
          />
        </div>
        <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
          {loading ? '🔄 加载中...' : `🎲 获取随机${getCategoryLabel()}`}
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>正在加载精彩内容...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>暂无{getCategoryLabel()}</h3>
          <p>请先在管理后台添加{getCategoryLabel()}！</p>
        </div>
      ) : (
        <div className="cards-grid">
          {items.map((item, index) => renderCard(item, index))}
        </div>
      )}
    </div>
  );
}

export default ContentDisplay;
