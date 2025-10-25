# Word Wonderland 后端 API

一个完整的词汇学习系统后端 API，使用 JSON 文件存储。

## 功能特性

- 📝 **单词管理**：创建、读取、更新、删除单词，支持多个词性的定义
- 🔤 **短语管理**：管理英语短语及其含义和例句
- 📖 **句子管理**：存储和检索英语句子及其翻译
- 🎯 **句型管理**：组织常见的英语句子结构
- 🏷️ **主题管理**：按主题对内容进行分类
- 🎲 **随机选择**：获取随机项目（单词、短语等）用于学习
- 📄 **JSON 存储**：无需数据库 - 所有数据存储在 JSON 文件中
- 📚 **Swagger 文档**：交互式 API 文档

## 安装

```bash
# 安装依赖
npm install

# 或使用 pnpm
pnpm install
```

## 使用方法

```bash
# 开发模式（自动重载）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3000` 上启动

## API 文档

访问交互式 Swagger 文档：`http://localhost:3000/api-docs`

## API 接口

### 单词
- `POST /api/words` - 创建新单词
- `GET /api/words` - 获取所有单词
- `GET /api/words/random?count=10` - 获取随机单词
- `GET /api/words/:id` - 根据 ID 获取单词
- `PUT /api/words/:id` - 更新单词
- `DELETE /api/words/:id` - 删除单词

### 短语
- `POST /api/phrases` - 创建新短语
- `GET /api/phrases` - 获取所有短语
- `GET /api/phrases/random?count=10` - 获取随机短语
- `GET /api/phrases/:id` - 根据 ID 获取短语
- `PUT /api/phrases/:id` - 更新短语
- `DELETE /api/phrases/:id` - 删除短语

### 句子
- `POST /api/sentences` - 创建新句子
- `GET /api/sentences` - 获取所有句子
- `GET /api/sentences/random?count=10` - 获取随机句子
- `GET /api/sentences/:id` - 根据 ID 获取句子
- `PUT /api/sentences/:id` - 更新句子
- `DELETE /api/sentences/:id` - 删除句子

### 句型
- `POST /api/patterns` - 创建新句型
- `GET /api/patterns` - 获取所有句型
- `GET /api/patterns/random?count=10` - 获取随机句型
- `GET /api/patterns/:id` - 根据 ID 获取句型
- `PUT /api/patterns/:id` - 更新句型
- `DELETE /api/patterns/:id` - 删除句型

### 主题
- `POST /api/topics` - 创建新主题
- `GET /api/topics` - 获取所有主题
- `GET /api/topics/random?count=10` - 获取随机主题
- `GET /api/topics/:id` - 根据 ID 获取主题
- `PUT /api/topics/:id` - 更新主题
- `DELETE /api/topics/:id` - 删除主题

## 示例请求

### 创建一个具有多个定义的单词

```bash
POST /api/words
Content-Type: application/json

{
  "word": "run",
  "definitions": [
    {
      "partOfSpeech": "v",
      "meaning": "跑步；运行"
    },
    {
      "partOfSpeech": "n",
      "meaning": "跑步；运转"
    }
  ]
}
```

### 创建短语

```bash
POST /api/phrases
Content-Type: application/json

{
  "phrase": "break the ice",
  "meaning": "打破僵局",
  "example": "He told a joke to break the ice at the meeting."
}
```

### 获取随机单词

```bash
GET /api/words/random?count=5
```

## 数据存储

所有数据都存储在 `data/` 目录下的 JSON 文件中：
- `data/words.json`
- `data/phrases.json`
- `data/sentences.json`
- `data/patterns.json`
- `data/topics.json`

## 配置

编辑 `config.js` 自定义：
- 服务器端口
- 数据目录位置
- CORS 设置
- API 前缀

## 项目结构

```
word-wonderland-backend/
├── controllers/       # 请求处理器
├── routes/           # API 路由
├── services/         # 业务逻辑（FileService）
├── data/            # JSON 数据存储
├── app.js           # 主应用文件
├── config.js        # 配置文件
├── swagger.js       # Swagger 文档配置
└── package.json     # 依赖项
```

## 许可证

MIT

