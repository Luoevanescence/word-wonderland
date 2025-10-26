import React, { useState, useEffect } from 'react';
import { patternsAPI, componentsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import { Link } from 'react-router-dom';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta } from '../utils/exportUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import PatternBuilder from '../components/PatternBuilder';
import { useConfirmDialog, useToast } from '../hooks/useDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';

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
  
  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(patterns, 5);

  useEffect(() => {
    fetchPatterns();
    fetchComponents();
  }, []);

  // 初始化表格列宽拖拽
  useEffect(() => {
    if (patterns.length > 0) {
      setTimeout(() => {
        initTableResize();
      }, 100);
    }
    return () => {
      cleanupTableResize();
    };
  }, [patterns]);

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

  // 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(patterns, 'patterns');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
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
          
          <ExportButton
            onExport={handleExportAll}
            disabled={loading || patterns.length === 0}
            label="导出句型"
          />
        </div>

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
            <Link to="/components" style={{ color: '#667eea', marginLeft: '10px', textDecoration: 'underline' }}>
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
                    <td><strong style={{ color: '#667eea' }}>{pattern.pattern}</strong></td>
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

          {/* 移动端卡片视图 - 显示所有数据，不分页 */}
          <div className="mobile-card-view">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title" style={{ color: '#667eea' }}>
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
    </div>
  );
}

export default Patterns;
