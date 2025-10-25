# Word Wonderland - 管理员后台

用于管理词汇学习内容的管理员后台。

## 功能特性

- 📝 单词增删改查，支持多个词性定义
- 🔤 短语管理
- 📖 句子管理
- 🎯 句型管理
- 🏷️ 主题管理
- 🎨 现代化响应式 UI
- ⚡ 快速轻量（React + Vite）

## 安装

```bash
# 安装依赖
npm install
# 或者
pnpm install
```

## 开发

```bash
# 启动开发服务器
npm run dev

# 应用将运行在 http://localhost:5173
```

在启动管理员后台之前，请确保后端 API 在 `http://localhost:3000` 上运行。

## 构建

```bash
# 生产环境构建
npm run build

# 预览生产构建
npm run preview
```

## 配置

API 端点可以通过环境变量配置：

创建 `.env` 文件：
```
VITE_API_URL=http://localhost:3000/api
```

## 使用方法

1. 首先启动后端服务器
2. 运行管理员后台
3. 使用侧边栏导航不同的部分
4. 根据需要添加、编辑或删除内容

## 技术栈

- React 18
- React Router DOM
- Axios
- Vite
- 原生 CSS（轻量化，无重型框架）

