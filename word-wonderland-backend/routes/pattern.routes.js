const express = require('express');
const router = express.Router();
const patternController = require('../controllers/pattern.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     SentencePattern:
 *       type: object
 *       required:
 *         - pattern
 *         - description
 *       properties:
 *         id:
 *           type: string
 *         pattern:
 *           type: string
 *         description:
 *           type: string
 *         example:
 *           type: string
 *         translation:
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
 * /api/patterns:
 *   post:
 *     summary: Create a new sentence pattern
 *     tags: [Sentence Patterns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SentencePattern'
 *     responses:
 *       201:
 *         description: Sentence pattern created successfully
 */
router.post('/', patternController.create);

/**
 * @swagger
 * /api/patterns:
 *   get:
 *     summary: Get all sentence patterns
 *     tags: [Sentence Patterns]
 *     responses:
 *       200:
 *         description: List of all sentence patterns
 */
router.get('/', patternController.findAll);

/**
 * @swagger
 * /api/patterns/random:
 *   get:
 *     summary: Get random sentence patterns
 *     tags: [Sentence Patterns]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of random sentence patterns
 */
router.get('/random', patternController.getRandom);

/**
 * @swagger
 * /api/patterns/{id}:
 *   get:
 *     summary: Get sentence pattern by ID
 *     tags: [Sentence Patterns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sentence pattern details
 *       404:
 *         description: Sentence pattern not found
 */
router.get('/:id', patternController.findById);

/**
 * @swagger
 * /api/patterns/{id}:
 *   put:
 *     summary: Update sentence pattern
 *     tags: [Sentence Patterns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SentencePattern'
 *     responses:
 *       200:
 *         description: Sentence pattern updated successfully
 */
router.put('/:id', patternController.update);

/**
 * @swagger
 * /api/patterns/{id}:
 *   delete:
 *     summary: Delete sentence pattern
 *     tags: [Sentence Patterns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sentence pattern deleted successfully
 */
router.delete('/:id', patternController.delete);

// 批量删除句型
router.post('/bulk/delete', patternController.bulkDelete);

module.exports = router;

