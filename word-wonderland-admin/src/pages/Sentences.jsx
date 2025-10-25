import React, { useState, useEffect } from 'react';
import { sentencesAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';

function Sentences() {
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSentence, setEditingSentence] = useState(null);
  const [formData, setFormData] = useState({
    sentence: '',
    translation: '',
    note: ''
  });

  // 使用分页 hook
  const { currentData, renderPagination } = usePagination(sentences, 5);

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    try {
      setLoading(true);
      const response = await sentencesAPI.getAll();
      setSentences(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sentences:', error);
      alert('获取句子失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSentence) {
        await sentencesAPI.update(editingSentence.id, formData);
      } else {
        await sentencesAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchSentences();
    } catch (error) {
      console.error('Error saving sentence:', error);
      alert('保存句子失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个句子吗？')) return;
    try {
      await sentencesAPI.delete(id);
      await fetchSentences();
      alert('删除成功');
    } catch (error) {
      console.error('Error deleting sentence:', error);
      alert(error.response?.data?.message || '删除句子失败');
    }
  };

  // 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(sentences, 'sentences');
    if (success) {
      alert('导出成功！');
    } else {
      alert('导出失败，请重试');
    }
  };

  const handleEdit = (sentence) => {
    setEditingSentence(sentence);
    setFormData({
      sentence: sentence.sentence,
      translation: sentence.translation,
      note: sentence.note || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      sentence: '',
      translation: '',
      note: ''
    });
    setEditingSentence(null);
  };

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
          
          <ExportButton
            onExport={handleExportAll}
            disabled={loading || sentences.length === 0}
            label="导出句子"
          />
        </div>

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
                    <td><strong>{sentence.sentence}</strong></td>
                    <td>{sentence.translation}</td>
                    <td style={{ color: '#666' }}>{sentence.note}</td>
                    <td>{new Date(sentence.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
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

          {/* 移动端卡片视图 - 显示所有数据，不分页 */}
          <div className="mobile-card-view">
            {sentences.map((sentence) => (
              <div key={sentence.id} className="mobile-card">
                <div className="mobile-card-content">
                  <div className="mobile-card-row">
                    <div className="mobile-card-label">句子</div>
                    <div className="mobile-card-value" style={{ fontWeight: 600 }}>
                      {sentence.sentence}
                    </div>
                  </div>
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
                <label>翻译 *</label>
                <textarea
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  required
                  placeholder="敏捷的棕色狐狸跳过懒狗。"
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
                <button type="submit" className="btn btn-primary">
                  {editingSentence ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sentences;
