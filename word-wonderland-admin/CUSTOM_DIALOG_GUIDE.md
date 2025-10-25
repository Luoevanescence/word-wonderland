# 自定义对话框和Toast通知使用指南

## 📋 概述

已创建自定义对话框（ConfirmDialog）和Toast通知组件，替代浏览器原生的 `alert()` 和 `confirm()`。

## 🎨 组件说明

### 1. ConfirmDialog - 确认对话框
- 位置：`src/components/ConfirmDialog.jsx`
- 样式：`src/components/ConfirmDialog.css`
- 功能：替代 `window.confirm()` 和 `window.alert()`

### 2. Toast - 消息通知
- 位置：`src/components/Toast.jsx`
- 样式：`src/components/Toast.css`
- 功能：替代 `alert()` 用于成功/错误提示

### 3. useDialog Hook
- 位置：`src/hooks/useDialog.jsx`
- 功能：提供便捷的对话框和Toast管理

## 📝 使用方法

### 步骤1：导入必要的组件和Hook

```jsx
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';
```

### 步骤2：在组件中初始化Hook

```jsx
function YourComponent() {
  // 对话框Hook
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  
  // Toast Hook
  const { toasts, showToast, removeToast } = useToast();
  
  // ... 其他代码
}
```

### 步骤3：使用确认对话框

**替换 `window.confirm()`:**

```jsx
// ❌ 旧的方式
const handleDelete = async (id) => {
  if (!window.confirm('确定要删除吗？')) return;
  // ... 删除逻辑
};

// ✅ 新的方式
const handleDelete = async (id) => {
  showConfirm({
    title: '确认删除',
    message: '确定要删除这个项目吗？此操作无法撤销。',
    type: 'danger',
    onConfirm: async () => {
      // ... 删除逻辑
    }
  });
};
```

**对话框类型 (type):**
- `'confirm'` - 默认确认对话框（蓝色）
- `'danger'` - 危险操作对话框（红色）
- `'alert'` - 提示对话框（蓝色）
- `'success'` - 成功对话框（绿色）
- `'error'` - 错误对话框（红色）

### 步骤4：使用Toast通知

**替换 `alert()`:**

```jsx
// ❌ 旧的方式
try {
  await api.save(data);
  alert('保存成功');
} catch (error) {
  alert('保存失败');
}

// ✅ 新的方式
try {
  await api.save(data);
  showToast('保存成功', 'success');
} catch (error) {
  showToast('保存失败', 'error');
}
```

**Toast类型:**
- `'success'` - 成功消息（绿色）
- `'error'` - 错误消息（红色）
- `'warning'` - 警告消息（橙色）
- `'info'` - 信息消息（蓝色）

**Toast持续时间:**
```jsx
showToast('消息内容', 'success', 5000); // 5秒后自动关闭
```

### 步骤5：在JSX中添加组件

在组件的 `return` 语句末尾添加：

```jsx
return (
  <div className="page-wrapper">
    {/* 你的页面内容 */}
    
    {/* 自定义确认对话框 */}
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      title={dialogState.title}
      message={dialogState.message}
      type={dialogState.type}
      onConfirm={dialogState.onConfirm}
      onCancel={closeDialog}
    />

    {/* Toast通知 */}
    <ToastContainer toasts={toasts} removeToast={removeToast} />
  </div>
);
```

## 🎯 完整示例

```jsx
import React, { useState, useEffect } from 'react';
import { yourAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useConfirmDialog, useToast } from '../hooks/useDialog';

function YourPage() {
  const [data, setData] = useState([]);
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog();
  const { toasts, showToast, removeToast } = useToast();

  // 获取数据
  const fetchData = async () => {
    try {
      const response = await yourAPI.getAll();
      setData(response.data.data);
    } catch (error) {
      showToast('获取数据失败', 'error');
    }
  };

  // 删除操作
  const handleDelete = async (id) => {
    showConfirm({
      title: '确认删除',
      message: '确定要删除这个项目吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await yourAPI.delete(id);
          await fetchData();
          showToast('删除成功', 'success');
        } catch (error) {
          showToast('删除失败', 'error');
        }
      }
    });
  };

  // 保存操作
  const handleSave = async (formData) => {
    try {
      await yourAPI.save(formData);
      await fetchData();
      showToast('保存成功', 'success');
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* 页面内容 */}
      <div className="page-header">
        <h1>页面标题</h1>
      </div>

      <div className="page-content">
        {/* 你的内容 */}
      </div>

      {/* 对话框和Toast */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default YourPage;
```

## 📋 待更新页面清单

以下页面需要应用自定义对话框：

- ✅ Words.jsx - 已完成
- ⬜ PartsOfSpeech.jsx - 待更新
- ⬜ Phrases.jsx - 待更新
- ⬜ Sentences.jsx - 待更新
- ⬜ Patterns.jsx - 待更新
- ⬜ Topics.jsx - 待更新

## 🎨 自定义选项

### ConfirmDialog 完整参数

```jsx
showConfirm({
  title: '对话框标题',           // 必需
  message: '对话框消息内容',      // 必需
  type: 'danger',               // 可选: 'confirm' | 'danger' | 'alert' | 'success' | 'error'
  confirmText: '确定',          // 可选: 确认按钮文字
  cancelText: '取消',           // 可选: 取消按钮文字
  onConfirm: () => {}          // 必需: 确认回调函数
});
```

### Toast 完整参数

```jsx
showToast(
  '消息内容',                    // 必需
  'success',                    // 可选: 'success' | 'error' | 'warning' | 'info'
  3000                          // 可选: 持续时间(毫秒), 默认3000
);
```

## ✨ 优势

相比原生 `alert()` 和 `confirm()`:

1. **更美观** - 现代化UI设计，符合整体风格
2. **更灵活** - 支持多种类型和自定义选项
3. **不阻塞** - 不会阻塞浏览器线程
4. **动画效果** - 流畅的进入/退出动画
5. **响应式** - 自动适配PC和移动端
6. **可访问性** - 支持键盘操作和屏幕阅读器

## 🎉 效果预览

- **确认对话框**: 居中显示，带模糊背景，滑入动画
- **Toast通知**: 右上角显示，自动消失，带进度条
- **移动端**: 自动适配小屏幕，保持良好体验

