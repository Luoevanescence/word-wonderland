import React, { useState, useEffect } from 'react';
import { sentencesAPI, patternsAPI } from '../services/api';
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
import MultiSelect from '../components/MultiSelect';
import { exportToExcel, importFromExcel, downloadExcelTemplate, exportSelectedToExcel } from '../utils/excelUtils';

function Sentences() {
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSentence, setEditingSentence] = useState(null);
  const [formData, setFormData] = useState({
    sentence: '',
    englishName: '',
    translation: '',
    note: '',
    patternIds: []
  });
  const [allPatterns, setAllPatterns] = useState([]);
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [showImportModal, setShowImportModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false);
  const [filteredSentences, setFilteredSentences] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 计算显示数据（筛选后优先）
  const displayData = filteredSentences.length > 0 ? filteredSentences : sentences;
  // 使用分页 hook（基于显示数据）
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchSentences();
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const res = await patternsAPI.getAll();
      setAllPatterns(res.data.data || []);
    } catch (e) {
      // 静默失败
    }
  };

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (sentences.length > 0) {
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [sentences.length > 0]); // 只在从无数据变为有数据时触发

  const fetchSentences = async () => {
    try {
      setLoading(true);
      const response = await sentencesAPI.getAll();
      setSentences(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sentences:', error);
      showToast('获取句子失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交
    
    setSubmitting(true);
    try {
      if (editingSentence) {
        await sentencesAPI.update(editingSentence.id, formData);
      } else {
        await sentencesAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchSentences();
      showToast(editingSentence ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving sentence:', error);
      showToast(error.response?.data?.message || '保存句子失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个句子吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await sentencesAPI.delete(id);
          await fetchSentences();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting sentence:', error);
          showToast(error.response?.data?.message || '删除句子失败', 'error');
        }
      }
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(sentences, 'sentences');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(sentences, selectedIds, 'sentences');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个句子！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'sentence', label: '英文句子' },
      { key: 'englishName', label: '英文名称' },
      { key: 'translation', label: '中文翻译' },
      { key: 'note', label: '备注' },
      {
        key: 'patterns',
        label: '句型',
        transform: (ps) => Array.isArray(ps) ? ps.map(p => p.pattern || p.name || '').filter(Boolean).join(', ') : ''
      },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(sentences, '句子数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 导出选中项为 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'sentence', label: '英文句子' },
      { key: 'translation', label: '中文翻译' },
      { key: 'note', label: '备注' }
    ];
    const ok = exportSelectedToExcel(sentences, selectedIds, '句子数据', headers);
    if (ok) {
      showToast(`成功导出 ${selectedIds.length} 项到 Excel！`, 'success');
    } else {
      showToast('导出失败，请检查选中项', 'error');
    }
  };

  // Excel 导入功能
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { excelKey: '英文句子', dataKey: 'sentence', required: true },
      { excelKey: '英文名称', dataKey: 'englishName', required: false },
      { excelKey: '中文翻译', dataKey: 'translation', required: true },
      { excelKey: '备注', dataKey: 'note', required: false }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 批量创建句子
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const sentenceData of importedData) {
        try {
          await sentencesAPI.create(sentenceData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${sentenceData.sentence.substring(0, 30)}..." 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchSentences();
      setShowImportModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个句子！`, 'success');
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
      { key: 'sentence', label: '英文句子', example: 'I love learning English.' },
      { key: 'englishName', label: '英文名称', example: 'Love Learning' },
      { key: 'translation', label: '中文翻译', example: '我喜欢学习英语。' },
      { key: 'note', label: '备注', example: '简单句型' }
    ];

    const sampleData = [
      { '英文句子': 'I love learning English.', '英文名称': 'Love Learning', '中文翻译': '我喜欢学习英语。', '备注': '简单句型' },
      { '英文句子': 'Practice makes perfect.', '英文名称': 'Practice Perfect', '中文翻译': '熟能生巧。', '备注': '谚语' },
      { '英文句子': 'Rome was not built in a day.', '英文名称': 'Rome Not Built In A Day', '中文翻译': '罗马不是一天建成的。', '备注': '谚语' }
    ];

    const success = downloadExcelTemplate('句子导入', headers, sampleData);
    if (success) {
      showToast('模板下载成功！', 'success');
    } else {
      showToast('模板下载失败', 'error');
    }
  };

  // JSON 导入
  const handleImportJSON = async (jsonArray) => {
    try {
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const item of jsonArray) {
        try {
          await sentencesAPI.create({
            sentence: item.sentence,
            translation: item.translation,
            note: item.note || ''
          });
          successCount++;
        } catch (e) {
          failCount++;
          errors.push('导入失败');
        }
      }

      await fetchSentences();
      setShowImportJSONModal(false);
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个句子！`, 'success');
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
    const filtered = sentences.filter(item => {
      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const v = String(val).toLowerCase();
        if (key === 'sentence') return (item.sentence||'').toLowerCase().includes(v);
        if (key === 'translation') return (item.translation||'').toLowerCase().includes(v);
        if (key === 'note') return (item.note||'').toLowerCase().includes(v);
        return true;
      });
    });
    setFilteredSentences(filtered);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setFilteredSentences([]);
  };

  const handleEdit = (sentence) => {
    setEditingSentence(sentence);
    setFormData({
      sentence: sentence.sentence,
      englishName: sentence.englishName || '',
      translation: sentence.translation,
      note: sentence.note || '',
      patternIds: Array.isArray(sentence.patterns) ? sentence.patterns.map(p => p.id) : (sentence.patternIds || [])
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      sentence: '',
      englishName: '',
      translation: '',
      note: '',
      patternIds: []
    });
    setEditingSentence(null);
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
      message: `确定要删除选中的 ${selectedIds.length} 个句子吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await sentencesAPI.bulkDelete(selectedIds);
          await fetchSentences();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting sentences:', error);
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
        <h1>句子管理</h1>
        <p>管理英语句子及其翻译</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 添加新句子
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
            { key: 'sentence', label: '句子', type: 'text', placeholder: '输入英文句子...' },
            { key: 'translation', label: '翻译', type: 'text', placeholder: '输入中文翻译...' },
            { key: 'note', label: '备注', type: 'text', placeholder: '输入备注...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : sentences.length === 0 ? (
        <div className="empty-state">
          <h3>还没有句子</h3>
          <p>开始添加您的第一个句子吧！</p>
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
                  <th>句子</th>
                  <th>翻译</th>
                  <th>备注</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((sentence) => (
                  <tr key={sentence.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sentence.id)}
                        onChange={() => handleSelectOne(sentence.id)}
                      />
                    </td>
                    <td className="text-cell"><strong>{sentence.sentence}</strong></td>
                    <td className="text-cell">{sentence.translation}</td>
                    <td className="text-cell" style={{ color: '#666' }}>{sentence.note}</td>
                    <td>{new Date(sentence.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-view-detail" 
                          onClick={() => setDetailView({
                            show: true,
                            title: '句子详情',
                            content: `句子：${sentence.sentence}\n\n翻译：${sentence.translation}\n\n备注：${sentence.note || '无'}`
                          })}
                        >
                          详情
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleEdit(sentence)}>
                          编辑
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(sentence.id)}>
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
            {currentData.map((sentence) => (
              <div key={sentence.id} className="mobile-card">
                <div className="mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(sentence.id)}
                    onChange={() => handleSelectOne(sentence.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <div className="mobile-card-title">{sentence.sentence}</div>
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">翻译</div>
                    <div className="mobile-card-value">{sentence.translation}</div>
                  </div>
                  {sentence.note && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">备注</div>
                      <div className="mobile-card-value" style={{ color: '#666' }}>
                        {sentence.note}
                      </div>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">创建时间</div>
                    <div className="mobile-card-value">
                      {new Date(sentence.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(sentence)}>
                    编辑
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(sentence.id)}>
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
            <h2>{editingSentence ? '编辑句子' : '添加新句子'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>句子 *</label>
                <textarea
                  value={formData.sentence}
                  onChange={(e) => setFormData({ ...formData, sentence: e.target.value })}
                  required
                  placeholder="The quick brown fox jumps over the lazy dog."
                />
              </div>

              <div className="form-group">
                <label>英文名称（可选）</label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  placeholder="简短英文名，便于检索"
                />
              </div>

              <div className="form-group">
                <label>翻译 *</label>
                <textarea
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  required
                  placeholder="敏捷的棕色狐狸跳过懒狗。"
                />
              </div>

              <div className="form-group">
                <label>关联句型（可选）</label>
                <MultiSelect
                  options={allPatterns.map(p => ({ value: p.id, label: p.pattern || p.name }))}
                  value={formData.patternIds}
                  onChange={(vals) => setFormData({ ...formData, patternIds: vals })}
                  placeholder="搜索句型…"
                />
              </div>

              <div className="form-group">
                <label>备注（可选）</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="语法说明或使用提示"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingSentence ? '更新' : '创建')}
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
        title="批量导入句子"
        moduleName="句子"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入句子"
        moduleName="句子"
      />
    </div>
  );
}

export default Sentences;
