import React, { useState, useEffect } from 'react';
import { phrasesAPI, wordsAPI } from '../services/api';
import MultiSelect from '../components/MultiSelect';
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

function Phrases() {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [formData, setFormData] = useState({
    phrase: '',
    meaning: '',
    example: '',
    wordIds: []
  });
  const [allWords, setAllWords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看
  const [showImportModal, setShowImportModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false);
  const [filteredPhrases, setFilteredPhrases] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { dialogState: inputDialogState, showConfirmInput, closeDialog: closeInputDialog } = useConfirmInputDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 计算显示数据（筛选后优先）
  const displayData = filteredPhrases.length > 0 ? filteredPhrases : phrases;
  // 使用分页 hook（基于显示数据）
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchPhrases();
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const res = await wordsAPI.getAll();
      setAllWords(res.data.data || []);
    } catch (e) {
      // ignore
    }
  };

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (phrases.length > 0) {
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [phrases.length > 0]); // 只在从无数据变为有数据时触发

  const fetchPhrases = async () => {
    try {
      setLoading(true);
      const response = await phrasesAPI.getAll();
      setPhrases(response.data.data || []);
    } catch (error) {
      console.error('Error fetching phrases:', error);
      showToast('获取短语失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交
    
    setSubmitting(true);
    try {
      if (editingPhrase) {
        await phrasesAPI.update(editingPhrase.id, formData);
      } else {
        await phrasesAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchPhrases();
      showToast(editingPhrase ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving phrase:', error);
      showToast(error.response?.data?.message || '保存短语失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个短语吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await phrasesAPI.delete(id);
          await fetchPhrases();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting phrase:', error);
          showToast(error.response?.data?.message || '删除短语失败', 'error');
        }
      }
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(phrases, 'phrases');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(phrases, selectedIds, 'phrases');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个短语！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'phrase', label: '短语' },
      { key: 'meaning', label: '含义' },
      { key: 'example', label: '例句' },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(phrases, '短语数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 导出选中项为 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'phrase', label: '短语' },
      { key: 'meaning', label: '含义' },
      { key: 'example', label: '例句' }
    ];
    const ok = exportSelectedToExcel(phrases, selectedIds, '短语数据', headers);
    if (ok) {
      showToast(`成功导出 ${selectedIds.length} 项到 Excel！`, 'success');
    } else {
      showToast('导出失败，请检查选中项', 'error');
    }
  };

  // Excel 导入功能
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { excelKey: '短语', dataKey: 'phrase', required: true },
      { excelKey: '含义', dataKey: 'meaning', required: true },
      { excelKey: '例句', dataKey: 'example', required: false }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 批量创建短语
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const phraseData of importedData) {
        try {
          await phrasesAPI.create(phraseData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${phraseData.phrase}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchPhrases();
      setShowImportModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个短语！`, 'success');
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
      { key: 'phrase', label: '短语', example: 'break the ice' },
      { key: 'meaning', label: '含义', example: '打破僵局' },
      { key: 'example', label: '例句', example: 'He told a joke to break the ice.' }
    ];

    const sampleData = [
      { '短语': 'break the ice', '含义': '打破僵局', '例句': 'He told a joke to break the ice.' },
      { '短语': 'piece of cake', '含义': '小菜一碟', '例句': 'The test was a piece of cake.' },
      { '短语': 'hit the books', '含义': '努力学习', '例句': 'I need to hit the books tonight.' }
    ];

    const success = downloadExcelTemplate('短语导入', headers, sampleData);
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
          await phrasesAPI.create({
            phrase: item.phrase,
            meaning: item.meaning,
            example: item.example || ''
          });
          successCount++;
        } catch (e) {
          failCount++;
          errors.push(`${item.phrase || '(空)'} 导入失败`);
        }
      }

      await fetchPhrases();
      setShowImportJSONModal(false);
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个短语！`, 'success');
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
    const filtered = phrases.filter(item => {
      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const v = String(val).toLowerCase();
        if (key === 'phrase') return (item.phrase||'').toLowerCase().includes(v);
        if (key === 'meaning') return (item.meaning||'').toLowerCase().includes(v);
        if (key === 'example') return (item.example||'').toLowerCase().includes(v);
        return true;
      });
    });
    setFilteredPhrases(filtered);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setFilteredPhrases([]);
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
      message: `确定要删除选中的 ${selectedIds.length} 个短语吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await phrasesAPI.bulkDelete(selectedIds);
          await fetchPhrases();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting phrases:', error);
          showToast(error.response?.data?.message || '批量删除失败', 'error');
        }
      }
    });
  };

  const handleDeleteAll = async () => {
    if (phrases.length === 0) {
      showToast('没有可删除的数据', 'warning');
      return;
    }

    showConfirmInput({
      title: '警告：删除全部数据',
      message: `您即将删除所有 ${phrases.length} 个短语！\n\n此操作无法撤销，请谨慎操作。`,
      inputLabel: `请输入 "DELETE ALL" 以确认删除：`,
      expectedValue: 'DELETE ALL',
      type: 'danger',
      onConfirm: () => {
        showConfirm({
          title: '删除全部数据确认',
          message: `确定要删除所有 ${phrases.length} 个短语吗？此操作无法撤销，请再次确认。`,
          type: 'danger',
          onConfirm: async () => {
            try {
              const allIds = phrases.map(phrase => phrase.id);
              const response = await phrasesAPI.bulkDelete(allIds);
              await fetchPhrases();
              setSelectedIds([]);
              showToast(response.data.message || `成功删除所有 ${phrases.length} 个短语`, 'success');
            } catch (error) {
              console.error('Error deleting all phrases:', error);
              showToast(error.response?.data?.message || '删除全部失败', 'error');
            }
          }
        });
      }
    });
  };

  const handleEdit = (phrase) => {
    setEditingPhrase(phrase);
    setFormData({
      phrase: phrase.phrase,
      meaning: phrase.meaning,
      example: phrase.example || '',
      wordIds: Array.isArray(phrase.words) ? phrase.words.map(w => w.id) : (phrase.wordIds || [])
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      phrase: '',
      meaning: '',
      example: '',
      wordIds: []
    });
    setEditingPhrase(null);
  };

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>短语管理</h1>
        <p>管理英语短语及其含义</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 添加新短语
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

          {phrases.length > 0 && (
            <div className="bulk-actions" style={{ marginLeft: 'auto' }}>
              <button 
                className="btn btn-danger btn-small" 
                onClick={handleDeleteAll}
                style={{ opacity: 0.8 }}
                title="删除所有数据（危险操作）"
              >
                删除全部 ({phrases.length})
              </button>
            </div>
          )}
        </div>

        <FilterBar
          filterFields={[
            { key: 'phrase', label: '短语', type: 'text', placeholder: '输入短语...' },
            { key: 'meaning', label: '含义', type: 'text', placeholder: '输入含义...' },
            { key: 'example', label: '例句', type: 'text', placeholder: '输入例句...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : phrases.length === 0 ? (
        <div className="empty-state">
          <h3>还没有短语</h3>
          <p>开始添加您的第一个短语吧！</p>
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
                  <th>短语</th>
                  <th>含义</th>
                  <th>关联单词</th>
                  <th>例句</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((phrase) => (
                  <tr key={phrase.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(phrase.id)}
                        onChange={() => handleSelectOne(phrase.id)}
                      />
                    </td>
                    <td><strong>{phrase.phrase}</strong></td>
                    <td className="text-cell">{phrase.meaning}</td>
                    <td className="text-cell">
                      {(() => {
                        const wordIds = phrase.wordIds || (Array.isArray(phrase.words) ? phrase.words.map(w => w.id || w) : []);
                        if (!wordIds || wordIds.length === 0) return '无';
                        const wordNames = wordIds
                          .map(id => {
                            const word = allWords.find(w => w.id === id);
                            return word ? word.word : null;
                          })
                          .filter(Boolean);
                        return wordNames.length > 0 ? wordNames.join(' ; ') : '无';
                      })()}
                    </td>
                    <td className="text-cell" style={{ fontStyle: 'italic', color: '#666' }}>{phrase.example}</td>
                    <td>{new Date(phrase.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-view-detail" 
                          onClick={() => setDetailView({
                            show: true,
                            title: `短语详情：${phrase.phrase}`,
                            content: `含义：${phrase.meaning}\n\n例句：${phrase.example || '无'}`
                          })}
                        >
                          详情
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleEdit(phrase)}>
                          编辑
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(phrase.id)}>
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
            {currentData.map((phrase) => (
              <div key={phrase.id} className="mobile-card">
                <div className="mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(phrase.id)}
                    onChange={() => handleSelectOne(phrase.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <div className="mobile-card-title">{phrase.phrase}</div>
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">含义</div>
                    <div className="mobile-card-value">{phrase.meaning}</div>
                  </div>
                  {(() => {
                    const wordIds = phrase.wordIds || (Array.isArray(phrase.words) ? phrase.words.map(w => w.id || w) : []);
                    const wordNames = wordIds
                      .map(id => {
                        const word = allWords.find(w => w.id === id);
                        return word ? word.word : null;
                      })
                      .filter(Boolean);
                    return wordNames.length > 0 ? (
                      <div className="mobile-card-row">
                        <div className="mobile-card-label">关联单词</div>
                        <div className="mobile-card-value">
                          {wordNames.join(' ; ')}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  {phrase.example && (
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">例句</div>
                      <div className="mobile-card-value" style={{ fontStyle: 'italic', color: '#666' }}>
                        {phrase.example}
                      </div>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">创建时间</div>
                    <div className="mobile-card-value">
                      {new Date(phrase.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(phrase)}>
                    编辑
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(phrase.id)}>
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
            <h2>{editingPhrase ? '编辑短语' : '添加新短语'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>短语 *</label>
                <input
                  type="text"
                  value={formData.phrase}
                  onChange={(e) => setFormData({ ...formData, phrase: e.target.value })}
                  required
                  placeholder="例如：break the ice"
                />
              </div>

              <div className="form-group">
                <label>关联单词</label>
                <MultiSelect
                  options={allWords.map(w => ({ value: w.id, label: w.word, code: (w.categoryId ? '•' : '') }))}
                  value={formData.wordIds}
                  onChange={(ids) => setFormData({ ...formData, wordIds: ids })}
                  placeholder="搜索单词…"
                />
              </div>

              <div className="form-group">
                <label>含义 *</label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  required
                  placeholder="打破僵局"
                />
              </div>

              <div className="form-group">
                <label>例句</label>
                <textarea
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="He told a joke to break the ice at the meeting."
                />
              </div>



              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingPhrase ? '更新' : '创建')}
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

      {/* Excel 导入弹窗 */}
      <ImportExcelModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        title="批量导入短语"
        moduleName="短语"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入短语"
        moduleName="短语"
      />
    </div>
  );
}

export default Phrases;
