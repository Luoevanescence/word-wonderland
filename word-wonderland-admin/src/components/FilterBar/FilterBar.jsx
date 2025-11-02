import React, { useState, useEffect, useRef } from 'react';
import './FilterBar.css';
import { SearchIcon, ChevronDownSmallIcon, ChevronUpSmallIcon } from '../icons/ImportExportIcons';

/**
 * 筛选条件组件
 * @param {Array} filterFields - 筛选字段配置 [{ key: 'word', label: '单词', type: 'text' }]
 * @param {Function} onFilter - 筛选回调 (filters) => void
 * @param {Function} onReset - 重置回调
 */
function FilterBar({ filterFields, onFilter, onReset }) {
  const [filters, setFilters] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    // 只在组件挂载时初始化一次
    if (!isInitialized.current) {
      const initialFilters = {};
      filterFields.forEach(field => {
        initialFilters[field.key] = '';
      });
      setFilters(initialFilters);
      isInitialized.current = true;
    }
  }, [filterFields]);

  const handleInputChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFilter = () => {
    // 过滤掉空值
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value.trim();
      }
      return acc;
    }, {});
    onFilter(activeFilters);
  };

  const handleReset = () => {
    const resetFilters = {};
    filterFields.forEach(field => {
      resetFilters[field.key] = '';
    });
    setFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.trim() !== '');

  return (
    <div className={`filter-bar ${isExpanded ? 'expanded' : ''}`}>
      <div className="filter-bar-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filter-bar-title">
          <span className="filter-icon">
            <SearchIcon color="#10B981" />
          </span>
          <span>筛选条件</span>
          {hasActiveFilters && <span className="filter-active-badge">已筛选</span>}
        </div>
        <button className="filter-toggle-btn">
          {isExpanded ? (
            <ChevronUpSmallIcon color="currentColor" />
          ) : (
            <ChevronDownSmallIcon color="currentColor" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="filter-bar-content">
          <div className="filter-fields">
            {filterFields.map((field) => (
              <div key={field.key} className="filter-field">
                <label className="filter-label">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="filter-select"
                    value={filters[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                  >
                    <option value="">全部</option>
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="filter-input"
                    placeholder={field.placeholder || `输入${field.label}...`}
                    value={filters[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFilter();
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="filter-actions">
            <button 
              className="btn btn-secondary btn-small" 
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              disabled={!hasActiveFilters}
            >
              重置
            </button>
            <button 
              className="btn btn-primary btn-small" 
              onClick={(e) => {
                e.stopPropagation();
                handleFilter();
              }}
            >
              应用筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;


