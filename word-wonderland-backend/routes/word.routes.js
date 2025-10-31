const express = require('express');
const router = express.Router();
const wordController = require('../controllers/word.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     WordDefinition:
 *       type: object
 *       required:
 *         - partOfSpeech
 *         - meaning
 *       properties:
 *         partOfSpeech:
 *           type: string
 *           description: Part of speech (e.g., n, v, adj, adv)
 *         meaning:
 *           type: string
 *           description: Chinese meaning
 *     Word:
 *       type: object
 *       required:
 *         - word
 *         - definitions
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID
 *         word:
 *           type: string
 *           description: English word
 *         definitions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WordDefinition'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/words:
 *   post:
 *     summary: Create a new word
 *     tags: [Words]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               definitions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WordDefinition'
 *     responses:
 *       201:
 *         description: Word created successfully
 *       400:
 *         description: Invalid input
 */
// 公开路由（不需要认证）
router.get('/random', wordController.getRandom);
router.get('/:id', wordController.findById);

// 需要认证的路由
router.post('/', authMiddleware, wordController.create);
router.get('/', authMiddleware, wordController.findAll);
router.put('/:id', authMiddleware, wordController.update);
router.delete('/:id', authMiddleware, wordController.delete);
router.post('/bulk/delete', authMiddleware, wordController.bulkDelete);

module.exports = router;

