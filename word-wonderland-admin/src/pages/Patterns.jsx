import React, { useState, useEffect } from 'react';
import { patternsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';

function Patterns() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [formData, setFormData] = useState({
    pattern: '',
    description: '',
    example: '',
    translation: ''
  });

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(patterns, 5);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const response = await patternsAPI.getAll();
      setPatterns(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      alert('获取句型失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPattern) {
        await patternsAPI.update(editingPattern.id, formData);
      } else {
        await patternsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchPatterns();
    } catch (error) {
      console.error('Error saving pattern:', error);
      alert('保存句型失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个句型吗？')) return;
    try {
      await patternsAPI.delete(id);
      await fetchPatterns();
      alert('删除成功');
    } catch (error) {
      console.error('Error deleting pattern:', error);
      alert(error.response?.data?.message || '删除句型失败');
    }
  };

  const handleEdit = (pattern) => {
    setEditingPattern(pattern);
    setFormData({
      pattern: pattern.pattern,
      description: pattern.description,
      example: pattern.example || '',
      translation: pattern.translation || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      pattern: '',
      description: '',
      example: '',
      translation: ''
    });
    setEditingPattern(null);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>句型管理</h1>
        <p>管理英语句型和结构</p>
      </div>

      <div className="page-content">
        <div className="actions">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + 添加新句型
        </button>
      </div>

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
                    <td>{pattern.description}</td>
                    <td>
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
              <div className="form-group">
                <label>句型 *</label>
                <input
                  type="text"
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  required
                  placeholder="例如：主语 + 动词 + 宾语"
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
                <button type="submit" className="btn btn-primary">
                  {editingPattern ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patterns;
