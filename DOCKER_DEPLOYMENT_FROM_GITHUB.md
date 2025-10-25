# 从 GitHub 直接部署 Docker 指南 🚀

本文档提供从 GitHub 仓库直接构建和部署 Word Wonderland 项目的方法，**无需克隆代码到本地**。

> 💡 **适用场景**：
> - 生产环境快速部署
> - 服务器上没有项目代码
> - 想直接从最新代码构建
> - CI/CD 自动化部署

## 📋 前置要求

- Docker 已安装 (建议版本 20.10+)
- Docker Compose 已安装 (建议版本 2.0+)
- 网络连接正常（能访问 GitHub）
- **不需要**克隆项目代码

验证安装：
```bash
docker --version
docker-compose --version
```

## 🚀 方式一：使用 Docker Compose（推荐）

### 1. 下载配置文件

只需要下载 `docker-compose.github.yml` 文件：

```bash
# 创建项目目录
mkdir word-wonderland
cd word-wonderland

# 下载 docker-compose 配置文件
curl -O https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words/main/docker-compose.github.yml
```

或者手动创建 `docker-compose.github.yml` 文件，内容见项目仓库。

### 2. 修改配置文件

编辑 `docker-compose.github.yml`，将所有 `YOUR_GITHUB_USERNAME` 替换为你的 GitHub 用户名：

```yaml
# 例如，如果你的 GitHub 用户名是 luoevanescence
context: https://github.com/luoevanescence/bread-dog-recite-words.git#main:word-wonderland-backend
```

如果你的默认分支是 `master` 而不是 `main`，也需要相应修改。

### 3. 创建数据目录

```bash
# 在当前目录创建数据目录用于持久化
mkdir -p data
```

### 4. 构建并启动所有服务

```bash
# 使用指定的配置文件构建和启动
docker-compose -f docker-compose.github.yml up -d
```

参数说明：
- `-f docker-compose.github.yml`: 指定配置文件
- `-d`: 后台运行

首次构建会从 GitHub 下载代码并构建镜像，可能需要几分钟。

### 5. 查看运行状态

```bash
# 查看所有容器状态
docker-compose -f docker-compose.github.yml ps

# 查看实时日志
docker-compose -f docker-compose.github.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.github.yml logs -f backend
```

### 6. 访问服务

- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api-docs
- 管理后台: http://localhost:5173
- 学生端应用: http://localhost:5174

### 7. 停止服务

```bash
# 停止但不删除容器
docker-compose -f docker-compose.github.yml stop

# 停止并删除容器
docker-compose -f docker-compose.github.yml down
```

### 8. 更新服务

当 GitHub 仓库有更新时，重新构建：

```bash
# 重新从 GitHub 拉取代码并构建
docker-compose -f docker-compose.github.yml build --no-cache

# 重启服务
docker-compose -f docker-compose.github.yml up -d
```

---

## 🔧 方式二：手动使用 Docker 命令

如果不想使用 Docker Compose，可以手动执行以下命令。

### 1. 创建 Docker 网络

```bash
docker network create word-wonderland-network
```

### 2. 创建数据目录

```bash
mkdir -p data
```

### 3. 从 GitHub 构建镜像

**重要**: 将以下命令中的 `YOUR_GITHUB_USERNAME` 替换为你的实际 GitHub 用户名。

```bash
# 构建后端镜像
docker build -t word-wonderland-backend:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend

# 构建管理后台镜像
docker build -t word-wonderland-admin:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-admin

# 构建学生端镜像
docker build -t word-wonderland-app:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-app
```

构建语法说明：
```
https://github.com/用户名/仓库名.git#分支名:子目录路径
```

### 4. 运行容器

```bash
# 运行后端
docker run -d \
  --name word-wonderland-backend \
  --network word-wonderland-network \
  -p 3000:3000 \
  -v "${PWD}/data:/app/data" \
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

**Windows PowerShell 用户**: 将 `${PWD}` 替换为完整路径，例如：
```powershell
-v "C:\Users\YourName\word-wonderland\data:/app/data"
```

### 5. 查看状态

```bash
# 查看所有运行的容器
docker ps

# 查看日志
docker logs -f word-wonderland-backend
docker logs -f word-wonderland-admin
docker logs -f word-wonderland-app
```

### 6. 更新镜像

当 GitHub 代码更新后，重新构建镜像：

```bash
# 停止并删除旧容器
docker stop word-wonderland-backend word-wonderland-admin word-wonderland-app
docker rm word-wonderland-backend word-wonderland-admin word-wonderland-app

# 删除旧镜像
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest

# 重新从 GitHub 构建（执行步骤 3）
# 然后重新运行容器（执行步骤 4）
```

---

## 🔍 常用管理命令

### 查看镜像

```bash
docker images | grep word-wonderland
```

### 查看容器

```bash
docker ps -a | grep word-wonderland
```

### 进入容器调试

```bash
docker exec -it word-wonderland-backend sh
docker exec -it word-wonderland-admin sh
docker exec -it word-wonderland-app sh
```

### 清理资源

```bash
# 停止所有容器
docker-compose -f docker-compose.github.yml down

# 删除所有镜像
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest

# 清理未使用的资源
docker system prune -a
```

---

## 🌐 修改仓库地址和分支

### 使用不同的分支

如果你想从其他分支构建（比如 `develop` 分支）：

```bash
# 修改 docker-compose.github.yml 中的分支名
context: https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#develop:word-wonderland-backend
```

或在命令行中：

```bash
docker build -t word-wonderland-backend:develop \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#develop:word-wonderland-backend
```

### 使用特定的 Tag 或 Commit

```bash
# 使用特定 tag
docker build -t word-wonderland-backend:v1.0.0 \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#v1.0.0:word-wonderland-backend

# 使用特定 commit
docker build -t word-wonderland-backend:latest \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#abc1234:word-wonderland-backend
```

---

## 📱 内网访问

部署完成后，可以通过局域网访问：

```bash
# Windows - 获取 IP
ipconfig

# Linux/Mac - 获取 IP
ifconfig
```

然后使用 IP 访问：
```
http://192.168.x.x:3000    # 后端
http://192.168.x.x:5173    # 管理后台
http://192.168.x.x:5174    # 学生端
```

---

## 🐛 故障排查

### 问题1: GitHub 连接失败

```bash
# 检查网络连接
ping github.com

# 如果在国内，可能需要配置代理
# 或者使用国内的 Git 镜像源
```

### 问题2: 构建速度慢

原因：需要从 GitHub 下载代码，可能受网络影响。

解决方案：
1. 使用代理
2. 等待构建完成（首次较慢，后续会快）
3. 或使用本地构建方式（见 DOCKER_DEPLOYMENT.md）

### 问题3: pnpm-lock.yaml 或 package-lock.json 找不到

**错误信息**: `"/pnpm-lock.yaml": not found`

**原因**: 项目的 `.gitignore` 文件忽略了 lock 文件，从 GitHub 拉取时这些文件不存在。

**解决方案**: Dockerfile 已经更新为自动处理这种情况，会自动检测：
- 如果有 `pnpm-lock.yaml` 使用 pnpm
- 否则使用 npm

如果仍然有问题，可以：

```bash
# 1. 清除构建缓存
docker builder prune

# 2. 重新构建
docker-compose -f docker-compose.github.yml build --no-cache
```

### 问题4: 找不到分支或子目录

检查：
1. GitHub 用户名是否正确
2. 分支名是否正确（main 或 master）
3. 子目录路径是否正确

```bash
# 查看详细错误信息
docker build --progress=plain -t test \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend
```

### 问题5: 数据持久化问题

确保 data 目录已创建：
```bash
mkdir -p data

# 检查挂载
docker inspect word-wonderland-backend | grep -A 10 Mounts
```

### 问题6: 权限问题

Linux 用户可能需要 sudo：
```bash
sudo docker-compose -f docker-compose.github.yml up -d
```

或者将当前用户添加到 docker 组：
```bash
sudo usermod -aG docker $USER
# 然后重新登录
```

---

## 🔐 私有仓库部署

如果你的仓库是私有的，需要配置认证。

### 方法1: 使用 Personal Access Token

```bash
# 1. 在 GitHub 创建 Personal Access Token
# Settings -> Developer settings -> Personal access tokens

# 2. 使用 token 构建
docker build -t word-wonderland-backend:latest \
  --build-arg GIT_TOKEN=your_token_here \
  https://your_token_here@github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend
```

### 方法2: 使用 SSH 密钥

```bash
# 需要配置 SSH 密钥到 GitHub
docker build -t word-wonderland-backend:latest \
  git@github.com:YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#main:word-wonderland-backend
```

---

## 📦 生产环境建议

### 1. 使用特定版本标签

```bash
# 不要总是使用 latest，使用具体版本
docker build -t word-wonderland-backend:v1.0.0 \
  https://github.com/YOUR_GITHUB_USERNAME/bread-dog-recite-words.git#v1.0.0:word-wonderland-backend
```

### 2. 自动化部署脚本

创建 `deploy.sh`:

```bash
#!/bin/bash
# 从 GitHub 自动部署脚本

GITHUB_USER="YOUR_GITHUB_USERNAME"
BRANCH="main"

echo "开始从 GitHub 部署..."

# 停止旧服务
docker-compose -f docker-compose.github.yml down

# 清理旧镜像
docker rmi word-wonderland-backend:latest
docker rmi word-wonderland-admin:latest
docker rmi word-wonderland-app:latest

# 重新构建
docker-compose -f docker-compose.github.yml build --no-cache

# 启动服务
docker-compose -f docker-compose.github.yml up -d

echo "部署完成！"
docker-compose -f docker-compose.github.yml ps
```

### 3. 配置 Webhook

可以配置 GitHub Webhook，在代码推送时自动触发部署。

### 4. 使用 CI/CD

集成到 GitHub Actions、GitLab CI 等 CI/CD 工具中。

---

## ✅ 验证部署

```bash
# 1. 检查容器状态
docker-compose -f docker-compose.github.yml ps

# 2. 测试后端 API
curl http://localhost:3000/api/words

# 3. 浏览器访问
# http://localhost:3000/api-docs
# http://localhost:5173
# http://localhost:5174
```

---

## 🎉 完成！

现在你已经成功从 GitHub 直接部署了 Word Wonderland 应用，无需本地代码！

**优势**：
✅ 无需克隆代码  
✅ 始终使用最新代码  
✅ 适合生产环境  
✅ 易于自动化部署  

如有问题，请查看日志或提交 Issue。

