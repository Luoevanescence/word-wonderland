# Docker 部署快速参考 🚀

快速查阅 Docker 部署命令，包含本地部署和从 GitHub 直接部署两种方式。

## 📖 完整文档

- [本地部署完整指南](DOCKER_DEPLOYMENT.md)
- [GitHub 部署完整指南](DOCKER_DEPLOYMENT_FROM_GITHUB.md)

---

## 🏠 方式一：从本地代码部署

### 前置条件
- 已克隆项目到本地
- 在项目根目录执行命令

### 快速命令

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 查看状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down

# 5. 重新构建
docker-compose up -d --build
```

### 单个服务操作

```bash
# 构建特定服务
docker-compose build backend
docker-compose build admin
docker-compose build app

# 重启特定服务
docker-compose restart backend

# 查看特定服务日志
docker-compose logs -f backend
```

---

## 🌐 方式二：从 GitHub 直接部署

### 前置条件
- **不需要**克隆项目
- 只需要 `docker-compose.github.yml` 文件
- 需要修改 GitHub 用户名

### 使用 Docker Compose

```bash
# 1. 创建工作目录
mkdir word-wonderland && cd word-wonderland

# 2. 下载配置文件
curl -O https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words/main/docker-compose.github.yml

# 3. 编辑配置文件，替换 YOUR_GITHUB_USERNAME 为你的 GitHub 用户名

# 4. 创建数据目录
mkdir -p data

# 5. 构建并启动
docker-compose -f docker-compose.github.yml up -d

# 6. 查看状态
docker-compose -f docker-compose.github.yml ps

# 7. 查看日志
docker-compose -f docker-compose.github.yml logs -f

# 8. 停止服务
docker-compose -f docker-compose.github.yml down

# 9. 更新服务（从 GitHub 拉取最新代码）
docker-compose -f docker-compose.github.yml build --no-cache
docker-compose -f docker-compose.github.yml up -d
```

### 手动 Docker 命令

**重要**: 将 `YOUR_GITHUB_USERNAME` 替换为你的 GitHub 用户名

```bash
# 1. 创建网络
docker network create word-wonderland-network

# 2. 创建数据目录
mkdir -p data

# 3. 从 GitHub 构建后端镜像
docker build -t word-wonderland-backend:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend

# 4. 从 GitHub 构建管理后台镜像
docker build -t word-wonderland-admin:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-admin

# 5. 从 GitHub 构建学生端镜像
docker build -t word-wonderland-app:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-app

# 6. 运行后端容器
docker run -d \
  --name word-wonderland-backend \
  --network word-wonderland-network \
  -p 3000:3000 \
  -v "${PWD}/data:/app/data" \
  --restart unless-stopped \
  word-wonderland-backend:latest

# 7. 运行管理后台容器
docker run -d \
  --name word-wonderland-admin \
  --network word-wonderland-network \
  -p 5173:80 \
  --restart unless-stopped \
  word-wonderland-admin:latest

# 8. 运行学生端容器
docker run -d \
  --name word-wonderland-app \
  --network word-wonderland-network \
  -p 5174:80 \
  --restart unless-stopped \
  word-wonderland-app:latest

# 9. 查看运行状态
docker ps

# 10. 停止所有容器
docker stop word-wonderland-backend word-wonderland-admin word-wonderland-app

# 11. 删除所有容器
docker rm word-wonderland-backend word-wonderland-admin word-wonderland-app

# 12. 删除网络
docker network rm word-wonderland-network
```

---

## 🔍 常用管理命令

### 查看容器和镜像

```bash
# 查看所有容器
docker ps -a

# 查看项目相关容器
docker ps -a | grep word-wonderland

# 查看所有镜像
docker images

# 查看项目相关镜像
docker images | grep word-wonderland
```

### 查看日志

```bash
# Docker Compose 方式
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f app

# Docker 命令方式
docker logs -f word-wonderland-backend
docker logs -f word-wonderland-admin
docker logs -f word-wonderland-app

# 查看最近 100 行日志
docker logs --tail 100 word-wonderland-backend
```

### 进入容器

```bash
# 进入后端容器
docker exec -it word-wonderland-backend sh

# 进入管理后台容器
docker exec -it word-wonderland-admin sh

# 进入学生端容器
docker exec -it word-wonderland-app sh

# 退出容器
exit
```

### 资源监控

```bash
# 查看所有容器资源使用情况
docker stats

# 查看特定容器资源使用
docker stats word-wonderland-backend word-wonderland-admin word-wonderland-app

# 查看磁盘使用
docker system df
```

### 清理资源

```bash
# 停止所有运行的容器
docker stop $(docker ps -q)

# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 删除未使用的网络
docker network prune

# 删除未使用的数据卷
docker volume prune

# 一键清理所有未使用资源
docker system prune -a

# 清理特定项目资源
docker-compose down --volumes --rmi all
```

---

## 🔄 更新和维护

### 本地部署更新流程

```bash
# 1. 停止服务
docker-compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建
docker-compose build --no-cache

# 4. 启动服务
docker-compose up -d
```

### GitHub 部署更新流程

```bash
# 1. 停止服务
docker-compose -f docker-compose.github.yml down

# 2. 删除旧镜像（可选）
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest

# 3. 重新从 GitHub 构建
docker-compose -f docker-compose.github.yml build --no-cache

# 4. 启动服务
docker-compose -f docker-compose.github.yml up -d
```

或使用手动命令：

```bash
# 1. 停止并删除容器
docker stop word-wonderland-backend word-wonderland-admin word-wonderland-app
docker rm word-wonderland-backend word-wonderland-admin word-wonderland-app

# 2. 删除旧镜像
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest

# 3. 重新从 GitHub 构建（重复构建命令）
docker build -t word-wonderland-backend:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend
# ... 其他服务同理

# 4. 重新运行容器（重复运行命令）
```

---

## 🌍 访问地址

### 本地访问

- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api-docs
- 管理后台: http://localhost:5173
- 学生端应用: http://localhost:5174

### 内网访问

```bash
# 获取本机 IP
ipconfig          # Windows
ifconfig          # Linux/Mac
ip addr show      # Linux

# 使用 IP 访问
http://192.168.x.x:3000   # 后端
http://192.168.x.x:5173   # 管理后台
http://192.168.x.x:5174   # 学生端
```

---

## 🐛 故障排查命令

### 检查端口占用

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :5174

# Linux/Mac
lsof -i :3000
lsof -i :5173
lsof -i :5174
```

### 检查容器详情

```bash
# 查看容器完整信息
docker inspect word-wonderland-backend

# 查看容器网络
docker inspect word-wonderland-backend | grep -A 10 Networks

# 查看容器挂载
docker inspect word-wonderland-backend | grep -A 10 Mounts

# 查看容器环境变量
docker inspect word-wonderland-backend | grep -A 20 Env
```

### 测试网络连接

```bash
# 测试容器间网络
docker exec word-wonderland-admin ping backend
docker exec word-wonderland-app ping backend

# 测试 API
curl http://localhost:3000/api/words
curl http://localhost:3000/api-docs
```

### 查看构建历史

```bash
# 查看镜像构建历史
docker history word-wonderland-backend:latest
```

---

## 💾 数据备份

### 备份数据

```bash
# 备份后端数据目录
docker cp word-wonderland-backend:/app/data ./backup/data-$(date +%Y%m%d)

# 或直接复制本地挂载的目录
cp -r ./word-wonderland-backend/data ./backup/data-$(date +%Y%m%d)

# 压缩备份
tar -czf backup-$(date +%Y%m%d).tar.gz ./word-wonderland-backend/data
```

### 恢复数据

```bash
# 停止后端容器
docker stop word-wonderland-backend

# 恢复数据
docker cp ./backup/data word-wonderland-backend:/app/

# 或恢复到本地挂载目录
cp -r ./backup/data ./word-wonderland-backend/

# 重启容器
docker start word-wonderland-backend
```

---

## 🎯 快速诊断脚本

### 检查所有服务状态

```bash
#!/bin/bash
echo "=== 检查 Docker 服务状态 ==="
echo ""

echo "1. 检查容器运行状态："
docker ps | grep word-wonderland

echo ""
echo "2. 检查后端健康："
curl -s http://localhost:3000/api/words > /dev/null && echo "✅ 后端正常" || echo "❌ 后端异常"

echo ""
echo "3. 检查管理后台："
curl -s http://localhost:5173 > /dev/null && echo "✅ 管理后台正常" || echo "❌ 管理后台异常"

echo ""
echo "4. 检查学生端："
curl -s http://localhost:5174 > /dev/null && echo "✅ 学生端正常" || echo "❌ 学生端异常"

echo ""
echo "5. 资源使用情况："
docker stats --no-stream | grep word-wonderland
```

---

## 📋 总结

### 本地部署

| 操作 | 命令 |
|------|------|
| 构建启动 | `docker-compose up -d` |
| 停止 | `docker-compose down` |
| 重启 | `docker-compose restart` |
| 查看日志 | `docker-compose logs -f` |
| 更新 | `docker-compose up -d --build` |

### GitHub 部署

| 操作 | 命令 |
|------|------|
| 构建启动 | `docker-compose -f docker-compose.github.yml up -d` |
| 停止 | `docker-compose -f docker-compose.github.yml down` |
| 重启 | `docker-compose -f docker-compose.github.yml restart` |
| 查看日志 | `docker-compose -f docker-compose.github.yml logs -f` |
| 更新 | `docker-compose -f docker-compose.github.yml build --no-cache && docker-compose -f docker-compose.github.yml up -d` |

---

需要更详细的说明，请查看完整文档：
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- [DOCKER_DEPLOYMENT_FROM_GITHUB.md](DOCKER_DEPLOYMENT_FROM_GITHUB.md)

