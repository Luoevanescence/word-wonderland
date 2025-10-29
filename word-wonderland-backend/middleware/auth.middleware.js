const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT 认证中间件
 * 验证请求头中的 token
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，请先登录'
      });
    }

    // Bearer token 格式检查
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误'
      });
    }

    const token = parts[1];

    // 验证 token
    jwt.verify(token, config.auth.jwtSecret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: '登录已过期，请重新登录',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        return res.status(401).json({
          success: false,
          message: '认证令牌无效',
          code: 'TOKEN_INVALID'
        });
      }

      // 将用户信息附加到请求对象
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: '认证验证失败'
    });
  }
};

module.exports = authMiddleware;

