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
  const [wordFilter, setWordFilter] = useState('all'); // 'all' | 'categorized' | 'uncategorized'
  const [loadingWords, setLoadingWords] = useState(false); // 单词加载状态
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
    setWordSearch('');
    setWordFilter('all'); // 重置筛选
    setLoadingWords(true); // 开始加载
    try {
      const res = await wordsAPI.getAll();
      const words = res.data.data || [];
      setAllWords(words);
      // 预选中属于该分类ID的 - 使用 categoryIds 数组
      const categoryId = category.id || '';
      const wordsInCategory = words.filter(w => {
        const wordCategoryIds = w.categoryIds || (w.categoryId ? [w.categoryId] : []);
        return wordCategoryIds.includes(categoryId);
      });
      setSelectedWordIds(wordsInCategory.map(w => w.id));
    } catch (e) {
      showToast('获取单词列表失败', 'error');
    } finally {
      setLoadingWords(false); // 加载完成
    }
  };

  const filteredWords = allWords.filter(w => {
    // 首先应用分类筛选（已归类/未归类）
    const wordCategoryIds = w.categoryIds || (w.categoryId ? [w.categoryId] : []);
    const hasCategories = wordCategoryIds.length > 0;

    if (wordFilter === 'categorized' && !hasCategories) return false;
    if (wordFilter === 'uncategorized' && hasCategories) return false;

    // 然后应用搜索筛选
    if (!wordSearch.trim()) return true;
    const s = wordSearch.trim().toLowerCase();
    const wordLower = (w.word || '').toLowerCase();
    const categoryLower = (w.category || '').toLowerCase();
    // 同时搜索单词和分类名称
    const categoryNames = categories
      .filter(cat => wordCategoryIds.includes(cat.id))
      .map(cat => cat.name.toLowerCase());
    return wordLower.includes(s) ||
      categoryLower.includes(s) ||
      categoryNames.some(name => name.includes(s));
  });

  const toggleWord = (id) => {
    setSelectedWordIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveManageWords = async () => {
    if (!manageWordsFor) return;
    const catId = manageWordsFor.id || '';
    // 计算需要设置/清空的单词
    const currentInCat = allWords.filter(w => {
      const wordCategoryIds = w.categoryIds || (w.categoryId ? [w.categoryId] : []);
      return wordCategoryIds.includes(catId);
    }).map(w => w.id);

    const toAdd = selectedWordIds.filter(id => !currentInCat.includes(id));
    const toRemove = currentInCat.filter(id => !selectedWordIds.includes(id));

    try {
      // 添加分类
      for (const id of toAdd) {
        const word = allWords.find(w => w.id === id);
        if (word) {
          const currentCategoryIds = word.categoryIds || (word.categoryId ? [word.categoryId] : []);
          const newCategoryIds = [...new Set([...currentCategoryIds, catId])];
          await wordsAPI.update(id, { categoryIds: newCategoryIds });
        }
      }
      // 移除分类
      for (const id of toRemove) {
        const word = allWords.find(w => w.id === id);
        if (word) {
          const currentCategoryIds = word.categoryIds || (word.categoryId ? [word.categoryId] : []);
          const newCategoryIds = currentCategoryIds.filter(cid => cid !== catId);
          await wordsAPI.update(id, { categoryIds: newCategoryIds });
        }
      }
      showToast(`成功更新 ${toAdd.length + toRemove.length} 个单词的分类`, 'success');
      fetchAll(); // 刷新分类列表
      setManageWordsFor(null);
    } catch (e) {
      showToast('更新失败', 'error');
    }
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
                    {/* <th>创建时间</th> */}
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
                      {/* <td>{new Date(row.createdAt).toLocaleDateString()}</td> */}
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
          <div className="modal manage-words-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
            <h2 >管理分类下的单词 - {manageWordsFor.name}</h2>

            {/* 统计信息和筛选 - 包含加载覆盖层 */}
            <div style={{ position: 'relative' }}>
              {/* 统计信息 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'var(--glass-bg)',
                borderRadius: '10px',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  共 {filteredWords.length} 个单词，已选中 {selectedWordIds.filter(id => filteredWords.some(w => w.id === id)).length} 个
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      const allFilteredIds = filteredWords.map(w => w.id);
                      setSelectedWordIds(prev => {
                        const newIds = [...new Set([...prev, ...allFilteredIds])];
                        return newIds;
                      });
                    }}
                    disabled={loadingWords}
                    style={{ fontSize: '12px', padding: '4px 12px', height: '28px' }}
                  >
                    全选当前
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      const allFilteredIds = filteredWords.map(w => w.id);
                      setSelectedWordIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                    }}
                    disabled={loadingWords}
                    style={{ fontSize: '12px', padding: '4px 12px', height: '28px' }}
                  >
                    全不选
                  </button>
                </div>
              </div>

              {/* 搜索和筛选 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
                alignItems: 'flex-end',
                padding: '0 16px'
              }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input
                    type="text"
                    value={wordSearch}
                    onChange={(e) => setWordSearch(e.target.value)}
                    placeholder="输入英文单词或分类名称..."
                    disabled={loadingWords}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ width: '180px', marginBottom: 0 }}>
                  <select
                    value={wordFilter}
                    onChange={(e) => setWordFilter(e.target.value)}
                    disabled={loadingWords}
                  >
                    <option value="all">全部</option>
                    <option value="categorized">已归类</option>
                    <option value="uncategorized">未归类</option>
                  </select>
                </div>
              </div>

              {/* 单词列表 */}
              <div style={{
                height: '220px',
                maxHeight: '220px',
                overflowY: 'auto',
                overflowX: 'hidden',
                border: '1px solid var(--line-divider)',
                borderRadius: '12px',
                padding: '12px',
                background: 'var(--glass-bg)',
                position: 'relative',
                margin:'16px'
              }}>
                {loadingWords ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-secondary)',
                    minHeight: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(16, 185, 129, 0.2)',
                        borderTopColor: 'var(--brand-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                      }}></div>
                      <span style={{ fontSize: '14px' }}>正在加载单词列表...</span>
                    </div>
                  </div>
                ) : filteredWords.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    {wordSearch || wordFilter !== 'all' ? '未找到匹配的单词' : '暂无单词'}
                  </div>
                ) : (
                  filteredWords.map(w => {
                    const wordCategoryIds = w.categoryIds || (w.categoryId ? [w.categoryId] : []);
                    const isInCategory = wordCategoryIds.includes(manageWordsFor.id);
                    const otherCategories = categories.filter(cat =>
                      cat.id !== manageWordsFor.id && wordCategoryIds.includes(cat.id)
                    );

                    return (
                      <label
                        key={w.id}
                        className="word-manage-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          background: selectedWordIds.includes(w.id)
                            ? 'rgba(16, 185, 129, 0.08)'
                            : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedWordIds.includes(w.id) && !loadingWords) {
                            e.currentTarget.style.background = 'var(--glass-bg-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedWordIds.includes(w.id) && !loadingWords) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWordIds.includes(w.id)}
                          onChange={() => toggleWord(w.id)}
                          disabled={loadingWords}
                          style={{ flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                              {w.word}
                            </span>
                            {isInCategory && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
                                color: 'var(--brand-primary)',
                                borderRadius: '6px',
                                fontWeight: 500,
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                              }}>
                                已归类
                              </span>
                            )}
                          </div>
                          {otherCategories.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '4px' }}>
                                其他分类:
                              </span>
                              {otherCategories.map(cat => (
                                <span
                                  key={cat.id}
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* 加载覆盖层 - 覆盖统计、搜索和列表区域 */}
              {loadingWords && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: '12px',
                  pointerEvents: 'none'
                }}>
                  <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid rgba(16, 185, 129, 0.2)',
                      borderTopColor: 'var(--brand-primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 12px'
                    }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>加载中...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setManageWordsFor(null)}>取消</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveManageWords}
                disabled={selectedWordIds.length === 0 && filteredWords.filter(w => {
                  const wordCategoryIds = w.categoryIds || (w.categoryId ? [w.categoryId] : []);
                  return wordCategoryIds.includes(manageWordsFor.id);
                }).length === 0}
              >
                保存 ({selectedWordIds.filter(id => filteredWords.some(w => w.id === id)).length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;


