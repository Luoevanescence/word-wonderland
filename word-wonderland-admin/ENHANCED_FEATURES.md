# ✅ 增强功能说明文档

## 📦 新增功能

### 1. 📥📤 导入/导出下拉菜单

每个模块现在都有一个统一的下拉菜单界面，包含以下功能：

#### 导入功能
- **Excel 导入** - 批量导入 .xlsx 或 .xls 文件
- **JSON 导入** - 导入 JSON 格式数据  
- **下载模板** - 下载 Excel 导入模板

#### 导出功能
- **全部导出（Excel）** - 导出所有数据为 Excel 文件
- **全部导出（JSON）** - 导出所有数据为 JSON 文件
- **选中导出（Excel）** - 导出选中的数据为 Excel 文件
- **选中导出（JSON）** - 导出选中的数据为 JSON 文件

### 2. 🔍 条件筛选功能

每个模块都新增了筛选条，支持：
- 多字段模糊搜索
- 实时筛选
- 一键重置
- 筛选状态提示

## 📋 已完成模块

### ✅ 单词模块 (Words)
- [x] 导入/导出下拉菜单
- [x] Excel 导入
- [x] JSON 导入
- [x] Excel 导出（全部/选中）
- [x] JSON 导出（全部/选中）
- [x] 筛选功能（单词、词性、释义）

### 🔄 待更新模块

以下模块可以使用相同的方式更新：

#### 短语模块 (Phrases)
- 筛选字段：短语、含义、例句

#### 句子模块 (Sentences)  
- 筛选字段：英文句子、中文翻译、备注

#### 句型模块 (Patterns)
- 筛选字段：句型、描述、例句

#### 主题模块 (Topics)
- 筛选字段：主题名称、描述

#### 词性模块 (PartsOfSpeech)
- 筛选字段：词性代码、词性名称、描述

## 🎯 如何为其他模块添加功能

### 步骤 1: 导入必需的组件

```javascript
import ImportJSONModal from '../components/ImportJSONModal';
import ImportExportDropdown from '../components/ImportExportDropdown';
import FilterBar from '../components/FilterBar';
import { exportSelectedToExcel } from '../utils/excelUtils';
```

### 步骤 2: 添加状态

```javascript
const [showImportExcelModal, setShowImportExcelModal] = useState(false);
const [showImportJSONModal, setShowImportJSONModal] = useState(false);
const [filteredData, setFilteredData] = useState([]);
const [activeFilters, setActiveFilters] = useState({});
```

### 步骤 3: 更新分页数据源

```javascript
const displayData = Object.keys(activeFilters).length > 0 ? filteredData : allData;
const { currentData, renderPagination } = usePagination(displayData, 5);
```

### 步骤 4: 添加处理函数

```javascript
// JSON 导入
const handleImportJSON = async (jsonData) => {
  // 实现导入逻辑
};

// 选中导出 Excel
const handleExportSelectedExcel = () => {
  const headers = [/* 定义表头 */];
  exportSelectedToExcel(displayData, selectedIds, 'filename', headers);
};

// 筛选
const applyFilters = (filters) => {
  setActiveFilters(filters);
  const filtered = allData.filter(item => {
    // 实现筛选逻辑
  });
  setFilteredData(filtered);
};

const handleResetFilter = () => {
  setActiveFilters({});
  setFilteredData([]);
};
```

### 步骤 5: 更新 UI

替换原有的按钮为下拉菜单，并添加筛选条：

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

<FilterBar
  filterFields={[
    { key: 'field1', label: '字段1', type: 'text', placeholder: '输入...' },
    { key: 'field2', label: '字段2', type: 'text', placeholder: '输入...' }
  ]}
  onFilter={applyFilters}
  onReset={handleResetFilter}
/>
```

### 步骤 6: 添加导入弹窗

```jsx
<ImportJSONModal
  show={showImportJSONModal}
  onClose={() => setShowImportJSONModal(false)}
  onImport={handleImportJSON}
  title="JSON 导入XXX"
  moduleName="XXX"
/>
```

## 💡 提示

1. **筛选字段配置** - 根据模块特点选择合适的筛选字段
2. **导出表头** - 确保 Excel 导出的表头与数据结构匹配
3. **JSON 验证** - 在 JSON 导入时验证必需字段
4. **错误处理** - 提供友好的错误提示

## 🎨 UI 特点

- 玻璃态设计风格统一
- 下拉菜单带图标和说明
- 筛选条可展开/收起
- 选中数量实时显示
- 响应式布局，移动端友好

## 🔧 组件列表

| 组件 | 文件路径 | 用途 |
|------|---------|------|
| ImportExportDropdown | src/components/ImportExportDropdown.jsx | 导入/导出下拉菜单 |
| ImportJSONModal | src/components/ImportJSONModal.jsx | JSON 导入弹窗 |
| FilterBar | src/components/FilterBar.jsx | 筛选条组件 |
| excelUtils | src/utils/excelUtils.js | Excel 工具函数 |

## 📞 需要帮助？

参考 `src/pages/Words.jsx` 作为完整示例。

---

更新时间：2025-10-30

