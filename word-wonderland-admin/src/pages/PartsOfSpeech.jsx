import React, { useState, useEffect } from 'react';
import { partsOfSpeechAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
import ImportExportDropdown from '../components/ImportExportDropdown';
import ImportJSONModal from '../components/ImportJSONModal';
import FilterBar from '../components/FilterBar';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';
import ImportExcelModal from '../components/ImportExcelModal';
import { exportToExcel, importFromExcel, downloadExcelTemplate, exportSelectedToExcel } from '../utils/excelUtils';

function PartsOfSpeech() {
  const [partsOfSpeech, setPartsOfSpeech] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看
  const [showImportModal, setShowImportModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false);
  const [filteredPOS, setFilteredPOS] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  
  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();
  
  // 计算显示数据（筛选后优先）
  const displayData = filteredPOS.length > 0 ? filteredPOS : partsOfSpeech;
  // 使用分页 hook（基于显示数据）
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchPartsOfSpeech();
  }, []);

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (partsOfSpeech.length > 0) {
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [partsOfSpeech.length > 0]); // 只在从无数据变为有数据时触发

  const fetchPartsOfSpeech = async () => {
    try {
      setLoading(true);
      const response = await partsOfSpeechAPI.getAll();
      setPartsOfSpeech(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parts of speech:', error);
      showToast('获取词性失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交
    
    setSubmitting(true);
    try {
      if (editingPos) {
        await partsOfSpeechAPI.update(editingPos.id, formData);
      } else {
        await partsOfSpeechAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchPartsOfSpeech();
      showToast(editingPos ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving part of speech:', error);
      showToast(error.response?.data?.message || '保存词性失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, event) => {
    // 防止触发其他事件（如长按菜单）
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const posToDelete = partsOfSpeech.find(p => p.id === id);
    if (posToDelete && posToDelete.isSystem) {
      return; // 系统预设词性不允许删除
    }
    
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个词性吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await partsOfSpeechAPI.delete(id);
          await fetchPartsOfSpeech();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting part of speech:', error);
          showToast(error.response?.data?.message || '删除词性失败', 'error');
        }
      }
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(partsOfSpeech, 'partsOfSpeech');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(partsOfSpeech, selectedIds, 'partsOfSpeech');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个词性！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'code', label: '词性代码' },
      { key: 'name', label: '词性名称' },
      { key: 'description', label: '描述' },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(partsOfSpeech, '词性数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 导出选中项为 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'code', label: '词性代码' },
      { key: 'name', label: '词性名称' },
      { key: 'description', label: '描述' }
    ];
    const ok = exportSelectedToExcel(partsOfSpeech, selectedIds, '词性数据', headers);
    if (ok) showToast(`成功导出 ${selectedIds.length} 项到 Excel！`, 'success');
    else showToast('导出失败，请检查选中项', 'error');
  };

  // Excel 导入功能
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { 
        excelKey: '词性代码', 
        dataKey: 'code', 
        required: true,
        transform: (value) => {
          if (!value || value.trim() === '') {
            throw new Error('词性代码不能为空');
          }
          return value.trim();
        }
      },
      { excelKey: '词性名称', dataKey: 'name', required: true },
      { excelKey: '描述', dataKey: 'description', required: false }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 批量创建词性
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const posData of importedData) {
        try {
          await partsOfSpeechAPI.create(posData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${posData.code} - ${posData.name}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchPartsOfSpeech();
      setShowImportModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个词性！`, 'success');
      } else {
        showToast(
          `导入完成：成功 ${successCount} 个，失败 ${failCount} 个\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`,
          'warning'
        );
      }
    } catch (error) {
      throw new Error(error.message || 'Excel 文件解析失败');
    }
  };

  // 下载 Excel 模板
  const handleDownloadTemplate = () => {
    const headers = [
      { key: 'code', label: '词性代码', example: 'n.' },
      { key: 'name', label: '词性名称', example: '名词' },
      { key: 'description', label: '描述', example: '表示人、事物、地点或抽象概念的名称' }
    ];

    const sampleData = [
      { '词性代码': 'n.', '词性名称': '名词', '描述': '表示人、事物、地点或抽象概念的名称' },
      { '词性代码': 'v.', '词性名称': '动词', '描述': '表示动作或状态' },
      { '词性代码': 'adj.', '词性名称': '形容词', '描述': '修饰名词，表示性质或特征' }
    ];

    const success = downloadExcelTemplate('词性导入', headers, sampleData);
    if (success) {
      showToast('模板下载成功！', 'success');
    } else {
      showToast('模板下载失败', 'error');
    }
  };

  // JSON 导入
  const handleImportJSON = async (jsonArray) => {
    try {
      let successCount = 0, failCount = 0;
      for (const item of jsonArray) {
        try {
          await partsOfSpeechAPI.create({ code: item.code, name: item.name, description: item.description || '' });
          successCount++;
        } catch { failCount++; }
      }
      await fetchPartsOfSpeech();
      setShowImportJSONModal(false);
      if (failCount === 0) showToast(`成功导入 ${successCount} 个词性！`, 'success');
      else showToast(`导入完成：成功 ${successCount}，失败 ${failCount}`,'warning');
    } catch { showToast('JSON 导入失败','error'); }
  };

  // 筛选
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    const filtered = partsOfSpeech.filter(item => {
      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const v = String(val).toLowerCase();
        if (key === 'code') return (item.code||'').toLowerCase().includes(v);
        if (key === 'name') return (item.name||'').toLowerCase().includes(v);
        if (key === 'description') return (item.description||'').toLowerCase().includes(v);
        return true;
      });
    });
    setFilteredPOS(filtered);
  };

  const handleResetFilter = () => { setActiveFilters({}); setFilteredPOS([]); };

  // 批量删除相关函数
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(currentData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast('请先选择要删除的项目', 'warning');
      return;
    }

    showConfirm({
      title: '批量删除',
      message: `确定要删除选中的 ${selectedIds.length} 个词性吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await partsOfSpeechAPI.bulkDelete(selectedIds);
          await fetchPartsOfSpeech();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting parts of speech:', error);
          showToast(error.response?.data?.message || '批量删除失败', 'error');
        }
      }
    });
  };

  const handleEdit = (pos) => {
    setEditingPos(pos);
    setFormData({
      code: pos.code,
      name: pos.name,
      description: pos.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: ''
    });
    setEditingPos(null);
  };

  // 查看详情
  const handleViewDetail = (pos) => {
    const content = `
代码：${pos.code}
名称：${pos.name}
${pos.description ? `描述：${pos.description}` : ''}
创建时间：${new Date(pos.createdAt).toLocaleString()}
更新时间：${new Date(pos.updatedAt).toLocaleString()}
    `.trim();
    
    setDetailView({
      show: true,
      title: `词性详情 - ${pos.name}`,
      content: content
    });
  };

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>词性管理</h1>
        <p>管理单词的词性类型（如：名词、动词、形容词等）</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 添加新词性
          </button>

          <ImportExportDropdown
            type="import"
            handlers={{
              onExcelImport: () => setShowImportModal(true),
              onJSONImport: () => setShowImportJSONModal(true),
              onDownloadTemplate: handleDownloadTemplate
            }}
            disabled={loading}
          />

          <ImportExportDropdown
            type="export"
            handlers={{
              onExportAllExcel: handleExportExcel,
              onExportAllJSON: handleExportAll,
              onExportSelectedExcel: handleExportSelectedExcel,
              onExportSelectedJSON: handleExportSelected
            }}
            disabled={loading || displayData.length === 0}
            selectedCount={selectedIds.length}
          />

          {selectedIds.length > 0 && (
            <div className="bulk-actions">
              <span className="bulk-actions-label">已选择 {selectedIds.length} 项</span>
              <button className="btn btn-danger btn-small" onClick={handleBulkDelete}>
                批量删除
              </button>
            </div>
          )}
        </div>

        <FilterBar
          filterFields={[
            { key: 'code', label: '代码', type: 'text', placeholder: '输入代码...' },
            { key: 'name', label: '名称', type: 'text', placeholder: '输入名称...' },
            { key: 'description', label: '描述', type: 'text', placeholder: '输入描述...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : partsOfSpeech.length === 0 ? (
        <div className="empty-state">
          <h3>还没有词性</h3>
          <p>开始添加您的第一个词性吧！建议添加常用词性如：n（名词）、v（动词）、adj（形容词）、adv（副词）等</p>
        </div>
      ) : (
        <>
          {/* 桌面端表格视图 */}
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      className="select-all-checkbox"
                      checked={selectedIds.length === currentData.length && currentData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>代码</th>
                  <th>名称</th>
                  <th>描述</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((pos) => (
                  <tr key={pos.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(pos.id)}
                        onChange={() => handleSelectOne(pos.id)}
                      />
                    </td>
                    <td><strong style={{ color: 'var(--brand-primary)' }}>{pos.code}</strong></td>
                    <td>{pos.name}</td>
                    <td style={{ color: '#666' }}>{pos.description}</td>
                    <td>{new Date(pos.createdAt).toLocaleDateString()}</td>
                    <td>
                    <div className="actions-cell">
                      <button 
                        className="btn btn-view-detail btn-small" 
                        onClick={() => handleViewDetail(pos)}
                      >
                        查看
                      </button>
                      <button 
                        className="btn btn-secondary btn-small" 
                        onClick={() => handleEdit(pos)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        编辑
                      </button>
                      <button 
                        className="btn btn-danger btn-small" 
                        onClick={(e) => handleDelete(pos.id, e)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        删除
                      </button>
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片视图 - 使用分页数据 */}
          <div className="mobile-card-view">
            {currentData.map((pos) => (
              <div key={pos.id} className="mobile-card">
                <div className="mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(pos.id)}
                    onChange={() => handleSelectOne(pos.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <div className="mobile-card-title" style={{ color: 'var(--brand-primary)' }}>
                    {pos.code} - {pos.name}
                  </div>
                </div>
                <div className="mobile-card-content">
                  {pos.description && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">描述</div>
                      <div className="mobile-card-value" style={{ color: '#666' }}>
                        {pos.description}
                      </div>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">创建时间</div>
                    <div className="mobile-card-value">
                      {new Date(pos.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button 
                    className="btn btn-view-detail btn-small" 
                    onClick={() => handleViewDetail(pos)}
                  >
                    查看
                  </button>
                  <button 
                    className="btn btn-secondary btn-small" 
                    onClick={() => handleEdit(pos)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn btn-danger btn-small" 
                    onClick={(e) => handleDelete(pos.id, e)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 分页组件 */}
          {renderPagination()}
        </>
      )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPos ? '编辑词性' : '添加新词性'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>代码 * <small>（如：n, v, adj, adv）</small></label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="例如：n"
                  maxLength="10"
                  disabled={!!editingPos}
                />
                {editingPos && <small style={{ color: '#999' }}>词性代码不可修改</small>}
              </div>

              <div className="form-group">
                <label>名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例如：名词"
                />
              </div>

              <div className="form-group">
                <label>描述（可选）</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述这个词性的用法"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingPos ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />

      {/* Toast通知 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* 详情查看弹窗 */}
      <DetailViewModal
        show={detailView.show}
        title={detailView.title}
        content={detailView.content}
        onClose={() => setDetailView({ show: false, title: '', content: '' })}
      />

      {/* Excel 导入弹窗 */}
      <ImportExcelModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        title="批量导入词性"
        moduleName="词性"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入词性"
        moduleName="词性"
      />
    </div>
  );
}

export default PartsOfSpeech;

