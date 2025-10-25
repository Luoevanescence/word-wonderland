Luoevanescence# Word Wonderland 🌟

一个现代化的英语学习平台，包含单词管理、短语、句子、句型和主题学习功能。

## 📦 项目结构

```
bread-dog-recite-words/
├── word-wonderland-backend/    # 后端API服务
├── word-wonderland-admin/      # 管理员后台
├── word-wonderland-app/        # 学生端应用
└── README.md
```

## 🚀 技术栈

### 后端

- **Node.js** + **Express** - RESTful API
- **文件存储** - JSON数据持久化
- **Swagger** - API文档

### 前端

- **React 18** - UI框架
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Axios** - HTTP客户端

## 📋 功能特性

### 管理员后台

- ✅ 单词管理（支持多个词性定义）
- ✅ 词性管理
- ✅ 短语管理
- ✅ 句子管理
- ✅ 句型管理
- ✅ 主题管理
- ✅ 批量删除功能
- ✅ 分页展示
- ✅ 移动端适配

### 学生端应用

- ✅ 随机学习单词/短语/句子
- ✅ 响应式设计

## 🛠️ 快速开始

### 前置要求

- Node.js >= 16
- pnpm (推荐) 或 npm

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/bread-dog-recite-words.git
cd bread-dog-recite-words
```

### 2. 启动后端

```bash
cd word-wonderland-backend
npm install
npm start
```

后端将运行在 `http://localhost:3000`

### 3. 启动管理员后台

```bash
cd word-wonderland-admin
npm install
npm run dev
```

管理员后台将运行在 `http://localhost:5173`

### 4. 启动学生端应用

```bash
cd word-wonderland-app
npm install
npm run dev
```

学生端应用将运行在 `http://localhost:5174`

## 📡 API文档

启动后端后访问：`http://localhost:3000/api-docs`

## 🌐 内网访问配置

项目已配置内网访问支持，可以通过局域网IP访问：

```bash
# 获取本机IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# 访问地址示例
http://192.168.1.xxx:3000  # 后端API
http://192.168.1.xxx:5173  # 管理员后台
http://192.168.1.xxx:5174  # 学生端应用
```

## 📱 移动端支持

所有页面都已适配移动端，使用手机浏览器访问即可。

## 🎨 界面预览

### 管理员后台

- 现代化的紫色渐变主题
- 卡片式布局
- 流畅的动画效果
- 自定义对话框和Toast通知

### 学生端应用

- 简洁清爽的学习界面
- 随机学习功能
- 主题分类学习

## 📂 项目详细说明

### 后端 (word-wonderland-backend)

```
word-wonderland-backend/
├── controllers/        # 控制器
├── routes/            # 路由定义
├── services/          # 业务逻辑
├── data/              # JSON数据文件
├── app.js             # 入口文件
└── config.js          # 配置文件
```

**端口**: 3000
**数据存储**: JSON文件（`data/`目录）

### 管理员后台 (word-wonderland-admin)

```
word-wonderland-admin/
├── src/
│   ├── components/    # 可复用组件
│   ├── pages/         # 页面组件
│   ├── services/      # API服务
│   ├── hooks/         # 自定义Hooks
│   └── App.jsx        # 主应用
└── vite.config.js     # Vite配置
```

**端口**: 5173
**主要功能**: CRUD操作、批量管理、数据展示

### 学生端应用 (word-wonderland-app)

```
word-wonderland-app/
├── src/
│   ├── components/    # UI组件
│   ├── pages/         # 页面
│   ├── services/      # API调用
│   └── App.jsx
└── vite.config.js
```

**端口**: 5174
**主要功能**: 学习、练习、进度跟踪

## 🔧 开发指南

### 添加新功能

1. **后端**:

   - 在 `controllers/` 添加控制器
   - 在 `routes/` 添加路由
   - 在 `data/` 添加数据文件
2. **前端**:

   - 在 `pages/` 添加页面组件
   - 在 `services/api.js` 添加API调用
   - 在路由中注册新页面

### 代码规范

- 使用 ESLint 进行代码检查
- 组件采用函数式写法
- CSS采用模块化设计
- API使用RESTful规范

## 🐛 常见问题

### Q: 前端无法连接后端？

A: 确保后端已启动并运行在3000端口，检查proxy配置。

### Q: 手机端无法访问？

A: 确保手机和电脑在同一局域网，使用电脑的IP地址访问。

### Q: 数据丢失了？

A: 数据保存在 `backend/data/` 目录下的JSON文件中，定期备份。

## 🐳 Docker 部署

项目已支持 Docker 部署！提供两种部署方式：

📚 **部署文档**：
- [从本地代码部署](DOCKER_DEPLOYMENT.md) - 适合开发和本地测试
- [从 GitHub 直接部署](DOCKER_DEPLOYMENT_FROM_GITHUB.md) - 适合生产环境，无需克隆代码

### 方式一：从本地快速启动

```bash
# 使用 Docker Compose 一键部署
docker-compose up -d
```

### 方式二：从 GitHub 直接构建（无需克隆代码）

```bash
# 1. 下载配置文件
mkdir word-wonderland && cd word-wonderland
curl -O https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words/main/docker-compose.github.yml

# 2. 修改配置文件中的 YOUR_GITHUB_USERNAME 为你的 GitHub 用户名

# 3. 创建数据目录
mkdir -p data

# 4. 构建并启动
docker-compose -f docker-compose.github.yml up -d
```

或使用 Docker 命令直接构建：

```bash
# 创建网络
docker network create word-wonderland-network

# 从 GitHub 构建镜像（替换 YOUR_GITHUB_USERNAME）
docker build -t word-wonderland-backend:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend

docker build -t word-wonderland-admin:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-admin

docker build -t word-wonderland-app:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-app

# 运行容器（完整命令见文档）
```

### 访问服务

- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api-docs
- 管理后台: http://localhost:5173
- 学生端应用: http://localhost:5174

### 停止服务

```bash
# 本地部署
docker-compose down

# GitHub 部署
docker-compose -f docker-compose.github.yml down
```

更多详细命令和故障排查，请参考部署文档

## 📈 未来计划

- [ ]  用户认证和授权
- [ ]  数据库支持（MongoDB/PostgreSQL）
- [ ]  学习统计和分析
- [ ]  单词卡片记忆功能
- [ ]  发音功能
- [ ]  导入导出Excel
- [x]  Docker部署支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

[MIT License](LICENSE)

## 👨‍💻 作者

Luoevanescence

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
