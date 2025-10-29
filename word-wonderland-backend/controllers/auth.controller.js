const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 管理员登录
 */
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 验证用户名和密码
    if (username !== config.auth.adminUsername || password !== config.auth.adminPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        username: username,
        role: 'admin'
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        username,
        expiresIn: config.auth.jwtExpiresIn
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 验证 token（可选 - 用于检查登录状态）
 */
exports.verify = (req, res) => {
  // 如果能到达这里，说明 token 已通过中间件验证
  res.json({
    success: true,
    message: 'Token 有效',
    data: {
      username: req.user.username,
      role: req.user.role
    }
  });
};

/**
 * 登出（前端删除 token 即可，这里只是一个占位接口）
 */
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
};

