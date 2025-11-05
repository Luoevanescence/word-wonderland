import React from 'react';
import './CategoryTags.css';

/**
 * 分类标签组件
 * @param {Array} categoryIds - 分类ID数组
 * @param {Array} categories - 所有分类列表
 * @param {boolean} showAll - 是否显示所有标签（默认false，表格视图）
 * @param {number} maxTags - 最大显示标签数（仅在showAll=false时生效，默认不限制）
 */
function CategoryTags({ categoryIds = [], categories = [], showAll = false, maxTags }) {
  // 获取分类信息
  const getCategoryInfo = (categoryIds) => {
    const ids = categoryIds 
      ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds])
      : [];
    
    if (ids.length === 0) return [];

    return ids
      .map(id => {
        const category = categories.find(c => c.id === id);
        return category ? { id: category.id, name: category.name } : null;
      })
      .filter(Boolean);
  };

  const categoryInfos = getCategoryInfo(categoryIds);

  if (categoryInfos.length === 0) {
    return <span className="category-tag category-tag-empty">未分类</span>;
  }

  // 生成标签颜色（基于标签索引）
  const getTagColor = (index) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // orange
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];
    return colors[index % colors.length];
  };

  // 如果showAll为true，显示所有标签
  if (showAll) {
    return (
      <div className="category-tags-container category-tags-show-all">
        {categoryInfos.map((cat, index) => (
          <span
            key={cat.id}
            className="category-tag"
            style={{ backgroundColor: getTagColor(index) }}
          >
            {cat.name}
          </span>
        ))}
      </div>
    );
  }

  // 表格视图：单行显示，溢出省略
  // 由于CSS难以精确检测溢出，我们通过显示所有标签，然后用CSS控制溢出
  // 如果标签数量较多，可以考虑显示前几个标签 + 省略号
  const shouldShowEllipsis = categoryInfos.length > 3; // 超过3个标签时显示省略号
  const displayTags = shouldShowEllipsis ? categoryInfos.slice(0, 2) : categoryInfos;
  const hasMore = categoryInfos.length > displayTags.length;

  return (
    <div className="category-tags-container category-tags-inline">
      <div className="category-tags-wrapper">
        {displayTags.map((cat, index) => (
          <span
            key={cat.id}
            className="category-tag"
            style={{ backgroundColor: getTagColor(index) }}
          >
            {cat.name}
          </span>
        ))}
        {hasMore && (
          <span className="category-tag category-tag-more">
            +{categoryInfos.length - displayTags.length}
          </span>
        )}
        {hasMore && <span className="category-tags-ellipsis">...</span>}
      </div>
    </div>
  );
}

export default CategoryTags;



