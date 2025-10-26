import React, { useState, useEffect } from 'react';
import { phrasesAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';

function Phrases() {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [formData, setFormData] = useState({
    phrase: '',
    meaning: '',
    example: ''
  });
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(phrases, 5);

  useEffect(() => {
    fetchPhrases();
  }, []);

  // 初始化表格列宽拖拽
  useEffect(() => {
    if (phrases.length > 0) {
      setTimeout(() => {
        initTableResize();
      }, 100);
    }
    return () => {
      cleanupTableResize();
    };
  }, [phrases]);

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

  // 导出功能
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

  const handleEdit = (phrase) => {
    setEditingPhrase(phrase);
    setFormData({
      phrase: phrase.phrase,
      meaning: phrase.meaning,
      example: phrase.example || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      phrase: '',
      meaning: '',
      example: ''
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
          
          <ExportButton
            onExport={handleExportAll}
            onExportSelected={handleExportSelected}
            selectedCount={selectedIds.length}
            disabled={loading || phrases.length === 0}
            label="导出短语"
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
                  <th>短语</th>
                  <th>含义</th>
                  <th>例句</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((phrase) => (
                  <tr key={phrase.id}>
                    <td><strong>{phrase.phrase}</strong></td>
                    <td className="text-cell">{phrase.meaning}</td>
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

          {/* 移动端卡片视图 - 显示所有数据，不分页 */}
          <div className="mobile-card-view">
            {phrases.map((phrase) => (
              <div key={phrase.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title">{phrase.phrase}</div>
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">含义</div>
                    <div className="mobile-card-value">{phrase.meaning}</div>
                  </div>
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

      {/* Toast通知 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Phrases;
