# Docker 部署指南 🐳

Word Wonderland 项目的 Docker 部署指南，包含本地和 GitHub 两种部署方式。

## 📋 前置要求

- Docker 已安装 (建议版本 20.10+)
- Docker Compose 已安装 (建议版本 2.0+)

```bash
docker --version
docker-compose --version
```

---

## 🚀 快速开始

### 方式一：本地部署（推荐）

在项目根目录执行：

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 查看状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f
```

### 方式二：从 GitHub 部署

**注意**: Windows Docker Desktop 不支持从 URL 构建，Linux/Mac 可用。

```bash
# 使用 GitHub 配置文件
docker-compose -f docker-compose.github.yml up -d
```

---

## 🌐 访问服务

- **后端 API**: http://localhost:3000
- **API 文档**: http://localhost:3000/api-docs  
- **管理后台**: http://localhost:5173
- **学生端应用**: http://localhost:5174

---

## 🔧 常用命令

### 基本操作

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps
```

### 更新代码

```bash
# 重新构建并启动
docker-compose up -d --build

# 或分步执行
docker-compose build --no-cache
docker-compose up -d
```

### 管理数据卷

```bash
# 查看卷
docker volume ls

# 备份数据
docker run --rm \
  -v words-data:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /source .

# 恢复数据
docker stop word-wonderland-backend
docker run --rm \
  -v words-data:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /target
docker start word-wonderland-backend
```

---

## 💾 数据持久化

项目使用**命名存储卷** `words-data` 保存数据，由 Docker 自动管理。

优点：
- ✅ 跨平台兼容
- ✅ 自动管理和备份
- ✅ 独立于容器生命周期

**切换为绑定挂载**（如需直接访问文件）：

编辑 `docker-compose.yml`：

```yaml
backend:
  volumes:
    # 注释命名卷
    # - words-data:/app/data
    
    # 使用绑定挂载
    - ./word-wonderland-backend/data:/app/data
```

---

## 📱 内网访问

```bash
# 获取本机 IP
ipconfig          # Windows
ifconfig          # Linux/Mac

# 使用 IP 访问
http://192.168.x.x:3000   # 后端
http://192.168.x.x:5173   # 管理后台
http://192.168.x.x:5174   # 学生端
```

确保防火墙开放了对应端口（3000, 5173, 5174）。

---

## 🐛 故障排查

### 端口被占用

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# 修改 docker-compose.yml 中的端口映射
ports:
  - "3001:3000"  # 改用其他端口
```

### 前端无法连接后端

```bash
# 检查后端是否运行
docker ps | grep backend

# 查看后端日志
docker logs word-wonderland-backend

# 检查网络
docker network inspect word-wonderland-network
```

### 构建失败

```bash
# 清除缓存重新构建
docker-compose build --no-cache

# 查看详细日志
docker-compose up --build
```

### pnpm-lock.yaml 找不到

**原因**: `.gitignore` 忽略了 lock 文件。

**解决**: Dockerfile 已配置自动检测，会使用 npm 作为替代。如仍有问题：

```bash
docker builder prune
docker-compose build --no-cache
```

---

## 📦 生产环境建议

### 1. 定期备份

创建 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p ${BACKUP_DIR}

docker run --rm \
  -v words-data:/source \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/backup-${TIMESTAMP}.tar.gz -C /source .

echo "备份完成: ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"

# 保留最近 7 天的备份
find ${BACKUP_DIR} -name "backup-*.tar.gz" -mtime +7 -delete
```

设置定时任务：
```bash
# Linux crontab
0 2 * * * /path/to/backup.sh

# Windows 计划任务
schtasks /create /tn "Docker Backup" /tr "C:\path\to\backup.bat" /sc daily /st 02:00
```

### 2. 使用环境变量

创建 `.env` 文件：

```env
# 端口配置
BACKEND_PORT=3000
ADMIN_PORT=5173
APP_PORT=5174

# 环境
NODE_ENV=production
```

在 `docker-compose.yml` 中引用：

```yaml
services:
  backend:
    ports:
      - "${BACKEND_PORT}:3000"
    environment:
      - NODE_ENV=${NODE_ENV}
```

### 3. 配置资源限制

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 4. 配置日志轮转

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🧹 清理资源

```bash
# 停止并删除容器
docker-compose down

# 删除容器和卷（会删除数据！）
docker-compose down -v

# 删除镜像
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest

# 清理未使用的资源
docker system prune -a
```

---

## 📚 配置文件说明

### docker-compose.yml
本地部署配置，从本地代码构建。

### docker-compose.github.yml  
从 GitHub 仓库构建，无需克隆代码（Windows Docker Desktop 不支持）。

需要修改仓库地址：
```yaml
context: https://github.com/YOUR_USERNAME/word-wonderland.git#main:word-wonderland-backend
```

---

## ✅ 验证部署

```bash
# 1. 检查容器状态
docker-compose ps

# 2. 测试后端 API
curl http://localhost:3000/api/words

# 3. 浏览器访问
# http://localhost:3000/api-docs
# http://localhost:5173
# http://localhost:5174
```

---

## 📖 更多参考

- [数据导出指南](DOCKER_DATA_EXPORT.md) - 获取存储卷数据的多种方法  
- [快速命令参考](DOCKER_QUICK_REFERENCE.md) - 常用命令速查表
- [Docker 官方文档](https://docs.docker.com/)

---

需要帮助？请查看日志或提交 Issue。
