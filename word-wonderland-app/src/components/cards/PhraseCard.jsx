import React, { useState, useEffect } from 'react';
import './Card.css';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';
import RelatedTag from '../RelatedTag';
import DetailModal from '../DetailModal';
import { getWordById } from '../../services/api';

function PhraseCard({ phrase, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailModal, setDetailModal] = useState({ show: false, data: null, loading: false });
  const [wordNames, setWordNames] = useState({}); // 存储单词ID到单词名称的映射

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

  // 获取关联的单词ID
  const wordIds = phrase.wordIds || (Array.isArray(phrase.words) ? phrase.words.map(w => w.id || w) : []);

  // 从关联数据中获取名称（如果已包含在响应中）
  const getWordNameFromResponse = (id) => {
    if (Array.isArray(phrase.words)) {
      const word = phrase.words.find(w => (w.id || w) === id);
      return word ? word.word : null;
    }
    return null;
  };

  // 批量获取单词名称
  useEffect(() => {
    if (wordIds.length === 0) return;

    const fetchWordNames = async () => {
      const newNames = {};
      
      // 并行获取所有单词的名称
      const promises = wordIds.map(async (id) => {
        // 先检查响应中是否已包含
        const nameFromResponse = getWordNameFromResponse(id);
        if (nameFromResponse) {
          newNames[id] = nameFromResponse;
          return;
        }
        
        // 检查缓存
        if (wordNames[id]) {
          newNames[id] = wordNames[id];
          return;
        }
        
        // 否则通过API获取
        try {
          const response = await getWordById(id);
          if (response.data.data && response.data.data.word) {
            newNames[id] = response.data.data.word;
          }
        } catch (error) {
          console.error(`Error fetching word ${id}:`, error);
          newNames[id] = null;
        }
      });
      
      await Promise.all(promises);
      // 合并现有缓存和新获取的名称
      setWordNames(prev => ({ ...prev, ...newNames }));
    };

    fetchWordNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIds.join(',')]); // 当wordIds变化时重新获取

  // 获取单词显示名称
  const getWordDisplayName = (id) => {
    // 优先从响应数据中获取
    const nameFromResponse = getWordNameFromResponse(id);
    if (nameFromResponse) return nameFromResponse;
    
    // 其次从缓存中获取
    if (wordNames[id]) return wordNames[id];
    
    // 如果都没有，返回 null（暂时不显示，等待加载）
    return null;
  };

  // 处理标签点击，显示详情
  const handleTagClick = async (id, displayName) => {
    setDetailModal({ show: true, data: null, loading: true });
    
    try {
      const response = await getWordById(id);
      setDetailModal({ 
        show: true, 
        data: response.data.data, 
        loading: false,
        displayName 
      });
    } catch (error) {
      console.error('Error fetching word detail:', error);
      setDetailModal({ show: true, data: null, loading: false, displayName, error: true });
    }
  };

  // 渲染详情内容
  const renderDetailContent = () => {
    if (detailModal.loading) {
      return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>;
    }
    
    if (detailModal.error) {
      return <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>加载失败，请重试</div>;
    }

    const data = detailModal.data;
    if (!data) return null;

    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: 'var(--brand-primary)', fontSize: '18px' }}>{data.word || detailModal.displayName}</strong>
        </div>
        {data.definitions && data.definitions.length > 0 && (
          <div>
            {data.definitions.map((def, idx) => (
              <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < data.definitions.length - 1 ? '1px solid #eee' : 'none' }}>
                <div style={{ fontWeight: 600, color: 'var(--brand-accent-text)', marginBottom: '8px' }}>
                  {def.partOfSpeech}
                </div>
                <div style={{ color: '#666', lineHeight: '1.8' }}>{formatText(def.meaning)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <div 
      className={`card ${isExpanded ? 'expanded' : 'collapsed'}`} 
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="card-header">
        <h3 className="card-title">{phrase.phrase}</h3>
        <span className="expand-icon">
          {isExpanded ? (
              <ChevronUpIcon
                bookColor="#059669"  // 深薄荷绿（Emerald-600，与折叠状态呼应）
                pageColor="#D1FAE5"  // 浅薄荷绿（Emerald-100，柔和清新）
                bookmarkColor="#D97706"  // 深琥珀色（Amber-600，温暖且与浅色书页形成对比）
              />
          ) : (
              <ChevronDownIcon
                bookColor="#10B981"   // 薄荷绿主体
                bookmarkColor="#FAD15A" // 暖黄书签
              />
          )}
        </span>
      </div>
      {isExpanded && (
        <div className="card-content">
          <div className="meaning-text">{formatText(phrase.meaning)}</div>
            
            {/* 关联单词标签区域 */}
            {wordIds.length > 0 && (
              <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                {wordIds.map((id) => {
                  const displayName = getWordDisplayName(id);
                  // 如果名称还在加载中，暂时不显示或显示加载状态
                  if (displayName === null) {
                    return null; // 或者可以显示一个加载中的标签
                  }
                  return (
                    <RelatedTag
                      key={`word-${id}`}
                      type="word"
                      label={displayName}
                      onClick={() => handleTagClick(id, displayName)}
                    />
                  );
                })}
              </div>
            )}
            
          {phrase.example && (
            <div className="example-text">
              <strong>例句：</strong> {formatText(phrase.example)}
            </div>
          )}
        </div>
      )}
    </div>

      {/* 详情弹窗 */}
      <DetailModal
        show={detailModal.show}
        onClose={() => setDetailModal({ show: false, data: null, loading: false })}
        title="单词详情"
      >
        {renderDetailContent()}
      </DetailModal>
    </>
  );
}

export default PhraseCard;

