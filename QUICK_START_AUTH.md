# 🚀 认证功能快速开始

## 1️⃣ 安装依赖（2分钟）

```bash
cd word-wonderland-backend
pnpm install
cd ..
```

## 2️⃣ 创建环境变量文件（1分钟）

在项目根目录创建 `.env` 文件：

```bash
# Windows PowerShell
@"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=word-wonderland-secret-2024
JWT_EXPIRES_IN=24h
"@ | Out-File -FilePath .env -Encoding UTF8

# Linux/Mac
cat > .env << 'EOF'
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=word-wonderland-secret-2024
JWT_EXPIRES_IN=24h
EOF
```

## 3️⃣ 重新构建 Docker（3分钟）

```bash
docker-compose build --no-cache
docker-compose up -d
```

## 4️⃣ 访问登录页面

打开浏览器访问：**http://localhost:5173/login**

**默认账号：** `admin`  
**默认密码：** `admin123`

## ✅ 完成！

登录成功后，你可以：
- 管理单词、短语、句子等
- Token 24小时内自动保持登录
- 点击左下角"退出登录"可登出

## 📚 详细文档

- **完整部署指南：** [AUTH_SETUP.md](./AUTH_SETUP.md)
- **实现总结：** [AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md)

---

**提示：** 生产环境请务必修改 `.env` 中的密码和密钥！

