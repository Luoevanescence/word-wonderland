import React, { useState, useEffect } from 'react';
import { phrasesAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';

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

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(phrases, 5);

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      setLoading(true);
      const response = await phrasesAPI.getAll();
      setPhrases(response.data.data || []);
    } catch (error) {
      console.error('Error fetching phrases:', error);
      alert('获取短语失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPhrase) {
        await phrasesAPI.update(editingPhrase.id, formData);
      } else {
        await phrasesAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchPhrases();
    } catch (error) {
      console.error('Error saving phrase:', error);
      alert('保存短语失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个短语吗？')) return;
    try {
      await phrasesAPI.delete(id);
      await fetchPhrases();
      alert('删除成功');
    } catch (error) {
      console.error('Error deleting phrase:', error);
      alert(error.response?.data?.message || '删除短语失败');
    }
  };

  // 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(phrases, 'phrases');
    if (success) {
      alert('导出成功！');
    } else {
      alert('导出失败，请重试');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(phrases, selectedIds, 'phrases');
    if (success) {
      alert(`成功导出 ${selectedIds.length} 个短语！`);
    } else {
      alert('导出失败，请重试');
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
      alert('请先选择要删除的项目');
      return;
    }

    if (!window.confirm(`确定要删除选中的 ${selectedIds.length} 个短语吗？`)) return;

    try {
      const response = await phrasesAPI.bulkDelete(selectedIds);
      await fetchPhrases();
      setSelectedIds([]);
      alert(response.data.message || '批量删除成功');
    } catch (error) {
      console.error('Error bulk deleting phrases:', error);
      alert(error.response?.data?.message || '批量删除失败');
    }
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
                    <td>{phrase.meaning}</td>
                    <td style={{ fontStyle: 'italic', color: '#666' }}>{phrase.example}</td>
                    <td>{new Date(phrase.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
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
                <button type="submit" className="btn btn-primary">
                  {editingPhrase ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Phrases;
