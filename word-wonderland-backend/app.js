const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const config = require('./config');

const app = express();

// 中间件
app.use(cors(config.corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 中间件
const authMiddleware = require('./middleware/auth.middleware');

// 路由
const authRoutes = require('./routes/auth.routes');
const wordRoutes = require('./routes/word.routes');
const phraseRoutes = require('./routes/phrase.routes');
const sentenceRoutes = require('./routes/sentence.routes');
const patternRoutes = require('./routes/pattern.routes');
const topicRoutes = require('./routes/topic.routes');
const partOfSpeechRoutes = require('./routes/partOfSpeech.routes');
const componentRoutes = require('./routes/component.routes');
const categoryRoutes = require('./routes/category.routes');

// 认证路由（公开）
app.use(`${config.apiPrefix}/auth`, authRoutes);

// API 路由（需要认证 - 管理端操作）
// 注意：GET /random 路由是公开的，已在路由文件中单独处理
app.use(`${config.apiPrefix}/words`, wordRoutes);
app.use(`${config.apiPrefix}/phrases`, phraseRoutes);
app.use(`${config.apiPrefix}/sentences`, sentenceRoutes);
app.use(`${config.apiPrefix}/patterns`, patternRoutes);
app.use(`${config.apiPrefix}/topics`, topicRoutes);
app.use(`${config.apiPrefix}/parts-of-speech`, partOfSpeechRoutes);
app.use(`${config.apiPrefix}/components`, componentRoutes);
app.use(`${config.apiPrefix}/categories`, categoryRoutes);

// Swagger 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Word Wonderland API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: `${config.apiPrefix}/auth`,
      words: `${config.apiPrefix}/words`,
      phrases: `${config.apiPrefix}/phrases`,
      sentences: `${config.apiPrefix}/sentences`,
      patterns: `${config.apiPrefix}/patterns`,
      topics: `${config.apiPrefix}/topics`,
      partsOfSpeech: `${config.apiPrefix}/parts-of-speech`,
      components: `${config.apiPrefix}/components`,
      categories: `${config.apiPrefix}/categories`
    }
  });
});

// 404 处理器
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// 错误处理器
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 启动服务器
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Word Wonderland API is running on port ${config.port}`);
  console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
  console.log(`🌐 Server: http://localhost:${config.port}`);
  console.log(`📱 Network access enabled - use your IP address to access from other devices`);
});

module.exports = app;

