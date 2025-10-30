# 🚀 快速更新其他模块指南

本指南帮助你快速为其他模块添加导入/导出和筛选功能。

## 📦 已准备好的资源

✅ 所有组件已创建  
✅ 所有工具函数已完成  
✅ 单词模块已作为完整示例  
✅ 样式已添加

你只需要复制粘贴并稍作修改！

## 🎯 5步快速更新法

以**短语模块 (Phrases.jsx)** 为例：

### Step 1: 添加 import (文件顶部)

在现有 import 后添加：

```javascript
import ImportJSONModal from '../components/ImportJSONModal';
import ImportExportDropdown from '../components/ImportExportDropdown';
import FilterBar from '../components/FilterBar';
import { exportSelectedToExcel } from '../utils/excelUtils';
```

### Step 2: 添加 state (函数组件内部)

将这行：
```javascript
const [showImportModal, setShowImportModal] = useState(false);
```

替换为：
```javascript
const [showImportExcelModal, setShowImportExcelModal] = useState(false);
const [showImportJSONModal, setShowImportJSONModal] = useState(false);
const [filteredPhrases, setFilteredPhrases] = useState([]);
const [activeFilters, setActiveFilters] = useState({});
```

### Step 3: 更新分页数据源

将这行：
```javascript
const { currentData, renderPagination } = usePagination(phrases, 5);
```

替换为：
```javascript
const displayData = Object.keys(activeFilters).length > 0 ? filteredPhrases : phrases;
const { currentData, renderPagination } = usePagination(displayData, 5);
```

并添加筛选监听：
```javascript
useEffect(() => {
  if (Object.keys(activeFilters).length > 0) {
    applyFilters(activeFilters);
  }
}, [phrases]);
```

### Step 4: 添加处理函数

在现有的 `handleExportAll` 之后添加：

```javascript
// JSON 导入
const handleImportJSON = async (jsonData) => {
  try {
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON 数据应该是一个数组');
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const phraseData of jsonData) {
      if (!phraseData.phrase || !phraseData.meaning) {
        failCount++;
        errors.push(`无效数据项（缺少必需字段）`);
        continue;
      }

      try {
        await phrasesAPI.create(phraseData);
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`"${phraseData.phrase}" 导入失败：${error.response?.data?.message || error.message}`);
      }
    }

    await fetchPhrases();
    setShowImportJSONModal(false);

    if (failCount === 0) {
      showToast(`成功导入 ${successCount} 个短语！`, 'success');
    } else {
      showToast(`导入完成：成功 ${successCount} 个，失败 ${failCount} 个`, 'warning');
    }
  } catch (error) {
    throw new Error(error.message || 'JSON 导入失败');
  }
};

// 选中导出 Excel
const handleExportSelectedExcel = () => {
  const headers = [
    { key: 'phrase', label: '短语' },
    { key: 'meaning', label: '含义' },
    { key: 'example', label: '例句' },
    { key: 'createdAt', label: '创建时间', transform: (date) => new Date(date).toLocaleString('zh-CN') }
  ];

  const success = exportSelectedToExcel(displayData, selectedIds, '短语数据', headers);
  if (success) {
    showToast(`成功导出 ${selectedIds.length} 个短语！`, 'success');
  } else {
    showToast('Excel 导出失败', 'error');
  }
};

// 筛选功能
const applyFilters = (filters) => {
  setActiveFilters(filters);
  
  const filtered = phrases.filter(phrase => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const searchValue = value.toLowerCase();
      return phrase[key]?.toLowerCase().includes(searchValue);
    });
  });
  
  setFilteredPhrases(filtered);
};

const handleResetFilter = () => {
  setActiveFilters({});
  setFilteredPhrases([]);
};
```

### Step 5: 更新 UI

#### 5.1 替换按钮组

将这段：
```jsx
<button className="btn btn-success" onClick={() => setShowImportModal(true)}>
  📥 Excel 导入
</button>

<button className="btn btn-info" onClick={handleExportExcel}>
  📤 Excel 导出
</button>

<ExportButton ... />
```

替换为：
```jsx
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
```

#### 5.2 添加筛选条

在 `</div>` (actions 的结束标签) 后添加：

```jsx
{/* 筛选条 */}
<FilterBar
  filterFields={[
    { key: 'phrase', label: '短语', type: 'text', placeholder: '输入短语...' },
    { key: 'meaning', label: '含义', type: 'text', placeholder: '输入含义...' },
    { key: 'example', label: '例句', type: 'text', placeholder: '输入例句...' }
  ]}
  onFilter={applyFilters}
  onReset={handleResetFilter}
/>
```

#### 5.3 更新导入弹窗

将这段：
```jsx
<ImportExcelModal
  show={showImportModal}
  onClose={() => setShowImportModal(false)}
  ...
/>
```

替换为：
```jsx
<ImportExcelModal
  show={showImportExcelModal}
  onClose={() => setShowImportExcelModal(false)}
  onImport={handleImportExcel}
  onDownloadTemplate={handleDownloadTemplate}
  title="批量导入短语"
  moduleName="短语"
/>

<ImportJSONModal
  show={showImportJSONModal}
  onClose={() => setShowImportJSONModal(false)}
  onImport={handleImportJSON}
  title="JSON 导入短语"
  moduleName="短语"
/>
```

## ✅ 完成！

保存文件，刷新浏览器，你的模块现在就有了完整的导入/导出和筛选功能！

## 📋 各模块筛选字段配置

### 句子模块 (Sentences)
```javascript
filterFields={[
  { key: 'sentence', label: '英文句子', type: 'text' },
  { key: 'translation', label: '中文翻译', type: 'text' },
  { key: 'note', label: '备注', type: 'text' }
]}
```

### 句型模块 (Patterns)
```javascript
filterFields={[
  { key: 'pattern', label: '句型', type: 'text' },
  { key: 'description', label: '描述', type: 'text' },
  { key: 'example', label: '例句', type: 'text' }
]}
```

### 主题模块 (Topics)
```javascript
filterFields={[
  { key: 'name', label: '主题名称', type: 'text' },
  { key: 'description', label: '描述', type: 'text' }
]}
```

### 词性模块 (PartsOfSpeech)
```javascript
filterFields={[
  { key: 'code', label: '词性代码', type: 'text' },
  { key: 'name', label: '词性名称', type: 'text' },
  { key: 'description', label: '描述', type: 'text' }
]}
```

## 🔍 注意事项

1. **JSON 导入验证** - 根据模块调整必需字段检查
2. **Excel 表头** - 确保 headers 配置与数据结构匹配
3. **筛选字段** - 嵌套字段需要特殊处理（参考 Words.jsx 中的 definitions 处理）
4. **API 调用** - 确保使用正确的 API (phrasesAPI, sentencesAPI 等)
5. **数据名称** - 变量名要统一（phrases、sentences 等）

## 💡 快速技巧

- **复制粘贴法**: 从 Words.jsx 复制，然后批量替换关键词
  - `words` → `phrases`
  - `Words` → `Phrases`
  - `单词` → `短语`
  - `wordsAPI` → `phrasesAPI`

- **使用编辑器的查找替换功能**: Ctrl+H (Windows) / Cmd+H (Mac)

## 🎯 预计时间

- 第一个模块：~20 分钟
- 后续模块：~10 分钟/个
- 全部完成：~1 小时

## 🆘 遇到问题？

1. 检查 import 语句是否完整
2. 确认所有状态已添加
3. 查看浏览器控制台错误信息
4. 对比 Words.jsx 源码
5. 检查 API 函数名称是否正确

## 🎉 完成检查清单

- [ ] Import 语句已添加
- [ ] State 已更新
- [ ] 分页数据源已修改
- [ ] 处理函数已添加
- [ ] UI 按钮已替换
- [ ] 筛选条已添加
- [ ] 弹窗已更新
- [ ] 测试导入功能
- [ ] 测试导出功能
- [ ] 测试筛选功能

---

加油！你可以的！🚀

