import React, { useState, useEffect } from 'react';
import { topicsAPI } from '../services/api';
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
import ConfirmInputDialog from '../components/ConfirmInputDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useConfirmInputDialog, useToast } from '../hooks/useDialog';
import ImportExcelModal from '../components/ImportExcelModal';
import { exportToExcel, importFromExcel, downloadExcelTemplate, exportSelectedToExcel } from '../utils/excelUtils';

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看
  const [showImportModal, setShowImportModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { dialogState: inputDialogState, showConfirmInput, closeDialog: closeInputDialog } = useConfirmInputDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 计算显示数据（筛选后优先）
  const displayData = filteredTopics.length > 0 ? filteredTopics : topics;
  // 使用分页 hook（基于显示数据）
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchTopics();
  }, []);

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (topics.length > 0) {
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [topics.length > 0]); // 只在从无数据变为有数据时触发

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicsAPI.getAll();
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      showToast('获取主题失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交
    
    setSubmitting(true);
    try {
      if (editingTopic) {
        await topicsAPI.update(editingTopic.id, formData);
      } else {
        await topicsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchTopics();
      showToast(editingTopic ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving topic:', error);
      showToast(error.response?.data?.message || '保存主题失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个主题吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await topicsAPI.delete(id);
          await fetchTopics();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting topic:', error);
          showToast(error.response?.data?.message || '删除主题失败', 'error');
        }
      }
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(topics, 'topics');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(topics, selectedIds, 'topics');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个主题！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'name', label: '主题名称' },
      { key: 'description', label: '描述' },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(topics, '主题数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 导出选中项为 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'name', label: '主题名称' },
      { key: 'description', label: '描述' }
    ];
    const ok = exportSelectedToExcel(topics, selectedIds, '主题数据', headers);
    if (ok) showToast(`成功导出 ${selectedIds.length} 项到 Excel！`, 'success');
    else showToast('导出失败，请检查选中项', 'error');
  };

  // Excel 导入功能
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { excelKey: '主题名称', dataKey: 'name', required: true },
      { excelKey: '描述', dataKey: 'description', required: false }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 批量创建主题
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const topicData of importedData) {
        try {
          await topicsAPI.create(topicData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${topicData.name}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchTopics();
      setShowImportModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个主题！`, 'success');
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
      { key: 'name', label: '主题名称', example: '商务英语' },
      { key: 'description', label: '描述', example: '商务场景常用英语' }
    ];

    const sampleData = [
      { '主题名称': '商务英语', '描述': '商务场景常用英语' },
      { '主题名称': '旅游英语', '描述': '旅游场景常用英语' },
      { '主题名称': '日常对话', '描述': '日常生活对话' }
    ];

    const success = downloadExcelTemplate('主题导入', headers, sampleData);
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
          await topicsAPI.create({ name: item.name, description: item.description || '' });
          successCount++;
        } catch { failCount++; }
      }
      await fetchTopics();
      setShowImportJSONModal(false);
      if (failCount === 0) showToast(`成功导入 ${successCount} 个主题！`, 'success');
      else showToast(`导入完成：成功 ${successCount}，失败 ${failCount}`,'warning');
    } catch { showToast('JSON 导入失败','error'); }
  };

  // 筛选
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    const filtered = topics.filter(item => {
      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const v = String(val).toLowerCase();
        if (key === 'name') return (item.name||'').toLowerCase().includes(v);
        if (key === 'description') return (item.description||'').toLowerCase().includes(v);
        return true;
      });
    });
    setFilteredTopics(filtered);
  };

  const handleResetFilter = () => { setActiveFilters({}); setFilteredTopics([]); };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setEditingTopic(null);
  };

  // 查看详情
  const handleViewDetail = (topic) => {
    const content = `
主题名称：${topic.name}
${topic.description ? `描述：${topic.description}` : ''}
创建时间：${new Date(topic.createdAt).toLocaleString()}
更新时间：${new Date(topic.updatedAt).toLocaleString()}
    `.trim();
    
    setDetailView({
      show: true,
      title: `主题详情 - ${topic.name}`,
      content: content
    });
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
      message: `确定要删除选中的 ${selectedIds.length} 个主题吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await topicsAPI.bulkDelete(selectedIds);
          await fetchTopics();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting topics:', error);
          showToast(error.response?.data?.message || '批量删除失败', 'error');
        }
      }
    });
  };

  const handleDeleteAll = async () => {
    if (topics.length === 0) {
      showToast('没有可删除的数据', 'warning');
      return;
    }

    showConfirmInput({
      title: '警告：删除全部数据',
      message: `您即将删除所有 ${topics.length} 个主题！\n\n此操作无法撤销，请谨慎操作。`,
      inputLabel: `请输入 "DELETE ALL" 以确认删除：`,
      expectedValue: 'DELETE ALL',
      type: 'danger',
      onConfirm: () => {
        showConfirm({
      title: '删除全部数据确认',
      message: `确定要删除所有 ${topics.length} 个主题吗？此操作无法撤销，请再次确认。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const allIds = topics.map(topic => topic.id);
          const response = await topicsAPI.bulkDelete(allIds);
          await fetchTopics();
          setSelectedIds([]);
          showToast(response.data.message || `成功删除所有 ${topics.length} 个主题`, 'success');
        } catch (error) {
          console.error('Error deleting all topics:', error);
          showToast(error.response?.data?.message || '删除全部失败', 'error');
        }
      }
        });
      }
    });
  };

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>主题管理</h1>
        <p>管理学习主题和分类</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 添加新主题
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

          {topics.length > 0 && (
            <div className="bulk-actions" style={{ marginLeft: 'auto' }}>
              <button 
                className="btn btn-danger btn-small" 
                onClick={handleDeleteAll}
                style={{ opacity: 0.8 }}
                title="删除所有数据（危险操作）"
              >
                删除全部 ({topics.length})
              </button>
            </div>
          )}
        </div>

        <FilterBar
          filterFields={[
            { key: 'name', label: '主题名称', type: 'text', placeholder: '输入主题名称...' },
            { key: 'description', label: '描述', type: 'text', placeholder: '输入描述...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : topics.length === 0 ? (
        <div className="empty-state">
          <h3>还没有主题</h3>
          <p>开始添加您的第一个主题吧！</p>
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
                  <th>主题名称</th>
                  <th>描述</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((topic) => (
                  <tr key={topic.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(topic.id)}
                        onChange={() => handleSelectOne(topic.id)}
                      />
                    </td>
                    <td><strong>{topic.name}</strong></td>
                    <td>{topic.description}</td>
                    <td>{new Date(topic.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-view-detail btn-small" onClick={() => handleViewDetail(topic)}>
                          查看
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleEdit(topic)}>
                          编辑
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(topic.id)}>
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
            {currentData.map((topic) => (
              <div key={topic.id} className="mobile-card">
                <div className="mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(topic.id)}
                    onChange={() => handleSelectOne(topic.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <div className="mobile-card-title">{topic.name}</div>
                </div>
                <div className="mobile-card-content">
                  {topic.description && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">描述</div>
                      <div className="mobile-card-value">{topic.description}</div>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">创建时间</div>
                    <div className="mobile-card-value">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button className="btn btn-view-detail btn-small" onClick={() => handleViewDetail(topic)}>
                    查看
                  </button>
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(topic)}>
                    编辑
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(topic.id)}>
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
            <h2>{editingTopic ? '编辑主题' : '添加新主题'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>主题名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例如：商务英语"
                />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述这个主题"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingTopic ? '更新' : '创建')}
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
      <ConfirmInputDialog
        isOpen={inputDialogState.isOpen}
        title={inputDialogState.title}
        message={inputDialogState.message}
        inputLabel={inputDialogState.inputLabel}
        expectedValue={inputDialogState.expectedValue}
        type={inputDialogState.type}
        onConfirm={inputDialogState.onConfirm}
        onCancel={closeInputDialog}
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
        title="批量导入主题"
        moduleName="主题"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入主题"
        moduleName="主题"
      />
    </div>
  );
}

export default Topics;
