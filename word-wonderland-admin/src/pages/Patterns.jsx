import React, { useState, useEffect } from 'react';
import { patternsAPI, componentsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import { Link } from 'react-router-dom';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
import ImportExportDropdown from '../components/ImportExportDropdown';
import ImportJSONModal from '../components/ImportJSONModal';
import FilterBar from '../components/FilterBar';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import PatternBuilder from '../components/PatternBuilder';
import { useConfirmDialog, useToast } from '../hooks/useDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import ImportExcelModal from '../components/ImportExcelModal';
import { exportToExcel, importFromExcel, downloadExcelTemplate, exportSelectedToExcel } from '../utils/excelUtils';

function Patterns() {
  const [patterns, setPatterns] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [formData, setFormData] = useState({
    pattern: '',
    components: [],
    description: '',
    example: '',
    translation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' });
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [showImportModal, setShowImportModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false);
  const [filteredPatterns, setFilteredPatterns] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  
  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 计算显示数据（筛选后优先）
  const displayData = filteredPatterns.length > 0 ? filteredPatterns : patterns;
  // 使用分页 hook（基于显示数据）
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchPatterns();
    fetchComponents();
  }, []);

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (patterns.length > 0) {
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [patterns.length > 0]); // 只在从无数据变为有数据时触发

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const response = await patternsAPI.getAll();
      setPatterns(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      showToast('获取句型失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await componentsAPI.getAll();
      setComponents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交
    
    setSubmitting(true);
    try {
      if (editingPattern) {
        await patternsAPI.update(editingPattern.id, formData);
      } else {
        await patternsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchPatterns();
      showToast(editingPattern ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving pattern:', error);
      showToast(error.response?.data?.message || '保存句型失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个句型吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await patternsAPI.delete(id);
          await fetchPatterns();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting pattern:', error);
          showToast(error.response?.data?.message || '删除句型失败', 'error');
        }
      }
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(patterns, 'patterns');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(patterns, selectedIds, 'patterns');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个句型！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'pattern', label: '句型' },
      { 
        key: 'components', 
        label: '组件',
        transform: (comps) => comps.map(c => c.name).join(', ')
      },
      { key: 'description', label: '描述' },
      { key: 'example', label: '例句' },
      { key: 'translation', label: '翻译' },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(patterns, '句型数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 导出选中项为 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'pattern', label: '句型' },
      { key: 'description', label: '描述' },
      { key: 'example', label: '例句' },
      { key: 'translation', label: '翻译' }
    ];
    const ok = exportSelectedToExcel(patterns, selectedIds, '句型数据', headers);
    if (ok) {
      showToast(`成功导出 ${selectedIds.length} 项到 Excel！`, 'success');
    } else {
      showToast('导出失败，请检查选中项', 'error');
    }
  };

  // Excel 导入功能 (句型较复杂，导入时只导入基础信息，不包含组件)
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { excelKey: '句型', dataKey: 'pattern', required: true },
      { excelKey: '描述', dataKey: 'description', required: true },
      { excelKey: '例句', dataKey: 'example', required: false },
      { excelKey: '翻译', dataKey: 'translation', required: false }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 批量创建句型（不包含组件，需要后续手动添加）
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const patternData of importedData) {
        try {
          await patternsAPI.create({ ...patternData, components: [] });
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${patternData.pattern}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchPatterns();
      setShowImportModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个句型！\n💡 提示：请手动为句型添加组件。`, 'success');
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
      { key: 'pattern', label: '句型', example: 'Subject + Verb + Object' },
      { key: 'description', label: '描述', example: '主谓宾结构' },
      { key: 'example', label: '例句', example: 'I love English.' },
      { key: 'translation', label: '翻译', example: '我喜欢英语。' }
    ];

    const sampleData = [
      { '句型': 'Subject + Verb + Object', '描述': '主谓宾结构', '例句': 'I love English.', '翻译': '我喜欢英语。' },
      { '句型': 'There + be + Subject', '描述': 'There be 句型', '例句': 'There is a book on the desk.', '翻译': '桌子上有一本书。' },
      { '句型': 'Subject + be + Adjective', '描述': '主系表结构', '例句': 'She is beautiful.', '翻译': '她很漂亮。' }
    ];

    const success = downloadExcelTemplate('句型导入', headers, sampleData);
    if (success) {
      showToast('模板下载成功！\n💡 注意：导入后需要手动为句型添加组件。', 'success');
    } else {
      showToast('模板下载失败', 'error');
    }
  };

  // JSON 导入（只导入基础信息，不含 components）
  const handleImportJSON = async (jsonArray) => {
    try {
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const item of jsonArray) {
        try {
          await patternsAPI.create({
            pattern: item.pattern,
            description: item.description,
            example: item.example || '',
            translation: item.translation || '',
            components: []
          });
          successCount++;
        } catch (e) {
          failCount++;
          errors.push(item.pattern || '未命名');
        }
      }

      await fetchPatterns();
      setShowImportJSONModal(false);
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个句型！`, 'success');
      } else {
        showToast(`导入完成：成功 ${successCount}，失败 ${failCount}`,'warning');
      }
    } catch (e) {
      showToast('JSON 导入失败','error');
    }
  };

  // 筛选逻辑
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    const filtered = patterns.filter(item => {
      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const v = String(val).toLowerCase();
        if (key === 'pattern') return (item.pattern||'').toLowerCase().includes(v);
        if (key === 'description') return (item.description||'').toLowerCase().includes(v);
        if (key === 'example') return (item.example||'').toLowerCase().includes(v);
        if (key === 'translation') return (item.translation||'').toLowerCase().includes(v);
        return true;
      });
    });
    setFilteredPatterns(filtered);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setFilteredPatterns([]);
  };

  const handleEdit = (pattern) => {
    setEditingPattern(pattern);
    setFormData({
      pattern: pattern.pattern,
      components: pattern.components || [],
      description: pattern.description,
      example: pattern.example || '',
      translation: pattern.translation || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      pattern: '',
      components: [],
      description: '',
      example: '',
      translation: ''
    });
    setEditingPattern(null);
  };

  const openAddModal = () => {
    if (components.length === 0) {
      showConfirm({
        title: '缺少成分',
        message: '还没有可用的成分！需要先创建成分才能组合句型。\n\n是否现在前往成分管理页面？',
        type: 'alert',
        onConfirm: () => {
          window.location.href = '/components';
        }
      });
      return;
    }
    setShowModal(true);
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
      message: `确定要删除选中的 ${selectedIds.length} 个句型吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await patternsAPI.bulkDelete(selectedIds);
          await fetchPatterns();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting patterns:', error);
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
        <h1>句型管理</h1>
        <p>管理英语句型和结构</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            + 添加新句型
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
            { key: 'pattern', label: '句型', type: 'text', placeholder: '输入句型...' },
            { key: 'description', label: '描述', type: 'text', placeholder: '输入描述...' },
            { key: 'example', label: '例句', type: 'text', placeholder: '输入例句...' },
            { key: 'translation', label: '翻译', type: 'text', placeholder: '输入翻译...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

        {components.length === 0 && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            <strong>⚠️ 提示：</strong> 您还没有创建任何成分。句型由成分组合而成。
            <Link to="/components" style={{ color: 'var(--brand-primary)', marginLeft: '10px', textDecoration: 'underline' }}>
              点击前往成分管理页面
            </Link>
          </div>
        )}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : patterns.length === 0 ? (
        <div className="empty-state">
          <h3>还没有句型</h3>
          <p>开始添加您的第一个句型吧！</p>
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
                  <th>句型</th>
                  <th>说明</th>
                  <th>例句</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((pattern) => (
                  <tr key={pattern.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(pattern.id)}
                        onChange={() => handleSelectOne(pattern.id)}
                      />
                    </td>
                    <td><strong style={{ color: 'var(--brand-primary)' }}>{pattern.pattern}</strong></td>
                    <td className="text-cell">{pattern.description}</td>
                    <td className="text-cell">
                      {pattern.example && (
                        <div>
                          <div style={{ fontStyle: 'italic' }}>{pattern.example}</div>
                          {pattern.translation && (
                            <div style={{ fontSize: '0.9em', color: '#666' }}>{pattern.translation}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{new Date(pattern.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-view-detail" 
                          onClick={() => setDetailView({
                            show: true,
                            title: `句型详情：${pattern.pattern}`,
                            content: `描述：${pattern.description}\n\n例句：${pattern.example || '无'}\n\n翻译：${pattern.translation || '无'}`
                          })}
                        >
                          详情
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleEdit(pattern)}>
                          编辑
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(pattern.id)}>
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
            {currentData.map((pattern) => (
              <div key={pattern.id} className="mobile-card">
                <div className="mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(pattern.id)}
                    onChange={() => handleSelectOne(pattern.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <div className="mobile-card-title" style={{ color: 'var(--brand-primary)' }}>
                    {pattern.pattern}
                  </div>
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">说明</div>
                    <div className="mobile-card-value">{pattern.description}</div>
                  </div>
                  {pattern.example && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">例句</div>
                      <div className="mobile-card-value">
                        <div style={{ fontStyle: 'italic' }}>{pattern.example}</div>
                        {pattern.translation && (
                          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
                            {pattern.translation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">创建时间</div>
                    <div className="mobile-card-value">
                      {new Date(pattern.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(pattern)}>
                    编辑
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(pattern.id)}>
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
            <h2>{editingPattern ? '编辑句型' : '添加新句型'}</h2>
            <form onSubmit={handleSubmit}>
              <PatternBuilder
                components={components}
                patterns={patterns}
                selectedItems={formData.components}
                onChange={(items) => {
                  const patternName = items.map(item => item.name).join(' + ');
                  setFormData({ 
                    ...formData, 
                    components: items,
                    pattern: patternName || formData.pattern
                  });
                }}
                currentPatternId={editingPattern?.id}
              />

              <div className="form-group">
                <label>句型名称（自动生成或手动修改） *</label>
                <input
                  type="text"
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  required
                  placeholder="例如：主语 + 谓语 + 宾语"
                />
              </div>

              <div className="form-group">
                <label>说明 *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="解释句型及其使用场景"
                />
              </div>

              <div className="form-group">
                <label>例句</label>
                <input
                  type="text"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="I love reading books."
                />
              </div>

              <div className="form-group">
                <label>翻译</label>
                <input
                  type="text"
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  placeholder="我喜欢读书。"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingPattern ? '更新' : '创建')}
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
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        title="批量导入句型"
        moduleName="句型"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入句型"
        moduleName="句型"
      />
    </div>
  );
}

export default Patterns;
