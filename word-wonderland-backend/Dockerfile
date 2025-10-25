# 后端服务 Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 复制 lock 文件（如果存在）
COPY pnpm-lock.yaml* ./

# 安装依赖
# 如果有 pnpm-lock.yaml 使用 pnpm，否则使用 npm
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile --prod; \
    else \
      npm ci --only=production || npm install --only=production; \
    fi

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "app.js"]

