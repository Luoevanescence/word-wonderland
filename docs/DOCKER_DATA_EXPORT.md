# Docker 数据导出指南 📦

本文档介绍如何从 Docker 命名存储卷 `words-data` 中获取数据的多种方法。

---

## 🔍 方式一：直接复制（推荐，最简单）

从运行中的容器复制数据到本地：

```bash
# 复制整个数据目录到当前位置
docker cp word-wonderland-backend:/app/data ./data-export

# 查看导出的数据
ls -lh ./data-export

# 查看某个文件
cat ./data-export/words.json
```

**优点**：
- ✅ 简单直接，一条命令搞定
- ✅ 不需要停止容器
- ✅ 适合快速导出

---

## 📦 方式二：打包导出

将数据打包成压缩文件，便于传输和备份：

```bash
# 从命名卷打包导出
docker run --rm \
  -v words-data:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/words-data-export.tar.gz -C /source .

# 查看压缩包
ls -lh words-data-export.tar.gz

# 解压到指定目录
mkdir -p data-export
tar -xzf words-data-export.tar.gz -C ./data-export

# 查看解压后的文件
ls -lh ./data-export
```

**Windows PowerShell 用户**：
```powershell
docker run --rm `
  -v words-data:/source `
  -v ${PWD}:/backup `
  alpine tar czf /backup/words-data-export.tar.gz -C /source .
```

**优点**：
- ✅ 适合备份和传输
- ✅ 文件压缩，节省空间
- ✅ 可以导出历史版本

---

## 🔎 方式三：进入容器查看

直接在容器内查看和操作数据：

```bash
# 进入后端容器
docker exec -it word-wonderland-backend sh

# 查看数据目录
cd /app/data
ls -la

# 查看文件内容
cat words.json

# 查看文件大小
du -sh *

# 退出容器
exit
```

**优点**：
- ✅ 可以直接编辑文件
- ✅ 实时查看数据
- ✅ 适合调试

---

## 📂 方式四：查看存储卷位置

查看 Docker 卷在服务器上的实际位置：

```bash
# 查看卷的详细信息
docker volume inspect words-data

# 只查看存储位置
docker volume inspect words-data --format '{{.Mountpoint}}'

# 查看卷大小
docker system df -v | grep words-data
```

**Linux 服务器直接访问**（需要 root 权限）：

```bash
# 查看实际位置（通常在 /var/lib/docker/volumes/）
sudo ls -la /var/lib/docker/volumes/words-data/_data/

# 直接复制
sudo cp -r /var/lib/docker/volumes/words-data/_data/ ./data-export

# 查看文件
sudo cat /var/lib/docker/volumes/words-data/_data/words.json
```

**注意**：Windows 和 Mac 的 Docker Desktop 使用虚拟机，无法直接访问该路径。

---

## 💻 快速导出脚本

### 脚本 1：简单导出

创建 `export-data.sh`：

```bash
#!/bin/bash
# 快速导出数据脚本

EXPORT_DIR="./exported-data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 开始导出数据..."

# 从容器复制数据
docker cp word-wonderland-backend:/app/data ${EXPORT_DIR}-${TIMESTAMP}

echo "✅ 数据已导出到: ${EXPORT_DIR}-${TIMESTAMP}"
echo ""
echo "📁 导出的文件："
ls -lh ${EXPORT_DIR}-${TIMESTAMP}

# 可选：打包
read -p "是否打包压缩？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    tar -czf ${EXPORT_DIR}-${TIMESTAMP}.tar.gz ${EXPORT_DIR}-${TIMESTAMP}
    echo "📦 已打包: ${EXPORT_DIR}-${TIMESTAMP}.tar.gz"
    rm -rf ${EXPORT_DIR}-${TIMESTAMP}
fi
```

使用方法：
```bash
chmod +x export-data.sh
./export-data.sh
```

### 脚本 2：带备份的导出

创建 `backup-and-export.sh`：

```bash
#!/bin/bash
# 完整备份和导出脚本

BACKUP_DIR="./backups"
EXPORT_DIR="./exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p ${BACKUP_DIR}
mkdir -p ${EXPORT_DIR}

echo "🔄 开始备份和导出数据..."

# 1. 备份到压缩包
echo "📦 正在备份..."
docker run --rm \
  -v words-data:/source \
  -v $(pwd)/${BACKUP_DIR}:/backup \
  alpine tar czf /backup/backup-${TIMESTAMP}.tar.gz -C /source .

# 2. 导出到可读目录
echo "📂 正在导出..."
docker cp word-wonderland-backend:/app/data ${EXPORT_DIR}/data-${TIMESTAMP}

# 3. 显示结果
echo ""
echo "✅ 完成！"
echo ""
echo "📦 备份文件: ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"
echo "   大小: $(du -h ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz | cut -f1)"
echo ""
echo "📂 导出目录: ${EXPORT_DIR}/data-${TIMESTAMP}"
echo "   文件列表:"
ls -lh ${EXPORT_DIR}/data-${TIMESTAMP}

# 4. 清理旧备份（保留最近7天）
echo ""
echo "🧹 清理旧备份（保留最近7天）..."
find ${BACKUP_DIR} -name "backup-*.tar.gz" -mtime +7 -delete
find ${EXPORT_DIR} -name "data-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null

echo ""
echo "✨ 全部完成！"
```

使用方法：
```bash
chmod +x backup-and-export.sh
./backup-and-export.sh
```

### Windows 批处理脚本

创建 `export-data.bat`：

```batch
@echo off
REM Windows 数据导出脚本

set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set EXPORT_DIR=exported-data-%TIMESTAMP%

echo 📦 开始导出数据...

docker cp word-wonderland-backend:/app/data %EXPORT_DIR%

echo.
echo ✅ 数据已导出到: %EXPORT_DIR%
echo.
echo 📁 导出的文件：
dir /b %EXPORT_DIR%

echo.
set /p COMPRESS="是否打包压缩？(y/n): "
if /i "%COMPRESS%"=="y" (
    powershell Compress-Archive -Path %EXPORT_DIR% -DestinationPath %EXPORT_DIR%.zip
    echo 📦 已打包: %EXPORT_DIR%.zip
    rmdir /s /q %EXPORT_DIR%
)

pause
```

---

## 📥 单个文件快速操作

### 查看文件内容

```bash
# 查看 words.json
docker exec word-wonderland-backend cat /app/data/words.json

# 格式化查看（需要 jq）
docker exec word-wonderland-backend cat /app/data/words.json | jq .

# 查看前 20 行
docker exec word-wonderland-backend head -n 20 /app/data/words.json
```

### 导出单个文件

```bash
# 导出 words.json
docker exec word-wonderland-backend cat /app/data/words.json > words.json

# 导出所有 JSON 文件
for file in words phrases sentences patterns topics partsOfSpeech; do
    docker exec word-wonderland-backend cat /app/data/${file}.json > ${file}.json
done

echo "✅ 所有文件已导出"
ls -lh *.json
```

### 查看文件列表和大小

```bash
# 查看所有文件
docker exec word-wonderland-backend ls -lh /app/data/

# 查看总大小
docker exec word-wonderland-backend du -sh /app/data

# 查看每个文件大小
docker exec word-wonderland-backend du -h /app/data/*
```

---

## 🔄 切换到绑定挂载（便于持续访问）

如果需要经常访问数据，建议切换为绑定挂载：

### 步骤 1：导出现有数据

```bash
# 导出当前数据
docker cp word-wonderland-backend:/app/data ./data-local

# 查看导出的数据
ls -lh ./data-local
```

### 步骤 2：修改配置文件

编辑 `docker-compose.github.yml` 或 `docker-compose.yml`：

```yaml
services:
  backend:
    volumes:
      # 注释掉命名卷
      # - words-data:/app/data
      
      # 使用绑定挂载
      - ./data-local:/app/data
```

### 步骤 3：重启服务

```bash
# 停止服务
docker-compose -f docker-compose.github.yml down

# 重新启动
docker-compose -f docker-compose.github.yml up -d

# 验证
docker-compose -f docker-compose.github.yml ps
```

### 步骤 4：验证数据

```bash
# 现在可以直接访问数据
ls -lh ./data-local/

# 查看文件
cat ./data-local/words.json

# 直接编辑文件
nano ./data-local/words.json
```

**优点**：
- ✅ 可以直接在本地访问和编辑文件
- ✅ 无需每次都导出
- ✅ 便于开发和调试

**缺点**：
- ⚠️ 需要注意文件权限问题（Linux）
- ⚠️ 不如命名卷跨平台兼容性好

---

## 📊 数据统计和分析

### 查看数据统计

```bash
# 查看数据文件数量
docker exec word-wonderland-backend sh -c "ls /app/data/*.json | wc -l"

# 查看总数据大小
docker exec word-wonderland-backend du -sh /app/data

# 查看每个文件的行数
docker exec word-wonderland-backend sh -c "for f in /app/data/*.json; do echo \$f; wc -l \$f; done"
```

### 查看 JSON 数据条目数

```bash
# 查看 words.json 中的单词数量（需要 jq）
docker exec word-wonderland-backend cat /app/data/words.json | jq '. | length'

# 导出并查看
docker exec word-wonderland-backend cat /app/data/words.json > words.json
jq '. | length' words.json
```

---

## 🔐 安全注意事项

1. **权限控制**
   ```bash
   # 导出后检查文件权限
   ls -la ./data-export
   
   # 必要时修改权限
   chmod -R 644 ./data-export/*.json
   ```

2. **敏感数据**
   - 导出的数据可能包含敏感信息
   - 建议加密传输和存储
   - 不要将备份文件提交到 Git

3. **定期备份**
   ```bash
   # 设置定时任务（Linux crontab）
   0 2 * * * /path/to/backup-and-export.sh >> /var/log/backup.log 2>&1
   ```

---

## 🆘 常见问题

### Q1: 提示权限被拒绝？

**Linux 服务器**：
```bash
# 使用 sudo
sudo docker cp word-wonderland-backend:/app/data ./data-export

# 修改导出文件权限
sudo chown -R $USER:$USER ./data-export
```

### Q2: 容器未运行？

```bash
# 检查容器状态
docker ps -a | grep word-wonderland-backend

# 启动容器
docker start word-wonderland-backend

# 或使用 docker-compose
docker-compose up -d
```

### Q3: 找不到文件？

```bash
# 进入容器检查
docker exec -it word-wonderland-backend sh
ls -la /app/data/
exit

# 确认挂载点
docker inspect word-wonderland-backend | grep -A 10 Mounts
```

### Q4: 导出的文件是空的？

可能是数据还没有初始化，检查：
```bash
# 查看容器内文件
docker exec word-wonderland-backend ls -lh /app/data/

# 查看容器日志
docker logs word-wonderland-backend
```

---

## 📚 相关文档

- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Docker 部署指南
- [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md) - 快速命令参考

---

## ✨ 总结

**最快方式**：
```bash
docker cp word-wonderland-backend:/app/data ./data-export
```

**最完整方式**：
```bash
./backup-and-export.sh  # 使用提供的脚本
```

**持续访问**：切换为绑定挂载

选择适合你的方式，开始导出数据吧！🚀

