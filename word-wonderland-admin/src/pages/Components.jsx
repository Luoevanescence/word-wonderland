import React, { useState, useEffect } from 'react';
import { componentsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta } from '../utils/exportUtils';
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
    description: '',
    example: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' });

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  const { currentData, renderPagination } = usePagination(components, 5);

  useEffect(() => {
    fetchComponents();
  }, []);

  // 初始化表格列宽拖拽
  useEffect(() => {
    if (components.length > 0) {
      setTimeout(() => {
        initTableResize();
      }, 100);
    }
    return () => {
      cleanupTableResize();
    };
  }, [components]);

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
      description: component.description || '',
      example: component.example || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingComponent(null);
    setFormData({
      name: '',
      description: '',
      example: ''
    });
  };

  const handleExportAll = () => {
    downloadJSONWithMeta(components, 'components');
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
          
          <ExportButton
            onExport={handleExportAll}
            selectedCount={0}
            disabled={loading || components.length === 0}
            label="导出成分"
          />
        </div>

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
                  <th>成分名称</th>
                  <th>说明</th>
                  <th>示例</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((component) => (
                  <tr key={component.id}>
                    <td><strong>{component.name}</strong></td>
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

          {/* 移动端卡片视图 */}
          <div className="mobile-card-view">
            {components.map((component) => (
              <div key={component.id} className="mobile-card">
                <div className="mobile-card-header">
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
    </div>
  );
}

export default Components;

