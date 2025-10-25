# Docker 部署指南 🐳

本文档提供 Word Wonderland 项目的 Docker 手动部署命令步骤。

## 📋 前置要求

- Docker 已安装 (建议版本 20.10+)
- Docker Compose 已安装 (建议版本 2.0+)

验证安装：
```bash
docker --version
docker-compose --version
```

## 🚀 方式一：使用 Docker Compose（推荐）

### 1. 构建所有镜像

在项目根目录执行：

```bash
docker-compose build
```

如果想单独构建某个服务：
```bash
# 只构建后端
docker-compose build backend

# 只构建管理后台
docker-compose build admin

# 只构建学生端
docker-compose build app
```

### 2. 启动所有服务

```bash
docker-compose up -d
```

参数说明：
- `-d`: 后台运行（detached mode）
- 去掉 `-d` 可以看到实时日志

### 3. 查看运行状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f app
```

### 4. 访问服务

- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api-docs
- 管理后台: http://localhost:5173
- 学生端应用: http://localhost:5174

### 5. 停止服务

```bash
# 停止但不删除容器
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止、删除容器和网络
docker-compose down --volumes
```

### 6. 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 7. 更新服务

当代码有更新时：

```bash
# 重新构建并启动
docker-compose up -d --build

# 或者分步执行
docker-compose build
docker-compose up -d
```

---

## 🔧 方式二：手动使用 Docker 命令

如果不想使用 Docker Compose，可以手动执行以下命令。

### 1. 创建 Docker 网络

```bash
docker network create word-wonderland-network
```

### 2. 构建镜像

```bash
# 构建后端镜像
cd word-wonderland-backend
docker build -t word-wonderland-backend:latest .
cd ..

# 构建管理后台镜像
cd word-wonderland-admin
docker build -t word-wonderland-admin:latest .
cd ..

# 构建学生端镜像
cd word-wonderland-app
docker build -t word-wonderland-app:latest .
cd ..
```

### 3. 运行容器

```bash
# 运行后端
docker run -d \
  --name word-wonderland-backend \
  --network word-wonderland-network \
  -p 3000:3000 \
  -v "${PWD}/word-wonderland-backend/data:/app/data" \
  --restart unless-stopped \
  word-wonderland-backend:latest

# 运行管理后台
docker run -d \
  --name word-wonderland-admin \
  --network word-wonderland-network \
  -p 5173:80 \
  --restart unless-stopped \
  word-wonderland-admin:latest

# 运行学生端应用
docker run -d \
  --name word-wonderland-app \
  --network word-wonderland-network \
  -p 5174:80 \
  --restart unless-stopped \
  word-wonderland-app:latest
```

**注意**: Windows PowerShell 用户请将 `${PWD}` 替换为当前目录的绝对路径，例如：
```powershell
-v "E:\03_Development\Projects\bread-dog-recite-words\word-wonderland-backend\data:/app/data"
```

### 4. 查看运行状态

```bash
# 查看所有运行的容器
docker ps

# 查看容器日志
docker logs word-wonderland-backend
docker logs word-wonderland-admin
docker logs word-wonderland-app

# 实时查看日志
docker logs -f word-wonderland-backend
```

### 5. 停止和删除容器

```bash
# 停止容器
docker stop word-wonderland-backend word-wonderland-admin word-wonderland-app

# 删除容器
docker rm word-wonderland-backend word-wonderland-admin word-wonderland-app

# 删除网络
docker network rm word-wonderland-network
```

### 6. 重启容器

```bash
docker restart word-wonderland-backend
docker restart word-wonderland-admin
docker restart word-wonderland-app
```

---

## 🔍 常用管理命令

### 查看镜像

```bash
# 列出所有镜像
docker images

# 搜索项目相关镜像
docker images | grep word-wonderland
```

### 删除镜像

```bash
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest
```

### 进入容器

```bash
# 进入后端容器
docker exec -it word-wonderland-backend sh

# 进入管理后台容器
docker exec -it word-wonderland-admin sh

# 进入学生端容器
docker exec -it word-wonderland-app sh
```

### 查看资源使用

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器
docker stats word-wonderland-backend
```

### 清理系统

```bash
# 清理未使用的容器
docker container prune

# 清理未使用的镜像
docker image prune

# 清理未使用的网络
docker network prune

# 一键清理所有未使用资源
docker system prune -a
```

---

## 📱 内网访问

如果需要在局域网内的其他设备访问：

1. 获取服务器IP地址：
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

2. 确保防火墙开放了对应端口（3000, 5173, 5174）

3. 使用服务器IP访问：
```
http://192.168.x.x:3000    # 后端
http://192.168.x.x:5173    # 管理后台
http://192.168.x.x:5174    # 学生端
```

---

## 🐛 故障排查

### 问题1: 端口已被占用

```bash
# Windows - 查看端口占用
netstat -ano | findstr :3000

# 停止占用端口的进程或修改 docker-compose.yml 中的端口映射
```

### 问题2: 前端无法连接后端

检查：
1. 后端容器是否正常运行：`docker ps`
2. 后端日志是否有错误：`docker logs word-wonderland-backend`
3. nginx 配置中的 backend 地址是否正确

### 问题3: 数据丢失

确保后端的 data 目录已正确挂载：
```bash
docker inspect word-wonderland-backend | grep Mounts -A 10
```

### 问题4: 构建失败

```bash
# 清除构建缓存重新构建
docker-compose build --no-cache

# 或手动清除
docker builder prune
```

### 问题5: 容器无法启动

```bash
# 查看详细错误信息
docker logs word-wonderland-backend

# 检查容器状态
docker inspect word-wonderland-backend
```

---

## 📦 生产环境建议

1. **使用环境变量管理配置**
   - 创建 `.env` 文件
   - 在 docker-compose.yml 中引用

2. **数据备份**
   ```bash
   # 备份后端数据
   docker cp word-wonderland-backend:/app/data ./backup/data-$(date +%Y%m%d)
   ```

3. **使用特定版本标签**
   ```bash
   docker build -t word-wonderland-backend:v1.0.0 .
   ```

4. **设置资源限制**
   在 docker-compose.yml 中添加：
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

5. **配置日志轮转**
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

## ✅ 验证部署

部署完成后，验证各服务是否正常：

```bash
# 1. 检查所有容器状态
docker-compose ps

# 2. 测试后端 API
curl http://localhost:3000/api/words

# 3. 访问 API 文档
# 浏览器打开: http://localhost:3000/api-docs

# 4. 访问管理后台
# 浏览器打开: http://localhost:5173

# 5. 访问学生端
# 浏览器打开: http://localhost:5174
```

---

## 🎉 完成！

现在你的 Word Wonderland 应用已经通过 Docker 成功部署了！

如有问题，请查看日志或提交 Issue。

