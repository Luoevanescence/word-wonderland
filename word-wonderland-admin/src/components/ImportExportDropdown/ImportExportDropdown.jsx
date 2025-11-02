import React, { useState, useRef, useEffect } from 'react';
import './ImportExportDropdown.css';
import { ExcelIcon, JSONIcon, TemplateIcon, ImportIcon, ExportIcon, ChevronDownSmallIcon } from '../icons/ImportExportIcons';

/**
 * 导入导出下拉菜单组件
 * @param {string} type - 'import' 或 'export'
 * @param {object} handlers - 各种处理函数
 * @param {boolean} disabled - 是否禁用
 * @param {number} selectedCount - 已选中的数据数量
 */
function ImportExportDropdown({ type, handlers, disabled, selectedCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (handler) => {
    handler();
    setIsOpen(false);
  };

  if (type === 'import') {
    return (
      <div className="ie-dropdown" ref={dropdownRef}>
        <button 
          className="btn btn-success ie-dropdown-btn" 
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <ImportIcon color="currentColor" />
          <span>导入</span>
          <ChevronDownSmallIcon color="currentColor" />
        </button>
         {isOpen && (
           <div className="ie-dropdown-menu">
             <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onExcelImport)}>
               <span className="ie-icon">
                 <ExcelIcon color="#10B981" />
               </span>
               <div className="ie-item-content">
                 <div className="ie-item-title">Excel 导入</div>
                 <div className="ie-item-desc">批量导入 .xlsx 或 .xls 文件</div>
               </div>
             </div>
             <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onJSONImport)}>
               <span className="ie-icon">
                 <JSONIcon color="#3B82F6" />
               </span>
               <div className="ie-item-content">
                 <div className="ie-item-title">JSON 导入</div>
                 <div className="ie-item-desc">导入 JSON 格式数据</div>
               </div>
             </div>
             <div className="ie-dropdown-divider"></div>
             <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onDownloadTemplate)}>
               <span className="ie-icon">
                 <TemplateIcon color="#F59E0B" />
               </span>
               <div className="ie-item-content">
                 <div className="ie-item-title">下载模板</div>
                 <div className="ie-item-desc">下载 Excel 导入模板</div>
               </div>
             </div>
           </div>
         )}
      </div>
    );
  }

  if (type === 'export') {
    const hasSelection = selectedCount > 0;
    
    return (
      <div className="ie-dropdown" ref={dropdownRef}>
        <button 
          className="btn btn-info ie-dropdown-btn" 
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <ExportIcon color="currentColor" />
          <span>导出</span>
          <ChevronDownSmallIcon color="currentColor" />
        </button>
         {isOpen && (
           <div className="ie-dropdown-menu">
             <div className="ie-dropdown-section-title">全部导出</div>
             <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onExportAllExcel)}>
               <span className="ie-icon">
                 <ExcelIcon color="#10B981" />
               </span>
               <div className="ie-item-content">
                 <div className="ie-item-title">导出为 Excel</div>
                 <div className="ie-item-desc">导出所有数据为 .xlsx 文件</div>
               </div>
             </div>
             <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onExportAllJSON)}>
               <span className="ie-icon">
                 <JSONIcon color="#3B82F6" />
               </span>
               <div className="ie-item-content">
                 <div className="ie-item-title">导出为 JSON</div>
                 <div className="ie-item-desc">导出所有数据为 .json 文件</div>
               </div>
             </div>
             
             {hasSelection && (
               <>
                 <div className="ie-dropdown-divider"></div>
                 <div className="ie-dropdown-section-title">
                   选中导出 <span className="ie-count-badge">{selectedCount}</span>
                 </div>
                 <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onExportSelectedExcel)}>
                   <span className="ie-icon">
                     <ExcelIcon color="#10B981" />
                   </span>
                   <div className="ie-item-content">
                     <div className="ie-item-title">导出为 Excel</div>
                     <div className="ie-item-desc">导出选中的 {selectedCount} 项</div>
                   </div>
                 </div>
                 <div className="ie-dropdown-item" onClick={() => handleItemClick(handlers.onExportSelectedJSON)}>
                   <span className="ie-icon">
                     <JSONIcon color="#3B82F6" />
                   </span>
                   <div className="ie-item-content">
                     <div className="ie-item-title">导出为 JSON</div>
                     <div className="ie-item-desc">导出选中的 {selectedCount} 项</div>
                   </div>
                 </div>
               </>
             )}
           </div>
         )}
      </div>
    );
  }

  return null;
}

export default ImportExportDropdown;


