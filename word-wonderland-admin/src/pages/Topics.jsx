import React, { useState, useEffect } from 'react';
import { topicsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta } from '../utils/exportUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';

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

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(topics, 5);

  useEffect(() => {
    fetchTopics();
  }, []);

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicsAPI.getAll();
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      alert('获取主题失败');
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
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('保存主题失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个主题吗？')) return;
    try {
      await topicsAPI.delete(id);
      await fetchTopics();
      alert('删除成功');
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert(error.response?.data?.message || '删除主题失败');
    }
  };

  // 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(topics, 'topics');
    if (success) {
      alert('导出成功！');
    } else {
      alert('导出失败，请重试');
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
                  <th>主题名称</th>
                  <th>描述</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((topic) => (
                  <tr key={topic.id}>
                    <td><strong>{topic.name}</strong></td>
                    <td>{topic.description}</td>
                    <td>{new Date(topic.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
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

          {/* 移动端卡片视图 - 显示所有数据，不分页 */}
          <div className="mobile-card-view">
            {topics.map((topic) => (
              <div key={topic.id} className="mobile-card">
                <div className="mobile-card-header">
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
    </div>
  );
}

export default Topics;
