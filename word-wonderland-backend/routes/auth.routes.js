const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 管理员登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 用户名或密码错误
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: 验证 token 是否有效
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token 有效
 *       401:
 *         description: Token 无效或已过期
 */
router.get('/verify', authMiddleware, authController.verify);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 登出
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 */
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

