# 管理员认证功能部署指南

## 📋 功能概述

已为 Word Wonderland 管理后台添加完整的登录认证功能：

- ✅ 管理员登录页面
- ✅ JWT Token 认证
- ✅ Token 自动刷新和过期处理
- ✅ 路由保护（未登录自动跳转）
- ✅ API 请求自动携带 Token
- ✅ 环境变量配置账号密码

## 🚀 快速开始

### 1. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 管理员账号配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# JWT 配置
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

**⚠️ 重要提示：**
- 生产环境请务必修改 `ADMIN_PASSWORD` 和 `JWT_SECRET`
- JWT_SECRET 建议使用随机生成的复杂字符串

**生成安全的 JWT_SECRET：**
```bash
# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 32
```

### 2. 安装后端依赖

```bash
cd word-wonderland-backend
npm install
# 或
pnpm install
```

### 3. 构建并启动 Docker 服务

```bash
# 重新构建（包含新的认证功能）
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

## 📝 默认登录信息

**默认账号：** `admin`  
**默认密码：** `admin123`

**⚠️ 生产环境请立即修改！**

## 🔧 功能说明

### 后端 API

#### 1. 登录接口
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin",
    "expiresIn": "24h"
  }
}
```

#### 2. 验证 Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

#### 3. 登出
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### 前端功能

#### 1. 登录页面
- 路径：`/login`
- 自动保存 Token 到 localStorage
- 登录成功后跳转到首页

#### 2. 路由保护
所有管理页面都需要登录才能访问：
- `/` - 单词管理
- `/parts-of-speech` - 词性管理
- `/phrases` - 短语管理
- `/sentences` - 句子管理
- `/patterns` - 句型管理
- `/topics` - 主题管理
- `/components` - 成分管理

#### 3. 自动登出
- Token 过期自动跳转登录页
- 手动退出登录功能

### API 保护

以下操作需要认证：
- ✅ 创建（POST）
- ✅ 查询所有（GET /api/xxx）
- ✅ 查询单个（GET /api/xxx/:id）
- ✅ 更新（PUT）
- ✅ 删除（DELETE）
- ✅ 批量删除

公开接口（不需要认证）：
- ✅ 获取随机数据（GET /api/xxx/random）- 用于学生端

## 🔐 Token 配置

### Token 有效期

在 `.env` 文件中配置：

```bash
# 24 小时
JWT_EXPIRES_IN=24h

# 7 天
JWT_EXPIRES_IN=7d

# 30 天
JWT_EXPIRES_IN=30d

# 自定义（秒）
JWT_EXPIRES_IN=86400
```

### Token 存储

- **位置：** localStorage
- **键名：** `admin_token`
- **格式：** Bearer Token

## 🛠️ 开发提示

### 测试登录功能

1. 访问：`http://localhost:5173/login`
2. 输入默认账号密码
3. 登录成功后自动跳转到首页

### 清除登录状态

```javascript
// 在浏览器控制台执行
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
location.reload();
```

### 查看当前 Token

```javascript
// 在浏览器控制台执行
localStorage.getItem('admin_token');
```

## 📦 Docker 环境变量

docker-compose.yml 中已配置：

```yaml
environment:
  - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
  - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
  - JWT_SECRET=${JWT_SECRET:-default-secret}
  - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-24h}
```

**修改方式：**

1. **使用 .env 文件（推荐）**
   ```bash
   echo "ADMIN_PASSWORD=mysecurepass" > .env
   echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
   ```

2. **直接修改 docker-compose.yml**
   ```yaml
   environment:
     - ADMIN_USERNAME=myadmin
     - ADMIN_PASSWORD=mysecurepass
   ```

## 🔍 故障排查

### 1. 登录失败

**问题：** 提示"用户名或密码错误"

**解决：**
- 检查 .env 文件配置
- 查看后端日志：`docker-compose logs backend`
- 确认环境变量已正确传入容器

### 2. Token 过期太快

**问题：** 频繁需要重新登录

**解决：**
- 修改 `JWT_EXPIRES_IN` 为更长时间（如 `7d`）
- 重启后端服务

### 3. 无法访问管理页面

**问题：** 直接跳转到登录页

**解决：**
- 检查 localStorage 是否有 token
- 清除浏览器缓存重新登录
- 检查 Token 是否过期

### 4. API 请求返回 401

**问题：** 所有操作都提示未认证

**解决：**
- 检查 token 是否正确保存
- 查看浏览器 Network 面板，确认请求头包含 `Authorization`
- 清除登录信息重新登录

## 🔄 后续路由文件更新

以下路由文件需要应用相同的认证模式（已提供 word 和 phrase 示例）：

- ✅ `routes/word.routes.js` - 已完成
- ✅ `routes/phrase.routes.js` - 已完成
- ⏳ `routes/sentence.routes.js` - 待更新
- ⏳ `routes/pattern.routes.js` - 待更新
- ⏳ `routes/topic.routes.js` - 待更新
- ⏳ `routes/partOfSpeech.routes.js` - 待更新
- ⏳ `routes/component.routes.js` - 待更新

**更新模式：**

```javascript
const authMiddleware = require('../middleware/auth.middleware');

// 公开路由
router.get('/random', controller.getRandom);

// 需要认证的路由
router.post('/', authMiddleware, controller.create);
router.get('/', authMiddleware, controller.findAll);
router.get('/:id', authMiddleware, controller.findById);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);
router.post('/bulk/delete', authMiddleware, controller.bulkDelete);
```

## ✅ 完成清单

- [x] 后端 JWT 依赖安装
- [x] 后端认证配置
- [x] 登录 API 实现
- [x] Token 验证中间件
- [x] 部分路由保护（word, phrase）
- [ ] 全部路由保护（其他5个路由文件）
- [x] 前端登录页面
- [x] 前端路由守卫
- [x] Token 存储管理
- [x] API 请求拦截器
- [x] Docker 环境变量配置
- [ ] 生产环境密码修改
- [ ] 完整功能测试

## 📚 相关文件

**后端：**
- `word-wonderland-backend/config.js` - 配置文件
- `word-wonderland-backend/controllers/auth.controller.js` - 认证控制器
- `word-wonderland-backend/middleware/auth.middleware.js` - 认证中间件
- `word-wonderland-backend/routes/auth.routes.js` - 认证路由

**前端：**
- `word-wonderland-admin/src/pages/Login.jsx` - 登录页面
- `word-wonderland-admin/src/components/PrivateRoute.jsx` - 路由守卫
- `word-wonderland-admin/src/utils/auth.js` - Token 管理
- `word-wonderland-admin/src/services/api.js` - API 拦截器

**Docker：**
- `docker-compose.yml` - 环境变量配置
- `.env` - 环境变量文件（需自行创建）

---

**创建时间：** 2024年10月28日  
**版本：** 1.0.0

