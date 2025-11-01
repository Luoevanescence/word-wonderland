import React, { useState, useEffect } from 'react';
import './Card.css';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';
import RelatedTag from '../RelatedTag';
import DetailModal from '../DetailModal';
import { getWordById, getPhraseById, getPatternById } from '../../services/api';

function SentenceCard({ sentence, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailModal, setDetailModal] = useState({ show: false, type: null, data: null, loading: false });
  const [wordNames, setWordNames] = useState({}); // 存储单词ID到单词名称的映射
  const [phraseNames, setPhraseNames] = useState({}); // 存储短语ID到短语名称的映射
  const [patternNames, setPatternNames] = useState({}); // 存储句型ID到句型名称的映射

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

  // 获取关联的句型、单词、短语ID
  const patternIds = sentence.patternIds || (Array.isArray(sentence.patterns) ? sentence.patterns.map(p => p.id || p) : []);
  const wordIds = sentence.wordIds || (Array.isArray(sentence.words) ? sentence.words.map(w => w.id || w) : []);
  const phraseIds = sentence.phraseIds || (Array.isArray(sentence.phrases) ? sentence.phrases.map(p => p.id || p) : []);

  // 从关联数据中获取名称（如果已包含在响应中）
  const getPatternNameFromResponse = (id) => {
    if (Array.isArray(sentence.patterns)) {
      const pattern = sentence.patterns.find(p => (p.id || p) === id);
      return pattern ? (pattern.pattern || pattern.name) : null;
    }
    return null;
  };

  const getWordNameFromResponse = (id) => {
    if (Array.isArray(sentence.words)) {
      const word = sentence.words.find(w => (w.id || w) === id);
      return word ? word.word : null;
    }
    return null;
  };

  const getPhraseNameFromResponse = (id) => {
    if (Array.isArray(sentence.phrases)) {
      const phrase = sentence.phrases.find(p => (p.id || p) === id);
      return phrase ? phrase.phrase : null;
    }
    return null;
  };

  // 批量获取名称
  useEffect(() => {
    const fetchNames = async () => {
      const newWordNames = {};
      const newPhraseNames = {};
      const newPatternNames = {};
      
      // 获取单词名称
      if (wordIds.length > 0) {
        const wordPromises = wordIds.map(async (id) => {
          // 先检查响应中是否已包含
          const nameFromResponse = getWordNameFromResponse(id);
          if (nameFromResponse) {
            newWordNames[id] = nameFromResponse;
            return;
          }
          
          // 检查缓存
          if (wordNames[id]) {
            newWordNames[id] = wordNames[id];
            return;
          }
          
          // 否则通过API获取
          try {
            const response = await getWordById(id);
            if (response.data.data && response.data.data.word) {
              newWordNames[id] = response.data.data.word;
            }
          } catch (error) {
            console.error(`Error fetching word ${id}:`, error);
            newWordNames[id] = null;
          }
        });
        await Promise.all(wordPromises);
      }
      
      // 获取短语名称
      if (phraseIds.length > 0) {
        const phrasePromises = phraseIds.map(async (id) => {
          const nameFromResponse = getPhraseNameFromResponse(id);
          if (nameFromResponse) {
            newPhraseNames[id] = nameFromResponse;
            return;
          }
          
          if (phraseNames[id]) {
            newPhraseNames[id] = phraseNames[id];
            return;
          }
          
          try {
            const response = await getPhraseById(id);
            if (response.data.data && response.data.data.phrase) {
              newPhraseNames[id] = response.data.data.phrase;
            }
          } catch (error) {
            console.error(`Error fetching phrase ${id}:`, error);
            newPhraseNames[id] = null;
          }
        });
        await Promise.all(phrasePromises);
      }
      
      // 获取句型名称
      if (patternIds.length > 0) {
        const patternPromises = patternIds.map(async (id) => {
          const nameFromResponse = getPatternNameFromResponse(id);
          if (nameFromResponse) {
            newPatternNames[id] = nameFromResponse;
            return;
          }
          
          if (patternNames[id]) {
            newPatternNames[id] = patternNames[id];
            return;
          }
          
          try {
            const response = await getPatternById(id);
            if (response.data.data && (response.data.data.pattern || response.data.data.name)) {
              newPatternNames[id] = response.data.data.pattern || response.data.data.name;
            }
          } catch (error) {
            console.error(`Error fetching pattern ${id}:`, error);
            newPatternNames[id] = null;
          }
        });
        await Promise.all(patternPromises);
      }
      
      // 合并现有缓存和新获取的名称
      setWordNames(prev => ({ ...prev, ...newWordNames }));
      setPhraseNames(prev => ({ ...prev, ...newPhraseNames }));
      setPatternNames(prev => ({ ...prev, ...newPatternNames }));
    };

    fetchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIds.join(','), phraseIds.join(','), patternIds.join(',')]);

  // 获取显示名称
  const getWordDisplayName = (id) => {
    const nameFromResponse = getWordNameFromResponse(id);
    if (nameFromResponse) return nameFromResponse;
    if (wordNames[id]) return wordNames[id];
    return null;
  };

  const getPhraseDisplayName = (id) => {
    const nameFromResponse = getPhraseNameFromResponse(id);
    if (nameFromResponse) return nameFromResponse;
    if (phraseNames[id]) return phraseNames[id];
    return null;
  };

  const getPatternDisplayName = (id) => {
    const nameFromResponse = getPatternNameFromResponse(id);
    if (nameFromResponse) return nameFromResponse;
    if (patternNames[id]) return patternNames[id];
    return null;
  };

  // 处理标签点击，显示详情
  const handleTagClick = async (type, id, displayName) => {
    setDetailModal({ show: true, type, data: null, loading: true });
    
    try {
      let response;
      switch (type) {
        case 'pattern':
          response = await getPatternById(id);
          break;
        case 'word':
          response = await getWordById(id);
          break;
        case 'phrase':
          response = await getPhraseById(id);
          break;
        default:
          return;
      }
      
      setDetailModal({ 
        show: true, 
        type, 
        data: response.data.data, 
        loading: false,
        displayName 
      });
    } catch (error) {
      console.error(`Error fetching ${type} detail:`, error);
      setDetailModal({ show: true, type, data: null, loading: false, displayName, error: true });
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

    switch (detailModal.type) {
      case 'pattern':
        return (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: 'var(--brand-primary)', fontSize: '18px' }}>{data.pattern || detailModal.displayName}</strong>
            </div>
            {data.description && (
              <div style={{ marginBottom: '12px', lineHeight: '1.8' }}>
                <strong>描述：</strong>
                <div style={{ marginTop: '8px', color: '#666' }}>{formatText(data.description)}</div>
              </div>
            )}
            {data.example && (
              <div style={{ marginBottom: '12px', lineHeight: '1.8' }}>
                <strong>示例：</strong>
                <div style={{ marginTop: '8px', color: '#666', fontStyle: 'italic' }}>{formatText(data.example)}</div>
              </div>
            )}
            {data.translation && (
              <div style={{ marginBottom: '12px', lineHeight: '1.8' }}>
                <strong>翻译：</strong>
                <div style={{ marginTop: '8px', color: '#666' }}>{formatText(data.translation)}</div>
              </div>
            )}
          </div>
        );
      case 'word':
        return (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: 'var(--brand-primary)', fontSize: '18px' }}>{data.word || detailModal.displayName}</strong>
            </div>
            {data.definitions && data.definitions.length > 0 && (
              <div>
                {data.definitions.map((def, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < data.definitions.length - 1 ? '1px solid #eee' : 'none' }}>
                    <div style={{ fontWeight: 600, color: 'var(--brand-accent)', marginBottom: '8px' }}>
                      {def.partOfSpeech}
                    </div>
                    <div style={{ color: '#666', lineHeight: '1.8' }}>{formatText(def.meaning)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'phrase':
        return (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: 'var(--brand-primary)', fontSize: '18px' }}>{data.phrase || detailModal.displayName}</strong>
            </div>
            {data.meaning && (
              <div style={{ marginBottom: '12px', lineHeight: '1.8' }}>
                <strong>含义：</strong>
                <div style={{ marginTop: '8px', color: '#666' }}>{formatText(data.meaning)}</div>
              </div>
            )}
            {data.example && (
              <div style={{ marginBottom: '12px', lineHeight: '1.8' }}>
                <strong>例句：</strong>
                <div style={{ marginTop: '8px', color: '#666', fontStyle: 'italic' }}>{formatText(data.example)}</div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <div 
      className={`card ${isExpanded ? 'expanded' : 'collapsed'}`} 
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="card-header">
        <h3 className="card-title sentence-title">{sentence.sentence}</h3>
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
          <div className="translation-text">{formatText(sentence.translation)}</div>
            
            {/* 关联标签区域 */}
            {(patternIds.length > 0 || wordIds.length > 0 || phraseIds.length > 0) && (
              <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                {patternIds.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    {patternIds.map((id) => {
                      const displayName = getPatternDisplayName(id);
                      if (displayName === null) return null;
                      return (
                        <RelatedTag
                          key={`pattern-${id}`}
                          type="pattern"
                          label={displayName}
                          onClick={() => handleTagClick('pattern', id, displayName)}
                        />
                      );
                    })}
                  </div>
                )}
                {wordIds.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    {wordIds.map((id) => {
                      const displayName = getWordDisplayName(id);
                      if (displayName === null) return null;
                      return (
                        <RelatedTag
                          key={`word-${id}`}
                          type="word"
                          label={displayName}
                          onClick={() => handleTagClick('word', id, displayName)}
                        />
                      );
                    })}
                  </div>
                )}
                {phraseIds.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    {phraseIds.map((id) => {
                      const displayName = getPhraseDisplayName(id);
                      if (displayName === null) return null;
                      return (
                        <RelatedTag
                          key={`phrase-${id}`}
                          type="phrase"
                          label={displayName}
                          onClick={() => handleTagClick('phrase', id, displayName)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
          {sentence.note && (
            <div className="note-text">
              <strong>备注：</strong> {formatText(sentence.note)}
            </div>
          )}
        </div>
      )}
    </div>

      {/* 详情弹窗 */}
      <DetailModal
        show={detailModal.show}
        onClose={() => setDetailModal({ show: false, type: null, data: null, loading: false })}
        title={detailModal.type === 'pattern' ? '句型详情' : detailModal.type === 'word' ? '单词详情' : '短语详情'}
      >
        {renderDetailContent()}
      </DetailModal>
    </>
  );
}

export default SentenceCard;

