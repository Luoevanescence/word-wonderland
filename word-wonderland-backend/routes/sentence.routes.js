const express = require('express');
const router = express.Router();
const sentenceController = require('../controllers/sentence.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sentence:
 *       type: object
 *       required:
 *         - sentence
 *         - translation
 *       properties:
 *         id:
 *           type: string
 *         sentence:
 *           type: string
 *         translation:
 *           type: string
 *         note:
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
 * /api/sentences:
 *   post:
 *     summary: Create a new sentence
 *     tags: [Sentences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sentence'
 *     responses:
 *       201:
 *         description: Sentence created successfully
 */
router.post('/', sentenceController.create);

/**
 * @swagger
 * /api/sentences:
 *   get:
 *     summary: Get all sentences
 *     tags: [Sentences]
 *     responses:
 *       200:
 *         description: List of all sentences
 */
router.get('/', sentenceController.findAll);

/**
 * @swagger
 * /api/sentences/random:
 *   get:
 *     summary: Get random sentences
 *     tags: [Sentences]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of random sentences
 */
router.get('/random', sentenceController.getRandom);

/**
 * @swagger
 * /api/sentences/{id}:
 *   get:
 *     summary: Get sentence by ID
 *     tags: [Sentences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sentence details
 *       404:
 *         description: Sentence not found
 */
router.get('/:id', sentenceController.findById);

/**
 * @swagger
 * /api/sentences/{id}:
 *   put:
 *     summary: Update sentence
 *     tags: [Sentences]
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
 *             $ref: '#/components/schemas/Sentence'
 *     responses:
 *       200:
 *         description: Sentence updated successfully
 */
router.put('/:id', sentenceController.update);

/**
 * @swagger
 * /api/sentences/{id}:
 *   delete:
 *     summary: Delete sentence
 *     tags: [Sentences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sentence deleted successfully
 */
router.delete('/:id', sentenceController.delete);

// 批量删除句子
router.post('/bulk/delete', sentenceController.bulkDelete);

module.exports = router;

