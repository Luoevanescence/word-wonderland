import React, { useState, useEffect } from 'react';
import './Card.css';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';
import RelatedTag from '../RelatedTag';
import { getCategories } from '../../services/api';

function WordCard({ word, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState([]); // 存储所有分类

  // 获取分类ID数组
  const categoryIds = word.categoryIds || (word.categoryId ? [word.categoryId] : []);

  // 获取所有分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // 获取分类名称
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : null;
  };

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

  return (
    <div
      className={`card ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="card-header">
        <div style={{ flex: 1 }}>
        <h3 className="card-title">{word.word}</h3>
        </div>
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
        <div className="">
          {/* 显示分类标签 */}
          {categoryIds.length > 0 && categories.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categoryIds.map((categoryId) => {
                const categoryName = getCategoryName(categoryId);
                return categoryName ? (
                  <RelatedTag
                    key={categoryId}
                    type="category"
                    label={categoryName}
                    onClick={undefined}
                  />
                ) : null;
              })}
            </div>
          )}
          {word.definitions && word.definitions.length > 0 ? (
            word.definitions.map((def, idx) => (
              <div key={idx} className="definition">
                <span className="part-of-speech">{def.partOfSpeech}</span>
                <span className="meaning">{formatText(def.meaning)}</span>
              </div>
            ))
          ) : (
            <div className="no-definitions">暂无释义</div>
          )}
        </div>
      )}
    </div>
  );
}

export default WordCard;

