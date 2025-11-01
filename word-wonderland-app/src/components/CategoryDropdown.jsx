import React, { useState, useRef, useEffect } from 'react';
import { getCategories } from '../services/api';
import './CategoryDropdown.css';

function CategoryDropdown({ selectedCategoryId, onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 根据 selectedCategoryId 找到对应的选项
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === selectedCategoryId);
      if (category) {
        setSelectedOption({
          value: category.id,
          label: `${category.name}${category.code ? ` (${category.code})` : ''}`
        });
      } else {
        setSelectedOption(null);
      }
    } else {
      setSelectedOption(null);
    }
  }, [selectedCategoryId, categories]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!loading) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (category) => {
    if (category) {
      setSelectedOption({
        value: category.id,
        label: `${category.name}${category.code ? ` (${category.code})` : ''}`
      });
      onCategoryChange(category.id);
    } else {
      setSelectedOption(null);
      onCategoryChange(null);
    }
    setIsOpen(false);
  };

  // 构建选项列表
  const options = [
    { value: '', label: '默认', isDefault: true },
    ...categories.map(cat => ({
      value: cat.id,
      label: `${cat.name}${cat.code ? ` (${cat.code})` : ''}`,
      category: cat
    }))
  ];

  return (
    <div className="category-dropdown-wrapper">
      <label htmlFor="category-select">分类：</label>
      <div className="category-select" ref={selectRef}>
        <div
          className={`category-select-trigger ${isOpen ? 'open' : ''} ${!selectedOption ? 'placeholder' : ''} ${loading ? 'disabled' : ''}`}
          onClick={handleToggle}
        >
          <span className="category-select-value">
            {loading ? '加载中...' : (selectedOption ? selectedOption.label : '默认')}
          </span>
          <span className="category-select-arrow">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L1 4H11L6 9Z" fill="currentColor"/>
            </svg>
          </span>
        </div>

        {isOpen && !loading && (
          <div className="category-select-dropdown">
            <div className="category-select-options">
              {options.map((option) => (
                <div
                  key={option.value || 'default'}
                  className={`category-select-option ${selectedOption?.value === option.value ? 'selected' : ''} ${option.isDefault ? 'default-option' : ''}`}
                  onClick={() => handleSelect(option.category || null)}
                >
                  <span className="option-label">{option.label}</span>
                  {selectedOption?.value === option.value && (
                    <span className="option-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryDropdown;

