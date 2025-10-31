const express = require('express');
const router = express.Router();
const phraseController = require('../controllers/phrase.controller');
const authMiddleware = require('../middleware/auth.middleware');

// 公开路由（不需要认证）

/**
 * @swagger
 * components:
 *   schemas:
 *     Phrase:
 *       type: object
 *       required:
 *         - phrase
 *         - meaning
 *       properties:
 *         id:
 *           type: string
 *         phrase:
 *           type: string
 *         meaning:
 *           type: string
 *         example:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/phrases:
 *   post:
 *     summary: Create a new phrase
 *     tags: [Phrases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Phrase'
 *     responses:
 *       201:
 *         description: Phrase created successfully
 */
// 公开路由（不需要认证）
router.get('/random', phraseController.getRandom);
router.get('/:id', phraseController.findById);

// 需要认证的路由
router.post('/', authMiddleware, phraseController.create);
router.get('/', authMiddleware, phraseController.findAll);
router.put('/:id', authMiddleware, phraseController.update);
router.delete('/:id', authMiddleware, phraseController.delete);
router.post('/bulk/delete', authMiddleware, phraseController.bulkDelete);

module.exports = router;

