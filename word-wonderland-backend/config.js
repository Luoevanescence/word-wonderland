// 加载环境变量
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  dataDirectory: './data',
  apiPrefix: '/api',
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  // 管理员认证配置
  auth: {
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    jwtSecret: process.env.JWT_SECRET || 'word-wonderland-secret-key-2024',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

