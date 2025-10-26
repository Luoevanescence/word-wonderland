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
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import './ContentDisplay.css';

function ContentDisplay({ category, count, setCount }) {
  const [items, setItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCount, setInputCount] = useState(count);
  
  // 懒加载观察器
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });

  useEffect(() => {
    setItems([]); // 立即清空旧数据，避免类型不匹配
    setDisplayedItems([]); // 清空已显示的项
    fetchItems();
  }, [category]);

  // 懒加载：每次显示一部分数据
  useEffect(() => {
    if (items.length > 0) {
      // 初始显示前10个
      setDisplayedItems(items.slice(0, 10));
    }
  }, [items]);

  // 监听滚动到底部，加载更多
  useEffect(() => {
    if (inView && displayedItems.length < items.length) {
      const nextBatch = items.slice(0, displayedItems.length + 10);
      setDisplayedItems(nextBatch);
    }
  }, [inView, items, displayedItems.length]);

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
    if (loading) return; // 防止重复点击
    setCount(inputCount);
    fetchItems();
  };

  const renderCard = (item, index) => {
    switch (category) {
      case 'words':
        return <WordCard key={`${item.id}-${index}`} word={item} index={index} />;
      case 'phrases':
        return <PhraseCard key={`${item.id}-${index}`} phrase={item} index={index} />;
      case 'sentences':
        return <SentenceCard key={`${item.id}-${index}`} sentence={item} index={index} />;
      case 'patterns':
        return <PatternCard key={`${item.id}-${index}`} pattern={item} index={index} />;
      case 'topics':
        return <TopicCard key={`${item.id}-${index}`} topic={item} index={index} />;
      default:
        return null;
    }
  };

  // 瀑布流列数配置
  const breakpointColumns = {
    default: 3,  // 默认3列
    1600: 4,     // >= 1600px 显示4列
    1200: 3,     // >= 1200px 显示3列
    768: 2,      // >= 768px 显示2列
    500: 1       // < 500px 显示1列
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
        <>
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {displayedItems.map((item, index) => renderCard(item, index))}
          </Masonry>
          
          {/* 懒加载触发器 */}
          {displayedItems.length < items.length && (
            <div ref={loadMoreRef} className="load-more-trigger">
              <div className="spinner-small"></div>
              <p>加载更多...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ContentDisplay;
