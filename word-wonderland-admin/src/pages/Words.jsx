import React, { useState, useEffect } from 'react';
import { wordsAPI, partsOfSpeechAPI, categoriesAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { usePagination } from '../hooks/usePagination.jsx';
import CustomSelect from '../components/CustomSelect';
import MultiSelect from '../components/MultiSelect';
import CategoryTags from '../components/CategoryTags';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
import useGlobalModalClose from '../hooks/useGlobalModalClose';
import DetailViewModal from '../components/DetailViewModal';
import { initTableResize, cleanupTableResize } from '../utils/tableResizer';
import ImportExcelModal from '../components/ImportExcelModal';
import ImportJSONModal from '../components/ImportJSONModal';
import ImportExportDropdown from '../components/ImportExportDropdown';
import FilterBar from '../components/FilterBar';
import { exportToExcel, importFromExcel, downloadExcelTemplate, exportSelectedToExcel } from '../utils/excelUtils';

function Words() {
  const [words, setWords] = useState([]);
  const [partsOfSpeech, setPartsOfSpeech] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    categoryIds: [],
    definitions: [{ partOfSpeech: '', meaning: '' }]
  });
  const [selectedIds, setSelectedIds] = useState([]); // 批量删除：选中的ID列表
  const [submitting, setSubmitting] = useState(false); // 表单提交状态
  const [detailView, setDetailView] = useState({ show: false, title: '', content: '', categoryIds: [] }); // 详情查看
  const [showImportExcelModal, setShowImportExcelModal] = useState(false); // Excel 导入弹窗
  const [showImportJSONModal, setShowImportJSONModal] = useState(false); // JSON 导入弹窗
  const [filteredWords, setFilteredWords] = useState([]); // 筛选后的数据
  const [activeFilters, setActiveFilters] = useState({}); // 当前激活的筛选条件

  // 使用对话框和Toast hooks
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 使用分页 hook - 使用筛选后的数据或全部数据
  const displayData = Object.keys(activeFilters).length > 0 ? filteredWords : words;
  const { currentData, renderPagination } = usePagination(displayData, 5);

  useEffect(() => {
    fetchWords();
    fetchPartsOfSpeech();
  }, []);
  useEffect(() => { fetchCategories(); }, []);

  // 当单词数据变化时，重新应用筛选
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      applyFilters(activeFilters);
    }
  }, [words]);

  // 初始化表格列宽拖拽（只在首次有数据时初始化）
  useEffect(() => {
    if (words.length > 0) {
      // 延迟初始化，确保表格已渲染
      const timer = setTimeout(() => {
        initTableResize();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanupTableResize();
      };
    }
  }, [words.length > 0]); // 只在从无数据变为有数据时触发

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordsAPI.getAll();
      setWords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching words:', error);
      showToast('获取单词失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartsOfSpeech = async () => {
    try {
      const response = await partsOfSpeechAPI.getAll();
      setPartsOfSpeech(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parts of speech:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || []);
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // 防止重复提交

    setSubmitting(true);
    try {
      if (editingWord) {
        await wordsAPI.update(editingWord.id, formData);
      } else {
        await wordsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchWords();
      showToast(editingWord ? '更新成功' : '创建成功', 'success');
    } catch (error) {
      console.error('Error saving word:', error);
      showToast(error.response?.data?.message || '保存单词失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, event) => {
    // 防止触发其他事件（如长按菜单）
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    showConfirm({
      title: '确认删除',
      message: '确定要删除这个单词吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await wordsAPI.delete(id);
          await fetchWords();
          showToast('删除成功', 'success');
        } catch (error) {
          console.error('Error deleting word:', error);
          showToast(error.response?.data?.message || '删除单词失败', 'error');
        }
      }
    });
  };

  // JSON 导出功能
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(words, 'words');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(words, selectedIds, 'words');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个单词！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  // Excel 导出功能
  const handleExportExcel = () => {
    const headers = [
      { key: 'word', label: '单词' },
      { 
        key: 'categoryIds', 
        label: '分类',
        transform: (categoryIds, word) => {
          const wordCategoryIds = categoryIds 
            ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds])
            : (word.categoryId ? [word.categoryId] : []);
          if (wordCategoryIds.length === 0) return '未分类';
          const categoryNames = wordCategoryIds
            .map(id => categories.find(c => c.id === id)?.name)
            .filter(Boolean);
          return categoryNames.length > 0 ? categoryNames.join('、') : '未分类';
        }
      },
      { 
        key: 'definitions', 
        label: '词性和释义',
        transform: (defs) => defs.map(d => `${d.partOfSpeech}: ${d.meaning}`).join('; ')
      },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportToExcel(words, '单词数据', headers);
    if (success) {
      showToast('Excel 导出成功！', 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // Excel 导入功能
  const handleImportExcel = async (file) => {
    const fieldMapping = [
      { excelKey: '单词', dataKey: 'word', required: true },
      { excelKey: '分类', dataKey: 'categoryName', required: false },
      {
        excelKey: '词性',
        dataKey: 'partOfSpeech',
        required: true,
        transform: (value) => {
          if (!value || value.trim() === '') {
            throw new Error('词性不能为空');
          }
          // 验证词性是否存在
          const posExists = partsOfSpeech.some(pos => pos.code === value.trim());
          if (!posExists) {
            throw new Error(`词性 "${value}" 不存在，请先在词性管理中添加`);
          }
          return value.trim();
        }
      },
      { excelKey: '释义', dataKey: 'meaning', required: true }
    ];

    try {
      const importedData = await importFromExcel(file, fieldMapping);
      
      // 转换为 API 需要的格式（分类名称 -> categoryIds）
      const nameToId = new Map(categories.map(c => [c.name, c.id]));
      const wordsToCreate = importedData.map(item => ({
        word: item.word,
        categoryIds: item.categoryName ? (nameToId.get(item.categoryName) ? [nameToId.get(item.categoryName)] : []) : [],
        definitions: [{ partOfSpeech: item.partOfSpeech, meaning: item.meaning }]
      }));

      // 批量创建单词
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const wordData of wordsToCreate) {
        try {
          await wordsAPI.create(wordData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${wordData.word}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      // 刷新列表
      await fetchWords();
      setShowImportModal(false);

      // 显示结果
      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个单词！`, 'success');
      } else {
        showToast(
          `导入完成：成功 ${successCount} 个，失败 ${failCount} 个\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`,
          'warning'
        );
      }
    } catch (error) {
      throw new Error(error.message || 'Excel 文件解析失败');
    }
  };

  // 下载 Excel 模板
  const handleDownloadTemplate = () => {
    const headers = [
      { key: 'word', label: '单词', example: 'abandon' },
      { key: 'categoryName', label: '分类', example: 'CET-6' },
      { key: 'partOfSpeech', label: '词性', example: 'v.' },
      { key: 'meaning', label: '释义', example: '放弃；抛弃' }
    ];

    const sampleData = [
      { '单词': 'abandon', '分类': 'CET-6', '词性': 'v.', '释义': '放弃；抛弃' },
      { '单词': 'ability', '分类': 'CET-4', '词性': 'n.', '释义': '能力；才能' },
      { '单词': 'abroad', '分类': '其他', '词性': 'adv.', '释义': '在国外；到海外' }
    ];

    const success = downloadExcelTemplate('单词导入', headers, sampleData);
    if (success) {
      showToast('模板下载成功！', 'success');
    } else {
      showToast('模板下载失败', 'error');
    }
  };

  // JSON 导入功能
  const handleImportJSON = async (jsonData) => {
    try {
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON 数据应该是一个数组');
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const wordData of jsonData) {
        // 验证必需字段
        if (!wordData.word || !wordData.definitions || !Array.isArray(wordData.definitions)) {
          failCount++;
          errors.push(`无效数据项（缺少必需字段）`);
          continue;
        }

        try {
          await wordsAPI.create(wordData);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`"${wordData.word}" 导入失败：${error.response?.data?.message || error.message}`);
        }
      }

      await fetchWords();
      setShowImportJSONModal(false);

      if (failCount === 0) {
        showToast(`成功导入 ${successCount} 个单词！`, 'success');
      } else {
        showToast(
          `导入完成：成功 ${successCount} 个，失败 ${failCount} 个\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`,
          'warning'
        );
      }
    } catch (error) {
      throw new Error(error.message || 'JSON 导入失败');
    }
  };

  // 选中导出 Excel
  const handleExportSelectedExcel = () => {
    const headers = [
      { key: 'word', label: '单词' },
      { 
        key: 'categoryIds', 
        label: '分类',
        transform: (categoryIds, word) => {
          const wordCategoryIds = categoryIds 
            ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds])
            : (word.categoryId ? [word.categoryId] : []);
          if (wordCategoryIds.length === 0) return '未分类';
          const categoryNames = wordCategoryIds
            .map(id => categories.find(c => c.id === id)?.name)
            .filter(Boolean);
          return categoryNames.length > 0 ? categoryNames.join('、') : '未分类';
        }
      },
      { 
        key: 'definitions', 
        label: '词性和释义',
        transform: (defs) => defs.map(d => `${d.partOfSpeech}: ${d.meaning}`).join('; ')
      },
      { 
        key: 'createdAt', 
        label: '创建时间',
        transform: (date) => new Date(date).toLocaleString('zh-CN')
      }
    ];

    const success = exportSelectedToExcel(displayData, selectedIds, '单词数据', headers);
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个单词！`, 'success');
    } else {
      showToast('Excel 导出失败', 'error');
    }
  };

  // 筛选功能
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    
    const filtered = words.filter(word => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        const searchValue = value.toLowerCase();
        
        if (key === 'word') {
          return word.word.toLowerCase().includes(searchValue);
        }
        
        if (key === 'partOfSpeech') {
          return word.definitions.some(def => 
            def.partOfSpeech.toLowerCase().includes(searchValue)
          );
        }
        
        if (key === 'meaning') {
          return word.definitions.some(def => 
            def.meaning.toLowerCase().includes(searchValue)
          );
        }
        if (key === 'category') {
          const wordCategoryIds = word.categoryIds 
            ? (Array.isArray(word.categoryIds) ? word.categoryIds : [word.categoryIds])
            : (word.categoryId ? [word.categoryId] : []);
          const categoryNames = wordCategoryIds
            .map(id => categories.find(c => c.id === id)?.name)
            .filter(Boolean);
          return categoryNames.some(name => name.toLowerCase().includes(searchValue));
        }
        
        return true;
      });
    });
    
    setFilteredWords(filtered);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setFilteredWords([]);
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
      title: '批量删除确认',
      message: `确定要删除选中的 ${selectedIds.length} 个单词吗？此操作无法撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await wordsAPI.bulkDelete(selectedIds);
          await fetchWords();
          setSelectedIds([]);
          showToast(response.data.message || '批量删除成功', 'success');
        } catch (error) {
          console.error('Error bulk deleting words:', error);
          showToast(error.response?.data?.message || '批量删除失败', 'error');
        }
      }
    });
  };

  const handleEdit = (word) => {
    setEditingWord(word);
    // 处理分类：如果 word 有 categoryIds（数组），使用它；否则如果有 categoryId（单个），转换为数组
    const categoryIds = word.categoryIds 
      ? (Array.isArray(word.categoryIds) ? word.categoryIds : [word.categoryIds])
      : (word.categoryId ? [word.categoryId] : []);
    setFormData({
      word: word.word,
      categoryIds: categoryIds,
      definitions: word.definitions
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      word: '',
      categoryIds: [],
      definitions: [{ partOfSpeech: '', meaning: '' }]
    });
    setEditingWord(null);
  };

  // 使用全局弹窗关闭Hook
  useGlobalModalClose(showModal, setShowModal, resetForm);

  const addDefinition = () => {
    setFormData({
      ...formData,
      definitions: [...formData.definitions, { partOfSpeech: '', meaning: '' }]
    });
  };

  const removeDefinition = (index) => {
    const newDefinitions = formData.definitions.filter((_, i) => i !== index);
    setFormData({ ...formData, definitions: newDefinitions });
  };

  const updateDefinition = (index, field, value) => {
    const newDefinitions = [...formData.definitions];
    newDefinitions[index][field] = value;
    setFormData({ ...formData, definitions: newDefinitions });
  };

  const openAddModal = () => {
    if (partsOfSpeech.length === 0) {
      showConfirm({
        title: '缺少词性',
        message: '还没有可用的词性！需要先创建词性才能添加单词。\n\n是否现在前往词性管理页面？',
        type: 'alert',
        onConfirm: () => {
          window.location.href = '/parts-of-speech';
        }
      });
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>单词管理</h1>
        <p>管理您的词汇单词，支持多个词性定义</p>
      </div>

      <div className="page-content">
        <div className="actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            + 添加新单词
          </button>

          <ImportExportDropdown
            type="import"
            handlers={{
              onExcelImport: () => setShowImportExcelModal(true),
              onJSONImport: () => setShowImportJSONModal(true),
              onDownloadTemplate: handleDownloadTemplate
            }}
            disabled={loading}
          />

          <ImportExportDropdown
            type="export"
            handlers={{
              onExportAllExcel: handleExportExcel,
              onExportAllJSON: handleExportAll,
              onExportSelectedExcel: handleExportSelectedExcel,
              onExportSelectedJSON: handleExportSelected
            }}
            disabled={loading || displayData.length === 0}
            selectedCount={selectedIds.length}
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

        {/* 筛选条 */}
        <FilterBar
          filterFields={[
            { key: 'word', label: '单词', type: 'text', placeholder: '输入单词...' },
            { key: 'partOfSpeech', label: '词性', type: 'text', placeholder: '输入词性...' },
            { key: 'meaning', label: '释义', type: 'text', placeholder: '输入释义...' },
            { key: 'category', label: '分类', type: 'text', placeholder: '输入分类...' }
          ]}
          onFilter={applyFilters}
          onReset={handleResetFilter}
        />

        {partsOfSpeech.length === 0 && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            <strong>⚠️ 提示：</strong> 您还没有创建任何词性。
            <Link to="/parts-of-speech" style={{ color: 'var(--brand-primary)', marginLeft: '10px', textDecoration: 'underline' }}>
              点击前往词性管理页面
            </Link>
          </div>
        )}

        {loading ? (
          <div className="loading">加载中...</div>
        ) : words.length === 0 ? (
          <div className="empty-state">
            <h3>还没有单词</h3>
            <p>开始添加您的第一个单词吧！</p>
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
                    <th>单词</th>
                    <th>分类</th>
                    <th>释义</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((word) => (
                    <tr key={word.id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(word.id)}
                          onChange={() => handleSelectOne(word.id)}
                        />
                      </td>
                      <td><strong>{word.word}</strong></td>
                      <td style={{ maxWidth: '200px' }}>
                        <CategoryTags
                          categoryIds={word.categoryIds || (word.categoryId ? [word.categoryId] : [])}
                          categories={categories}
                          showAll={false}
                        />
                      </td>
                      <td className="text-cell">
                        <span style={{ fontWeight: 500, color: 'var(--brand-primary)' }}>
                          {word.definitions[0]?.partOfSpeech}
                        </span>{' '}
                        {word.definitions[0]?.meaning}
                      </td>
                      <td>{new Date(word.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-view-detail"
                            onClick={() => {
                              const wordCategoryIds = word.categoryIds 
                                ? (Array.isArray(word.categoryIds) ? word.categoryIds : [word.categoryIds])
                                : (word.categoryId ? [word.categoryId] : []);
                              setDetailView({
                                show: true,
                                title: `单词释义：${word.word}`,
                                content: word.definitions.map((def, idx) =>
                                  `${def.partOfSpeech} ${def.meaning}`
                                ).join('\n\n'),
                                categoryIds: wordCategoryIds
                              });
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            详情
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => handleEdit(word)}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            编辑
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={(e) => handleDelete(word.id, e)}
                            onContextMenu={(e) => e.preventDefault()}
                          >
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
              {currentData.map((word) => (
                <div key={word.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(word.id)}
                      onChange={() => handleSelectOne(word.id)}
                      style={{ marginRight: '10px' }}
                    />
                    <div className="mobile-card-title">{word.word}</div>
                  </div>
                  <div className="mobile-card-content">
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">分类</div>
                      <div className="mobile-card-value">
                        <CategoryTags
                          categoryIds={word.categoryIds || (word.categoryId ? [word.categoryId] : [])}
                          categories={categories}
                          showAll={false}
                        />
                      </div>
                    </div>
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">释义</div>
                      <div className="mobile-card-value">
                        {word.definitions.map((def, idx) => (
                          <div key={idx}>
                            <span style={{ fontWeight: 500, color: 'var(--brand-primary)' }}>
                              {def.partOfSpeech}
                            </span>{' '}
                            {def.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mobile-card-row">
                      <div className="mobile-card-label">创建时间</div>
                      <div className="mobile-card-value">
                        {new Date(word.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(word)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={(e) => handleDelete(word.id, e)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
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
            <h2>{editingWord ? '编辑单词' : '添加新单词'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>单词 *</label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  required
                  placeholder="例如：run"
                />
              </div>

              <div className="form-group">
                <label>分类</label>
                <MultiSelect
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={formData.categoryIds}
                  onChange={(ids) => setFormData({ ...formData, categoryIds: ids })}
                  placeholder="搜索分类…"
                  disabled={categories.length === 0}
                />
                {categories.length === 0 && (
                  <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>暂无分类，请先在"分类"模块创建后再选择</small>
                )}
              </div>

              <div className="form-group">
                <label>释义 *</label>
                {formData.definitions.map((def, index) => (
                  <div key={index} className="definition-item">
                    {formData.definitions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-small remove-definition-btn"
                        onClick={() => removeDefinition(index)}
                        title="移除此释义"
                      >
                        ✕
                      </button>
                    )}
                    <div className="form-group form-group-z-index-selector">
                      <label>词性 *</label>
                      <CustomSelect
                        value={def.partOfSpeech}
                        onChange={(value) => updateDefinition(index, 'partOfSpeech', value)}
                        options={partsOfSpeech.map((pos) => ({
                          value: pos.code,
                          label: `${pos.code} - ${pos.name}`
                        }))}
                        placeholder="请选择词性"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>中文释义 *</label>
                      <input
                        type="text"
                        value={def.meaning}
                        onChange={(e) => updateDefinition(index, 'meaning', e.target.value)}
                        required
                        placeholder="跑步；运行"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="add-definition-btn" onClick={addDefinition}>
                  + 添加另一个释义
                </button>
              </div>



              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '处理中...' : (editingWord ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 自定义确认对话框 */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />

      {/* 详情查看弹窗 */}
      <DetailViewModal
        show={detailView.show}
        title={detailView.title}
        content={detailView.content}
        categoryIds={detailView.categoryIds}
        categories={categories}
        onClose={() => setDetailView({ show: false, title: '', content: '', categoryIds: [] })}
      />

      {/* Toast通知 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Excel 导入弹窗 */}
      <ImportExcelModal
        show={showImportExcelModal}
        onClose={() => setShowImportExcelModal(false)}
        onImport={handleImportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        title="批量导入单词"
        moduleName="单词"
      />

      {/* JSON 导入弹窗 */}
      <ImportJSONModal
        show={showImportJSONModal}
        onClose={() => setShowImportJSONModal(false)}
        onImport={handleImportJSON}
        title="JSON 导入单词"
        moduleName="单词"
      />
    </div>
  );
}

export default Words;
