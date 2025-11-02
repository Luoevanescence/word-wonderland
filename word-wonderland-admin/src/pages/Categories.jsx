import React, { useEffect, useState } from 'react';
import { categoriesAPI, wordsAPI, phrasesAPI, sentencesAPI } from '../services/api';
import { usePagination } from '../hooks/usePagination.jsx';
import FilterBar from '../components/FilterBar/FilterBar';
import DetailViewModal from '../components/DetailViewModal/DetailViewModal';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import ConfirmInputDialog from '../components/ConfirmInputDialog/ConfirmInputDialog';
import { ToastContainer } from '../components/Toast/Toast';
import { useConfirmDialog, useConfirmInputDialog, useToast } from '../hooks/useDialog';
import CustomSelect from '../components/CustomSelect/CustomSelect';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [contentType, setContentType] = useState('words'); // 'words' | 'phrases' | 'sentences'
  const [manageItemsFor, setManageItemsFor] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [itemFilter, setItemFilter] = useState('all'); // 'all' | 'categorized' | 'uncategorized'
  const [loadingItems, setLoadingItems] = useState(false); // 内容加载状态
  const [filteredCategories, setFilteredCategories] = useState([]); // 筛选后的数据
  const [activeFilters, setActiveFilters] = useState({}); // 当前激活的筛选条件
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '' }); // 详情查看

  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { dialogState: inputDialogState, showConfirmInput, closeDialog: closeInputDialog } = useConfirmInputDialog();
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

  // 获取API和显示名称的映射
  const getContentTypeInfo = (type) => {
    const info = {
      words: { api: wordsAPI, name: '单词', namePlural: '单词', field: 'word' },
      phrases: { api: phrasesAPI, name: '短语', namePlural: '短语', field: 'phrase' },
      sentences: { api: sentencesAPI, name: '句子', namePlural: '句子', field: 'sentence' }
    };
    return info[type] || info.words;
  };

  const openManageItems = async (category, type = contentType) => {
    setManageItemsFor({ category, type });
    setAllItems([]);
    setSelectedItemIds([]);
    setItemSearch('');
    setItemFilter('all'); // 重置筛选
    setLoadingItems(true); // 开始加载
    try {
      const typeInfo = getContentTypeInfo(type);
      const res = await typeInfo.api.getAll();
      const items = res.data.data || [];
      setAllItems(items);
      // 预选中属于该分类ID的 - 使用 categoryIds 数组
      const categoryId = category.id || '';
      const itemsInCategory = items.filter(item => {
        const itemCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
        return itemCategoryIds.includes(categoryId);
      });
      setSelectedItemIds(itemsInCategory.map(item => item.id));
    } catch (e) {
      const typeInfo = getContentTypeInfo(type);
      showToast(`获取${typeInfo.namePlural}列表失败`, 'error');
    } finally {
      setLoadingItems(false); // 加载完成
    }
  };

  const getItemDisplayField = (item, type) => {
    const typeInfo = getContentTypeInfo(type);
    return item[typeInfo.field] || item.word || item.phrase || item.sentence || '';
  };

  const filteredItems = allItems.filter(item => {
    // 首先应用分类筛选（已归类/未归类）
    const itemCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
    const hasCategories = itemCategoryIds.length > 0;

    if (itemFilter === 'categorized' && !hasCategories) return false;
    if (itemFilter === 'uncategorized' && hasCategories) return false;

    // 然后应用搜索筛选
    if (!itemSearch.trim()) return true;
    const s = itemSearch.trim().toLowerCase();
    const displayField = getItemDisplayField(item, manageItemsFor?.type || contentType).toLowerCase();
    const categoryLower = (item.category || '').toLowerCase();
    // 同时搜索内容和分类名称
    const categoryNames = categories
      .filter(cat => itemCategoryIds.includes(cat.id))
      .map(cat => cat.name.toLowerCase());
    return displayField.includes(s) ||
      categoryLower.includes(s) ||
      categoryNames.some(name => name.includes(s));
  });

  const toggleItem = (id) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveManageItems = async () => {
    if (!manageItemsFor) return;
    const catId = manageItemsFor.category.id || '';
    const type = manageItemsFor.type || contentType;
    const typeInfo = getContentTypeInfo(type);
    
    // 计算需要设置/清空的内容
    const currentInCat = allItems.filter(item => {
      const itemCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
      return itemCategoryIds.includes(catId);
    }).map(item => item.id);

    const toAdd = selectedItemIds.filter(id => !currentInCat.includes(id));
    const toRemove = currentInCat.filter(id => !selectedItemIds.includes(id));

    try {
      // 添加分类
      for (const id of toAdd) {
        const item = allItems.find(item => item.id === id);
        if (item) {
          const currentCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
          const newCategoryIds = [...new Set([...currentCategoryIds, catId])];
          await typeInfo.api.update(id, { categoryIds: newCategoryIds });
        }
      }
      // 移除分类
      for (const id of toRemove) {
        const item = allItems.find(item => item.id === id);
        if (item) {
          const currentCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
          const newCategoryIds = currentCategoryIds.filter(cid => cid !== catId);
          await typeInfo.api.update(id, { categoryIds: newCategoryIds });
        }
      }
      showToast(`成功更新 ${toAdd.length + toRemove.length} 个${typeInfo.namePlural}的分类`, 'success');
      fetchAll(); // 刷新分类列表
      setManageItemsFor(null);
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

  const handleDeleteAll = async () => {
    if (categories.length === 0) {
      showToast('没有可删除的数据', 'warning');
      return;
    }

    showConfirmInput({
      title: '警告：删除全部数据',
      message: `您即将删除所有 ${categories.length} 个分类！\n\n此操作无法撤销，请谨慎操作。`,
      inputLabel: `请输入 "DELETE ALL" 以确认删除：`,
      expectedValue: 'DELETE ALL',
      type: 'danger',
      onConfirm: () => {
        showConfirm({
      title: '删除全部数据确认',
      message: `确定要删除所有 ${categories.length} 个分类吗？此操作无法撤销，请再次确认。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const allIds = categories.map(cat => cat.id);
          await categoriesAPI.bulkDelete(allIds);
          setSelectedIds([]);
          fetchAll();
          showToast(`成功删除所有 ${categories.length} 个分类`, 'success');
        } catch (error) {
          console.error('Error deleting all categories:', error);
          showToast('删除全部失败', 'error');
        }
      }
        });
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
        <h1>内容分类</h1>
        <p>管理单词、短语和句子的分类（例如：CET-4、CET-6、考研、托福等）</p>
        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          padding: '16px',
          background: 'var(--glass-bg)',
          borderRadius: '12px',
          border: '1px solid var(--line-divider)'
        }}>
          <label style={{ 
            fontSize: '14px', 
            color: 'var(--text-primary)', 
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}>
            内容类型：
          </label>
          <div style={{ width: '180px', flexShrink: 0 }}>
            <CustomSelect
              value={contentType}
              onChange={(value) => setContentType(value)}
              options={[
                { value: 'words', label: '单词' },
                { value: 'phrases', label: '短语' },
                { value: 'sentences', label: '句子' }
              ]}
              placeholder="选择类型"
              className="content-type-select"
            />
          </div>
        </div>
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

          {categories.length > 0 && (
            <div className="bulk-actions" style={{ marginLeft: 'auto' }}>
              <button 
                className="btn btn-danger btn-small" 
                onClick={handleDeleteAll}
                style={{ opacity: 0.8 }}
                title="删除所有数据（危险操作）"
              >
                删除全部 ({categories.length})
              </button>
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
                          <button className="btn btn-info btn-small" onClick={() => openManageItems(row, contentType)}>
                            管理{getContentTypeInfo(contentType).name}
                          </button>
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
      <ConfirmInputDialog
        isOpen={inputDialogState.isOpen}
        title={inputDialogState.title}
        message={inputDialogState.message}
        inputLabel={inputDialogState.inputLabel}
        expectedValue={inputDialogState.expectedValue}
        type={inputDialogState.type}
        onConfirm={inputDialogState.onConfirm}
        onCancel={closeInputDialog}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* 详情查看弹窗 */}
      <DetailViewModal
        show={detailView.show}
        title={detailView.title}
        content={detailView.content}
        onClose={() => setDetailView({ show: false, title: '', content: '' })}
      />

      {manageItemsFor && (() => {
        const typeInfo = getContentTypeInfo(manageItemsFor.type);
        return (
        <div className="modal-overlay" onClick={() => setManageItemsFor(null)}>
          <div className="modal manage-words-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
            <h2 >管理分类下的{typeInfo.namePlural} - {manageItemsFor.category.name}</h2>

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
                  共 {filteredItems.length} 个{typeInfo.namePlural}，已选中 {selectedItemIds.filter(id => filteredItems.some(item => item.id === id)).length} 个
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      const allFilteredIds = filteredItems.map(item => item.id);
                      setSelectedItemIds(prev => {
                        const newIds = [...new Set([...prev, ...allFilteredIds])];
                        return newIds;
                      });
                    }}
                    disabled={loadingItems}
                    style={{ fontSize: '12px', padding: '4px 12px', height: '28px' }}
                  >
                    全选当前
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      const allFilteredIds = filteredItems.map(item => item.id);
                      setSelectedItemIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                    }}
                    disabled={loadingItems}
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
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder={`输入${typeInfo.name}或分类名称...`}
                    disabled={loadingItems}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ width: '180px', marginBottom: 0 }}>
                  <select
                    value={itemFilter}
                    onChange={(e) => setItemFilter(e.target.value)}
                    disabled={loadingItems}
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
                {loadingItems ? (
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
                      <span style={{ fontSize: '14px' }}>正在加载{typeInfo.namePlural}列表...</span>
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    {itemSearch || itemFilter !== 'all' ? `未找到匹配的${typeInfo.namePlural}` : `暂无${typeInfo.namePlural}`}
                  </div>
                ) : (
                  filteredItems.map(item => {
                    const itemCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
                    const isInCategory = itemCategoryIds.includes(manageItemsFor.category.id);
                    const otherCategories = categories.filter(cat =>
                      cat.id !== manageItemsFor.category.id && itemCategoryIds.includes(cat.id)
                    );
                    const displayText = getItemDisplayField(item, manageItemsFor.type);

                    return (
                      <label
                        key={item.id}
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
                          background: selectedItemIds.includes(item.id)
                            ? 'rgba(16, 185, 129, 0.08)'
                            : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedItemIds.includes(item.id) && !loadingItems) {
                            e.currentTarget.style.background = 'var(--glass-bg-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedItemIds.includes(item.id) && !loadingItems) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                          disabled={loadingItems}
                          style={{ flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                              {displayText}
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
              {loadingItems && (
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
              <button type="button" className="btn btn-secondary" onClick={() => setManageItemsFor(null)}>取消</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveManageItems}
                disabled={selectedItemIds.length === 0 && filteredItems.filter(item => {
                  const itemCategoryIds = item.categoryIds || (item.categoryId ? [item.categoryId] : []);
                  return itemCategoryIds.includes(manageItemsFor.category.id);
                }).length === 0}
              >
                保存 ({selectedItemIds.filter(id => filteredItems.some(item => item.id === id)).length})
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

export default Categories;


