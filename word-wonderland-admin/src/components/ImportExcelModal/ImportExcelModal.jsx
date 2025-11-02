import React, { useState, useRef } from 'react';
import './ImportExcelModal.css';
import { InstructionIcon, TipIcon, FolderIcon, CheckIcon, WarningIcon, DownloadIcon } from '../icons/ImportExportIcons';

/**
 * Excel 导入弹窗组件
 * @param {boolean} show - 是否显示弹窗
 * @param {function} onClose - 关闭弹窗回调
 * @param {function} onImport - 导入数据回调 (data) => Promise
 * @param {function} onDownloadTemplate - 下载模板回调
 * @param {string} title - 弹窗标题
 * @param {string} moduleName - 模块名称（用于提示）
 */
function ImportExcelModal({ show, onClose, onImport, onDownloadTemplate, title, moduleName }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!show) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 验证文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMessage('请选择有效的 Excel 文件（.xlsx 或 .xls）');
      setFile(null);
      return;
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setErrorMessage('文件大小不能超过 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
  };

  const handleImport = async () => {
    if (!file) {
      setErrorMessage('请先选择文件');
      return;
    }

    setImporting(true);
    setErrorMessage('');

    try {
      await onImport(file);
      // 导入成功后重置状态
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setErrorMessage(error.message || '导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setErrorMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'import-modal-overlay') {
      handleClose();
    }
  };

  return (
    <div className="import-modal-overlay" onClick={handleOverlayClick}>
      <div className="import-modal-content">
        <div className="import-modal-header">
          <h2>{title || `导入${moduleName}`}</h2>
          <button 
            className="import-modal-close" 
            onClick={handleClose}
            disabled={importing}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="import-modal-body">
          <div className="import-instructions">
            <h3>
              <InstructionIcon color="#667eea" /> 导入说明
            </h3>
            <ol>
              <li>点击下方"下载模板"按钮，下载 Excel 模板文件</li>
              <li>在模板中填写{moduleName}数据，注意必填字段不能为空</li>
              <li>选择填写好的 Excel 文件进行上传</li>
              <li>点击"开始导入"按钮完成导入</li>
            </ol>
            <div className="import-tip">
              <TipIcon color="#F59E0B" /> <strong>提示：</strong>支持 .xlsx 和 .xls 格式，文件大小不超过 10MB
            </div>
          </div>

          <div className="import-actions">
            <button 
              className="btn btn-secondary"
              onClick={onDownloadTemplate}
              disabled={importing}
            >
              <DownloadIcon color="currentColor" /> 下载模板
            </button>
          </div>

          <div className="import-file-selector">
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={importing}
                className="file-input-hidden"
              />
              <span className="file-input-button">
                {file ? (
                  <>
                    <CheckIcon color="#10B981" /> 已选择文件
                  </>
                ) : (
                  <>
                    <FolderIcon color="#FFC107" /> 选择文件
                  </>
                )}
              </span>
              {file && (
                <span className="file-name">{file.name}</span>
              )}
            </label>
          </div>

          {errorMessage && (
            <div className="import-error-message">
              <WarningIcon color="#EF4444" /> {errorMessage}
            </div>
          )}
        </div>

        <div className="import-modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={importing}
          >
            取消
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? '导入中...' : '开始导入'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportExcelModal;

