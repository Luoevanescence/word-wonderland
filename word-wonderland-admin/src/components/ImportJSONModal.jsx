import React, { useState, useRef } from 'react';
import './ImportExcelModal.css';
import { InstructionIcon, TipIcon, FolderIcon, CheckIcon, WarningIcon } from './icons/ImportExportIcons'; // 复用相同的样式（已优化）

/**
 * JSON 导入弹窗组件
 * @param {boolean} show - 是否显示弹窗
 * @param {function} onClose - 关闭弹窗回调
 * @param {function} onImport - 导入数据回调 (jsonData) => Promise
 * @param {string} title - 弹窗标题
 * @param {string} moduleName - 模块名称
 */
function ImportJSONModal({ show, onClose, onImport, title, moduleName }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!show) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 验证文件类型
    if (!selectedFile.name.match(/\.json$/i)) {
      setErrorMessage('请选择有效的 JSON 文件（.json）');
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
      // 读取 JSON 文件
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          await onImport(jsonData);
          // 导入成功后重置状态
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          setErrorMessage(error.message || 'JSON 格式错误或导入失败');
        } finally {
          setImporting(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage('文件读取失败');
        setImporting(false);
      };
      reader.readAsText(file);
    } catch (error) {
      setErrorMessage(error.message || '导入失败');
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
            ×
          </button>
        </div>
        
        <div className="import-modal-body">
          <div className="import-instructions">
            <h3>
              <InstructionIcon color="#667eea" /> 导入说明
            </h3>
            <ol>
              <li>确保 JSON 文件格式正确</li>
              <li>JSON 应该是一个对象数组格式</li>
              <li>每个对象应包含必需的字段</li>
              <li>选择文件后点击"开始导入"</li>
            </ol>
            <div className="import-tip">
              <TipIcon color="#F59E0B" /> <strong>提示：</strong>可以先导出数据查看正确的 JSON 格式
            </div>
          </div>

          <div className="import-file-selector">
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
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
                    <FolderIcon color="#667eea" /> 选择 JSON 文件
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

export default ImportJSONModal;

