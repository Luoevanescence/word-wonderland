import React, { useEffect, useState } from 'react';
import { categoriesAPI, wordsAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import FilterBar from '../components/FilterBar';
import DetailViewModal from '../components/DetailViewModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [manageWordsFor, setManageWordsFor] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [wordSearch, setWordSearch] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]); // 筛选后的数据
  const [activeFilters, setActiveFilters] = useState({}); // 当前激活的筛选条件
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看

  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook - 使用筛选后的数据或全部数据
  const displayData = Object.keys(activeFilters).length > 0 ? filteredCategories : categories;
  const { currentData, renderPagination } = usePagination(displayData, 8);

  useEffect(() => { fetchAll(); }, []);

  // 当分类数据变化时，重新应用筛选
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      applyFilters(activeFilters);
    }
  }, [categories]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || []);
    } catch (e) {
      showToast('获取分类失败', 'error');
    } finally { setLoading(false); }
  };

  const openManageWords = async (category) => {
    setManageWordsFor(category);
    setAllWords([]);
    setSelectedWordIds([]);
    try {
      const res = await wordsAPI.getAll();
      const words = res.data.data || [];
      setAllWords(words);
      // 预选中属于该分类ID的
      setSelectedWordIds(words.filter(w => (w.categoryId || '') === (category.id || '')).map(w => w.id));
    } catch (e) {}
  };

  const filteredWords = allWords.filter(w => {
    if (!wordSearch.trim()) return true;
    const s = wordSearch.trim().toLowerCase();
    return (w.word || '').toLowerCase().includes(s) || (w.category || '').toLowerCase().includes(s);
  });

  const toggleWord = (id) => {
    setSelectedWordIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveManageWords = async () => {
    if (!manageWordsFor) return;
    const catId = manageWordsFor.id || '';
    // 计算需要设置/清空
    const currentInCat = allWords.filter(w => (w.categoryId || '') === catId).map(w => w.id);
    const toAdd = selectedWordIds.filter(id => !currentInCat.includes(id));
    const toRemove = currentInCat.filter(id => !selectedWordIds.includes(id));
    try {
      for (const id of toAdd) { await wordsAPI.update(id, { categoryId: catId }); }
      for (const id of toRemove) { await wordsAPI.update(id, { categoryId: '' }); }
      setManageWordsFor(null);
    } catch (e) {}
  };

  const openAdd = () => { setEditing(null); setFormData({ name: '', code: '', description: '' }); setShowModal(true); };
  const openEdit = (row) => { setEditing(row); setFormData({ name: row.name, code: row.code || '', description: row.description || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await categoriesAPI.update(editing.id, formData);
      else await categoriesAPI.create(formData);
      showToast(editing ? '更新成功' : '创建成功', 'success');
      setShowModal(false); setEditing(null); setFormData({ name: '', code: '', description: '' });
      fetchAll();
    } catch (e) { showToast(e.response?.data?.message || '保存失败', 'error'); }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除该分类吗？',
      type: 'danger',
      onConfirm: async () => {
        try { await categoriesAPI.delete(id); fetchAll(); showToast('删除成功', 'success'); }
        catch (e) { showToast('删除失败', 'error'); }
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(currentData.map(i => i.id)); else setSelectedIds([]);
  };
  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    showConfirm({
      title: '批量删除',
      message: `确定删除选中的 ${selectedIds.length} 项？`,
      type: 'danger',
      onConfirm: async () => {
        try { await categoriesAPI.bulkDelete(selectedIds); setSelectedIds([]); fetchAll(); showToast('批量删除成功', 'success'); }
        catch (e) { showToast('批量删除失败', 'error'); }
      }
    });
  };

  // 筛选功能
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    
    const filtered = categories.filter(category => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        const searchValue = value.toLowerCase();
        
        if (key === 'name') {
          return (category.name || '').toLowerCase().includes(searchValue);
        }
        
        if (key === 'code') {
          return (category.code || '').toLowerCase().includes(searchValue);
        }
        
        if (key === 'description') {
          return (category.description || '').toLowerCase().includes(searchValue);
        }
        
        return true;
      });
    });
    
    setFilteredCategories(filtered);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setFilteredCategories([]);
  };

  // 查看详情
  const handleViewDetail = (category) => {
    const content = `
代码：${category.code || '无'}
名称：${category.name}
${category.description ? `描述：${category.description}` : ''}
    `.trim();
    
    setDetailView({
      show: true,
      title: `分类详情 - ${category.name}`,
      content: content
    });
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>单词分类</h1>
        <p>管理单词分类（例如：CET-4、CET-6、考研、托福等）</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={openAdd}>+ 新建分类</button>
          {selectedIds.length > 0 && (
            <div className="bulk-actions">
              <span className="bulk-actions-label">已选择 {selectedIds.length} 项</span>
              <button className="btn btn-danger btn-small" onClick={handleBulkDelete}>批量删除</button>
            </div>
          )}
        </div>

        {/* 筛选条 */}
        <FilterBar
          filterFields={[
            { key: 'name', label: '名称', type: 'text', placeholder: '输入分类名称...' },
            { key: 'code', label: '代码', type: 'text', placeholder: '输入分类代码...' },
            { key: 'description', label: '描述', type: 'text', placeholder: '输入描述...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

        {loading ? (
          <div className="loading">加载中...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state"><h3>还没有分类</h3><p>点击上方按钮新建一个分类。</p></div>
        ) : (
          <>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input type="checkbox" className="select-all-checkbox" checked={selectedIds.length === currentData.length && currentData.length > 0} onChange={handleSelectAll} />
                    </th>
                    <th>名称</th>
                    <th>代码</th>
                    <th>描述</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row) => (
                    <tr key={row.id}>
                      <td className="checkbox-cell">
                        <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => handleSelectOne(row.id)} />
                      </td>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.code}</td>
                      <td className="text-cell">{row.description}</td>
                      <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="btn-view-detail" 
                            onClick={() => handleViewDetail(row)}
                          >
                            详情
                          </button>
                          <button className="btn btn-secondary btn-small" onClick={() => openEdit(row)}>编辑</button>
                          <button className="btn btn-info btn-small" onClick={() => openManageWords(row)}>管理单词</button>
                          <button className="btn btn-danger btn-small" onClick={() => handleDelete(row.id)}>删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? '编辑分类' : '新建分类'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>名称 *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="例如：CET-6" />
              </div>
              <div className="form-group">
                <label>代码</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="例如：cet6" />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="说明此分类用途" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">{editing ? '更新' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={dialogState.isOpen} title={dialogState.title} message={dialogState.message} type={dialogState.type} onConfirm={dialogState.onConfirm} onCancel={closeDialog} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* 详情查看弹窗 */}
      <DetailViewModal
        show={detailView.show}
        title={detailView.title}
        content={detailView.content}
        onClose={() => setDetailView({ show: false, title: '', content: '' })}
      />

      {manageWordsFor && (
        <div className="modal-overlay" onClick={() => setManageWordsFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>管理分类下的单词 - {manageWordsFor.name}</h2>
            <div className="form-group">
              <label>搜索单词</label>
              <input type="text" value={wordSearch} onChange={(e)=>setWordSearch(e.target.value)} placeholder="输入英文或分类" />
            </div>
            <div style={{ maxHeight: '320px', overflow: 'auto', border: '1px solid var(--line-divider)', borderRadius: '8px', padding: '8px' }}>
              {filteredWords.map(w => (
                <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}>
                  <input type="checkbox" checked={selectedWordIds.includes(w.id)} onChange={()=>toggleWord(w.id)} />
                  <span style={{ fontWeight: 600 }}>{w.word}</span>
                  <span style={{ color: '#888' }}>{w.category || '未分类'}</span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={()=>setManageWordsFor(null)}>取消</button>
              <button type="button" className="btn btn-primary" onClick={saveManageWords}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;


