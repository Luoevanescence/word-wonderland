import React, { useState, useEffect } from 'react';
import { topicsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta } from '../utils/exportUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';

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

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(topics, 5);

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

  // 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(topics, 'topics');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

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
          
          <ExportButton
            onExport={handleExportAll}
            disabled={loading || topics.length === 0}
            label="导出主题"
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

      {/* Toast通知 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* 详情查看弹窗 */}
      <DetailViewModal
        isOpen={detailView.show}
        title={detailView.title}
        content={detailView.content}
        onClose={() => setDetailView({ show: false, title: '', content: '' })}
      />
    </div>
  );
}

export default Topics;
