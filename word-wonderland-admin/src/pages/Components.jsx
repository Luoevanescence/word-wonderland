import React, { useState, useEffect } from 'react';
import { componentsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
import ImportExportDropdown from '../components/ImportExportDropdown';
import ImportExcelModal from '../components/ImportExcelModal';
import ImportJSONModal from '../components/ImportJSONModal';
import FilterBar from '../components/FilterBar';
import { exportToExcel, exportSelectedToExcel, importFromExcel, downloadExcelTemplate } from '../utils/excelUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';

function Components() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    description: '',
    example: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' });
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [filteredComponents, setFilteredComponents] = useState([]); // 筛选后的数据
  const [activeFilters, setActiveFilters] = useState({}); // 当前激活的筛选条件
  const [showImportExcelModal, setShowImportExcelModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false); // JSON 导入弹窗

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook - 使用筛选后的数据或全部数据
  const displayData = Object.keys(activeFilters).length > 0 ? filteredComponents : components;
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchComponents();
  }, []);

  // 当成分数据变化时，重新应用筛选
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      applyFilters(activeFilters);
    }
  }, [components]);

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (components.length > 0) {
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [components.length > 0]); // 只在从无数据变为有数据时触发

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await componentsAPI.getAll();
      setComponents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      if (editingComponent) {
        await componentsAPI.update(editingComponent.id, formData);
      } else {
        await componentsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchComponents();
      showToast(editingComponent ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving component:', error);
      showToast(error.response?.data?.message || '保存成分失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个成分吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await componentsAPI.delete(id);
          await fetchComponents();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting component:', error);
          showToast(error.response?.data?.message || '删除成分失败', 'error');
        }
      }
    });
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      englishName: component.englishName || '',
      description: component.description || '',
      example: component.example || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingComponent(null);
    setFormData({
      name: '',
      englishName: '',
      description: '',
      example: ''
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(components, 'components');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(components, selectedIds, 'components');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个成分！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'name', label: '成分名称' },
      { key: 'englishName', label: '英文名称' },
      { key: 'description', label: '说明' },
      { key: 'example', label: '示例' },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(components, '成分数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 选中导出 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'name', label: '成分名称' },
      { key: 'englishName', label: '英文名称' },
      { key: 'description', label: '说明' },
      { key: 'example', label: '示例' },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportSelectedToExcel(displayData, selectedIds, '成分数据', headers);
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个成分！`, 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 筛选功能
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    
    const filtered = components.filter(component => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        const searchValue = value.toLowerCase();
        
        if (key === 'name') {
          return (component.name || '').toLowerCase().includes(searchValue);
        }
        
        if (key === 'englishName') {
          return (component.englishName || '').toLowerCase().includes(searchValue);
        }
        
        if (key === 'description') {
          return (component.description || '').toLowerCase().includes(searchValue);
        }

        if (key === 'example') {
          return (component.example || '').toLowerCase().includes(searchValue);
        }
        
        return true;
      });
    });
    
    setFilteredComponents(filtered);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setFilteredComponents([]);
  };

  // Excel 导入功能
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { excelKey: '成分名称', dataKey: 'name', required: true },
      { excelKey: '英文名称', dataKey: 'englishName', required: false },
      { excelKey: '说明', dataKey: 'description', required: false },
      { excelKey: '示例', dataKey: 'example', required: false }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 批量创建成分
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const componentData of importedData) {
        try {
          await componentsAPI.create(componentData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${componentData.name || '未知'}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchComponents();
      setShowImportExcelModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个成分！`, 'success');
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
      { key: 'name', label: '成分名称', example: '主语' },
      { key: 'englishName', label: '英文名称', example: 'Subject' },
      { key: 'description', label: '说明', example: '句子的主要执行者' },
      { key: 'example', label: '示例', example: 'I, you, he' }
    ];

    const sampleData = [
      { '成分名称': '主语', '英文名称': 'Subject', '说明': '句子的主要执行者', '示例': 'I, you, he' },
      { '成分名称': '谓语', '英文名称': 'Predicate', '说明': '表示动作或状态', '示例': 'love, is, run' },
      { '成分名称': '宾语', '英文名称': 'Object', '说明': '动作的承受者', '示例': 'book, apple, him' }
    ];

    const success = downloadExcelTemplate('成分导入', headers, sampleData);
    if (success) {
      showToast('模板下载成功！', 'success');
    } else {
      showToast('模板下载失败', 'error');
    }
  };

  // JSON 导入功能
  const handleImportJSON = async (jsonData) => {
    try {
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON 数据应该是一个数组');
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const componentData of jsonData) {
        // 验证必需字段
        if (!componentData.name) {
          failCount++;
          errors.push('无效数据项（缺少成分名称）');
          continue;
        }

        try {
          await componentsAPI.create(componentData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${componentData.name}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      await fetchComponents();
      setShowImportJSONModal(false);

      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个成分！`, 'success');
      } else {
        showToast(
          `导入完成：成功 ${successCount} 个，失败 ${failCount} 个\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`,
          'warning'
        );
      }
    } catch (error) {
      throw new Error(error.message || 'JSON 导入失败');
    }
  };

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
      message: `确定要删除选中的 ${selectedIds.length} 个成分吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await componentsAPI.bulkDelete(selectedIds);
          await fetchComponents();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting components:', error);
          showToast(error.response?.data?.message || '批量删除失败', 'error');
        }
      }
    });
  };

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>成分管理</h1>
        <p>管理句型成分，用于组合构建句型</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 添加新成分
          </button>

          <ImportExportDropdown
            type="import"
            handlers={{
              onExcelImport: () => setShowImportExcelModal(true),
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

        {/* 筛选条 */}
        <FilterBar
          filterFields={[
            { key: 'name', label: '成分名称', type: 'text', placeholder: '输入成分名称...' },
            { key: 'englishName', label: '英文名称', type: 'text', placeholder: '输入英文名称...' },
            { key: 'description', label: '说明', type: 'text', placeholder: '输入说明...' },
            { key: 'example', label: '示例', type: 'text', placeholder: '输入示例...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : components.length === 0 ? (
        <div className="empty-state">
          <h3>还没有成分</h3>
          <p>开始添加您的第一个成分吧！</p>
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
                  <th>成分名称</th>
                  <th>英文名称</th>
                  <th>说明</th>
                  <th>示例</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((component) => (
                  <tr key={component.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(component.id)}
                        onChange={() => handleSelectOne(component.id)}
                      />
                    </td>
                    <td><strong>{component.name}</strong></td>
                    <td className="text-cell">{component.englishName}</td>
                    <td className="text-cell">{component.description}</td>
                    <td className="text-cell" style={{ fontStyle: 'italic', color: '#666' }}>{component.example}</td>
                    <td>{new Date(component.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-view-detail" 
                          onClick={() => setDetailView({
                            show: true,
                            title: `成分详情：${component.name}`,
                            content: `说明：${component.description || '无'}\n\n示例：${component.example || '无'}`
                          })}
                        >
                          详情
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleEdit(component)}>
                          编辑
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(component.id)}>
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
            {currentData.map((component) => (
              <div key={component.id} className="mobile-card">
                <div className="mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(component.id)}
                    onChange={() => handleSelectOne(component.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <div className="mobile-card-title">{component.name}</div>
                </div>
                <div className="mobile-card-content">
                  {component.description && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">说明</div>
                      <div className="mobile-card-value">{component.description}</div>
                    </div>
                  )}
                  {component.example && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">示例</div>
                      <div className="mobile-card-value" style={{ fontStyle: 'italic', color: '#666' }}>
                        {component.example}
                      </div>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">创建时间</div>
                    <div className="mobile-card-value">
                      {new Date(component.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(component)}>
                    编辑
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(component.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
      </div>

      {/* 添加/编辑弹窗 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingComponent ? '编辑成分' : '添加新成分'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>成分名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：主语、谓语、宾语、定语..."
                  required
                />
              </div>

              <div className="form-group">
                <label>英文名称</label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  placeholder="Subject / Predicate / Object ..."
                />
              </div>

              <div className="form-group">
                <label>说明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述此成分的作用和特点"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>示例</label>
                <input
                  type="text"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="例如：I、love、you"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingComponent ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 详情查看弹窗 */}
      <DetailViewModal
        show={detailView.show}
        title={detailView.title}
        content={detailView.content}
        onClose={() => setDetailView({ show: false, title: '', content: '' })}
      />

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

      {/* Excel 导入弹窗 */}
      <ImportExcelModal
        show={showImportExcelModal}
        onClose={() => setShowImportExcelModal(false)}
        onImport={handleImportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        title="批量导入成分"
        moduleName="成分"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入成分"
        moduleName="成分"
      />
    </div>
  );
}

export default Components;

