import React, { useState, useEffect } from 'react';
import { wordsAPI, partsOfSpeechAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { usePagination } from '../hooks/usePagination.jsx';
import CustomSelect from '../components/CustomSelect';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';

function Words() {
  const [words, setWords] = useState([]);
  const [partsOfSpeech, setPartsOfSpeech] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    definitions: [{ partOfSpeech: '', meaning: '' }]
  });
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除：选中的ID列表
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(words, 5);

  useEffect(() => {
    fetchWords();
    fetchPartsOfSpeech();
  }, []);

  // 初始化表格列宽拖拽
  useEffect(() => {
    if (words.length > 0) {
      // 延迟初始化，确保表格已渲染
      setTimeout(() => {
        initTableResize();
      }, 100);
    }
    return () => {
      cleanupTableResize();
    };
  }, [words]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordsAPI.getAll();
      setWords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching words:', error);
      showToast('获取单词失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartsOfSpeech = async () => {
    try {
      const response = await partsOfSpeechAPI.getAll();
      setPartsOfSpeech(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parts of speech:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交

    setSubmitting(true);
    try {
      if (editingWord) {
        await wordsAPI.update(editingWord.id, formData);
      } else {
        await wordsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchWords();
      showToast(editingWord ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving word:', error);
      showToast(error.response?.data?.message || '保存单词失败', 'error');
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

    showConfirm({
      title: '确认删除',
      message: '确定要删除这个单词吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await wordsAPI.delete(id);
          await fetchWords();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting word:', error);
          showToast(error.response?.data?.message || '删除单词失败', 'error');
        }
      }
    });
  };

  // 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(words, 'words');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(words, selectedIds, 'words');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个单词！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
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
      title: '批量删除确认',
      message: `确定要删除选中的 ${selectedIds.length} 个单词吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await wordsAPI.bulkDelete(selectedIds);
          await fetchWords();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting words:', error);
          showToast(error.response?.data?.message || '批量删除失败', 'error');
        }
      }
    });
  };

  const handleEdit = (word) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      definitions: word.definitions
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      word: '',
      definitions: [{ partOfSpeech: '', meaning: '' }]
    });
    setEditingWord(null);
  };

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  const addDefinition = () => {
    setFormData({
      ...formData,
      definitions: [...formData.definitions, { partOfSpeech: '', meaning: '' }]
    });
  };

  const removeDefinition = (index) => {
    const newDefinitions = formData.definitions.filter((_, i) => i !== index);
    setFormData({ ...formData, definitions: newDefinitions });
  };

  const updateDefinition = (index, field, value) => {
    const newDefinitions = [...formData.definitions];
    newDefinitions[index][field] = value;
    setFormData({ ...formData, definitions: newDefinitions });
  };

  const openAddModal = () => {
    if (partsOfSpeech.length === 0) {
      showConfirm({
        title: '缺少词性',
        message: '还没有可用的词性！需要先创建词性才能添加单词。\n\n是否现在前往词性管理页面？',
        type: 'alert',
        onConfirm: () => {
          window.location.href = '/parts-of-speech';
        }
      });
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>单词管理</h1>
        <p>管理您的词汇单词，支持多个词性定义</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            + 添加新单词
          </button>

          <ExportButton
            onExport={handleExportAll}
            onExportSelected={handleExportSelected}
            selectedCount={selectedIds.length}
            disabled={loading || words.length === 0}
            label="导出单词"
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

        {partsOfSpeech.length === 0 && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            <strong>⚠️ 提示：</strong> 您还没有创建任何词性。
            <Link to="/parts-of-speech" style={{ color: 'var(--brand-primary)', marginLeft: '10px', textDecoration: 'underline' }}>
              点击前往词性管理页面
            </Link>
          </div>
        )}

        {loading ? (
          <div className="loading">加载中...</div>
        ) : words.length === 0 ? (
          <div className="empty-state">
            <h3>还没有单词</h3>
            <p>开始添加您的第一个单词吧！</p>
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
                    <th>单词</th>
                    <th>释义</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((word) => (
                    <tr key={word.id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(word.id)}
                          onChange={() => handleSelectOne(word.id)}
                        />
                      </td>
                      <td><strong>{word.word}</strong></td>
                      <td className="text-cell">
                        <span style={{ fontWeight: 500, color: 'var(--brand-primary)' }}>
                          {word.definitions[0]?.partOfSpeech}
                        </span>{' '}
                        {word.definitions[0]?.meaning}
                      </td>
                      <td>{new Date(word.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-view-detail"
                            onClick={() => setDetailView({
                              show: true,
                              title: `单词释义：${word.word}`,
                              content: word.definitions.map((def, idx) =>
                                `${def.partOfSpeech} ${def.meaning}`
                              ).join('\n\n')
                            })}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            详情
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => handleEdit(word)}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            编辑
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={(e) => handleDelete(word.id, e)}
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

            {/* 移动端卡片视图 - 显示所有数据，不分页 */}
            <div className="mobile-card-view">
              {words.map((word) => (
                <div key={word.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(word.id)}
                      onChange={() => handleSelectOne(word.id)}
                      style={{ marginRight: '10px' }}
                    />
                    <div className="mobile-card-title">{word.word}</div>
                  </div>
                  <div className="mobile-card-content">
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">释义</div>
                      <div className="mobile-card-value">
                        {word.definitions.map((def, idx) => (
                          <div key={idx}>
                            <span style={{ fontWeight: 500, color: 'var(--brand-primary)' }}>
                              {def.partOfSpeech}
                            </span>{' '}
                            {def.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">创建时间</div>
                      <div className="mobile-card-value">
                        {new Date(word.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(word)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={(e) => handleDelete(word.id, e)}
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
            <h2>{editingWord ? '编辑单词' : '添加新单词'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>单词 *</label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  required
                  placeholder="例如：run"
                />
              </div>

              <div className="form-group">
                <label>释义 *</label>
                {formData.definitions.map((def, index) => (
                  <div key={index} className="definition-item">
                    {formData.definitions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-small remove-definition-btn"
                        onClick={() => removeDefinition(index)}
                        title="移除此释义"
                      >
                        ✕
                      </button>
                    )}
                    <div className="form-group form-group-z-index-selector">
                      <label>词性 *</label>
                      <CustomSelect
                        value={def.partOfSpeech}
                        onChange={(value) => updateDefinition(index, 'partOfSpeech', value)}
                        options={partsOfSpeech.map((pos) => ({
                          value: pos.code,
                          label: `${pos.code} - ${pos.name}`
                        }))}
                        placeholder="请选择词性"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>中文释义 *</label>
                      <input
                        type="text"
                        value={def.meaning}
                        onChange={(e) => updateDefinition(index, 'meaning', e.target.value)}
                        required
                        placeholder="跑步；运行"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="add-definition-btn" onClick={addDefinition}>
                  + 添加另一个释义
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingWord ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 自定义确认对话框 */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />

      {/* 详情查看弹窗 */}
      <DetailViewModal
        show={detailView.show}
        title={detailView.title}
        content={detailView.content}
        onClose={() => setDetailView({ show: false, title: '', content: '' })}
      />

      {/* Toast通知 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Words;
