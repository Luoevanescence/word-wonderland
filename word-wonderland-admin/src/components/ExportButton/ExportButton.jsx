import React from 'react';
import './ExportButton.css';

/**
 * 导出按钮组件
 * @param {Object} props
 * @param {Function} props.onExport - 点击导出时的回调函数
 * @param {Function} props.onExportSelected - 导出选中项的回调函数（可选）
 * @param {number} props.selectedCount - 选中的项目数量（可选）
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.label - 按钮文字
 */
function ExportButton({ 
  onExport, 
  onExportSelected, 
  selectedCount = 0, 
  disabled = false,
  label = '导出 JSON'
}) {
  const hasSelected = selectedCount > 0;

  return (
    <div className="export-button-group">
      <button
        onClick={onExport}
        disabled={disabled}
        className="btn btn-export"
        title="导出所有数据为 JSON 文件"
      >
        <span className="btn-icon">📥</span>
        {label}
      </button>

      {onExportSelected && hasSelected && (
        <button
          onClick={onExportSelected}
          className="btn btn-export-selected"
          title={`导出选中的 ${selectedCount} 项`}
        >
          <span className="btn-icon">📦</span>
          导出选中 ({selectedCount})
        </button>
      )}
    </div>
  );
}

export default ExportButton;

