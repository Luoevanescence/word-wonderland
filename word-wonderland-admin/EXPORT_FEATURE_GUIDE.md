# 导出功能使用指南 📥

管理员后台已添加 JSON 数据导出功能，可以导出所有数据或选中的数据。

---

## ✨ 功能特性

- ✅ **导出所有数据**: 一键导出当前页面的所有数据
- ✅ **导出选中数据**: 可以选择特定项目进行导出
- ✅ **包含元数据**: 导出文件包含时间戳、数据类型、总数等信息
- ✅ **格式化 JSON**: 导出的 JSON 文件格式化，易于阅读
- ✅ **自动命名**: 文件名包含数据类型和时间戳

---

## 📦 导出的文件格式

### 导出所有数据

```json
{
  "exportTime": "2024-10-25T12:30:00.000Z",
  "dataType": "words",
  "total": 100,
  "data": [
    {
      "id": "123",
      "word": "example",
      "definitions": [...]
    },
    ...
  ]
}
```

### 导出选中数据

```json
[
  {
    "id": "123",
    "word": "example",
    "definitions": [...]
  },
  ...
]
```

---

## 🎯 使用方法

### 在单词管理页面

1. **导出所有单词**
   - 点击 "导出单词" 按钮
   - 文件会自动下载，文件名如：`words_2024-10-25T12-30-00.json`

2. **导出选中单词**
   - 勾选要导出的单词
   - 点击 "导出选中 (N)" 按钮
   - 只导出选中的单词

### 适用页面

- ✅ 单词管理（已完成）
- 📝 短语管理（需添加）
- 📝 句子管理（需添加）
- 📝 句型管理（需添加）
- 📝 主题管理（需添加）
- 📝 词性管理（需添加）

---

## 🛠️ 为其他页面添加导出功能

### 步骤 1: 导入组件和工具

在页面文件顶部添加：

```javascript
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';
```

### 步骤 2: 添加导出函数

在组件内添加（根据数据类型修改）：

```javascript
// 导出所有数据
const handleExportAll = () => {
  const success = downloadJSONWithMeta(phrases, 'phrases'); // 改成对应的数据
  if (success) {
    showToast('导出成功！', 'success');
  } else {
    showToast('导出失败，请重试', 'error');
  }
};

// 导出选中数据
const handleExportSelected = () => {
  const success = downloadSelectedJSON(phrases, selectedIds, 'phrases'); // 改成对应的数据
  if (success) {
    showToast(`成功导出 ${selectedIds.length} 项！`, 'success');
  } else {
    showToast('导出失败，请重试', 'error');
  }
};
```

### 步骤 3: 添加导出按钮

在操作按钮区域添加：

```jsx
<ExportButton
  onExport={handleExportAll}
  onExportSelected={handleExportSelected}
  selectedCount={selectedIds.length}
  disabled={loading || data.length === 0}
  label="导出短语" {/* 改成对应的名称 */}
/>
```

---

## 📋 完整示例

以下是为 Phrases 页面添加导出功能的完整示例：

```javascript
// 1. 导入
import ExportButton from '../components/ExportButton';
import { downloadJSONWithMeta, downloadSelectedJSON } from '../utils/exportUtils';

function Phrases() {
  const [phrases, setPhrases] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // 2. 添加导出函数
  const handleExportAll = () => {
    const success = downloadJSONWithMeta(phrases, 'phrases');
    if (success) {
      showToast('导出成功！', 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  const handleExportSelected = () => {
    const success = downloadSelectedJSON(phrases, selectedIds, 'phrases');
    if (success) {
      showToast(`成功导出 ${selectedIds.length} 个短语！`, 'success');
    } else {
      showToast('导出失败，请重试', 'error');
    }
  };

  return (
    <div>
      {/* 3. 添加按钮 */}
      <div className="actions">
        <button className="btn btn-primary" onClick={openAddModal}>
          + 添加新短语
        </button>
        
        <ExportButton
          onExport={handleExportAll}
          onExportSelected={handleExportSelected}
          selectedCount={selectedIds.length}
          disabled={loading || phrases.length === 0}
          label="导出短语"
        />
      </div>
      
      {/* 其他内容... */}
    </div>
  );
}
```

---

## 🎨 自定义导出

### 只导出特定字段

```javascript
const handleExportCustom = () => {
  // 只导出需要的字段
  const simplifiedData = words.map(word => ({
    word: word.word,
    meanings: word.definitions.map(d => d.meaning)
  }));
  
  downloadJSON(simplifiedData, 'words_simplified');
};
```

### 导出为 CSV

如果需要导出为 CSV 格式，可以扩展工具函数：

```javascript
// 在 exportUtils.js 中添加
export const downloadCSV = (data, filename) => {
  // 将 JSON 转换为 CSV
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  // ... 下载逻辑
};
```

---

## 🔧 工具函数说明

### downloadJSON(data, filename)

基本的 JSON 下载函数。

**参数**:
- `data`: 要导出的数据（任何可序列化的对象）
- `filename`: 文件名（不含扩展名）

**返回**: `boolean` - 成功返回 true

### downloadJSONWithMeta(data, dataType)

带元数据的导出，包含时间戳、数据类型、总数等。

**参数**:
- `data`: 要导出的数据
- `dataType`: 数据类型字符串（如 'words', 'phrases'）

**元数据包含**:
```javascript
{
  exportTime: "2024-10-25T12:30:00.000Z",  // ISO 格式时间
  dataType: "words",                        // 数据类型
  total: 100,                               // 数据总数
  data: [...]                               // 实际数据
}
```

### downloadSelectedJSON(allData, selectedIds, filename)

导出选中的数据。

**参数**:
- `allData`: 所有数据数组
- `selectedIds`: 选中的 ID 数组
- `filename`: 文件名前缀

---

## 📂 文件命名规则

导出的文件名格式：`{type}_{timestamp}.json`

示例：
- `words_2024-10-25T12-30-00.json` - 所有单词
- `phrases_selected_2024-10-25T12-30-00.json` - 选中的短语
- `sentences_2024-10-25T12-30-00.json` - 所有句子

时间戳格式：`YYYY-MM-DDTHH-MM-SS`

---

## 🎯 使用场景

### 1. 数据备份

定期导出数据作为备份：

```javascript
// 每天导出一次
const handleDailyBackup = () => {
  downloadJSONWithMeta(words, 'words_backup');
  downloadJSONWithMeta(phrases, 'phrases_backup');
  downloadJSONWithMeta(sentences, 'sentences_backup');
};
```

### 2. 数据迁移

从一个系统迁移到另一个系统：

```javascript
// 导出所有数据
const handleExportAll = () => {
  const allData = {
    words: words,
    phrases: phrases,
    sentences: sentences,
    patterns: patterns,
    topics: topics,
    partsOfSpeech: partsOfSpeech
  };
  
  downloadJSON(allData, 'all_data');
};
```

### 3. 数据分析

导出数据用于分析：

```javascript
// 导出单词统计
const handleExportStats = () => {
  const stats = {
    totalWords: words.length,
    byPartOfSpeech: {},
    averageDefinitions: words.reduce((sum, w) => sum + w.definitions.length, 0) / words.length
  };
  
  downloadJSON(stats, 'words_statistics');
};
```

### 4. 分享数据

导出选中的数据分享给其他人：

```javascript
// 导出精选单词
handleExportSelected(); // 用户选择要分享的单词
```

---

## ⚠️ 注意事项

1. **数据大小**: 导出大量数据时可能需要较长时间
2. **浏览器兼容性**: 现代浏览器都支持，IE 可能不支持
3. **文件编码**: 导出的 JSON 文件使用 UTF-8 编码
4. **数据隐私**: 注意不要导出敏感信息

---

## 🐛 故障排查

### 问题1: 导出按钮点击无反应

**检查**:
- 是否有数据（data.length > 0）
- 浏览器控制台是否有错误
- 是否正确导入了工具函数

### 问题2: 下载的文件打开是空的

**原因**: 数据可能为空或格式错误

**解决**:
```javascript
console.log('导出的数据:', words); // 检查数据
```

### 问题3: 文件名包含非法字符

**原因**: 时间戳中的冒号在某些系统不支持

**解决**: 工具函数已自动处理，将冒号替换为短横线

---

## 📚 相关文件

- `src/utils/exportUtils.js` - 导出工具函数
- `src/components/ExportButton.jsx` - 导出按钮组件
- `src/components/ExportButton.css` - 按钮样式
- `src/pages/Words.jsx` - 单词页面（示例实现）

---

## ✅ 待办清单

为其他页面添加导出功能：

- [x] 单词管理 (Words.jsx)
- [ ] 短语管理 (Phrases.jsx)
- [ ] 句子管理 (Sentences.jsx)
- [ ] 句型管理 (Patterns.jsx)
- [ ] 主题管理 (Topics.jsx)
- [ ] 词性管理 (PartsOfSpeech.jsx)

---

## 🎉 完成！

导出功能已就绪，可以开始使用了！

需要帮助或有问题？查看代码或提交 Issue。

