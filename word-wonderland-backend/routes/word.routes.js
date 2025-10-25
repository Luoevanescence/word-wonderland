const express = require('express');
const router = express.Router();
const wordController = require('../controllers/word.controller');

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
router.post('/', wordController.create);

/**
 * @swagger
 * /api/words:
 *   get:
 *     summary: Get all words
 *     tags: [Words]
 *     responses:
 *       200:
 *         description: List of all words
 */
router.get('/', wordController.findAll);

/**
 * @swagger
 * /api/words/random:
 *   get:
 *     summary: Get random words
 *     tags: [Words]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of random words to retrieve
 *     responses:
 *       200:
 *         description: List of random words
 */
router.get('/random', wordController.getRandom);

/**
 * @swagger
 * /api/words/{id}:
 *   get:
 *     summary: Get word by ID
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word details
 *       404:
 *         description: Word not found
 */
router.get('/:id', wordController.findById);

/**
 * @swagger
 * /api/words/{id}:
 *   put:
 *     summary: Update word
 *     tags: [Words]
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
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               definitions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WordDefinition'
 *     responses:
 *       200:
 *         description: Word updated successfully
 *       404:
 *         description: Word not found
 */
router.put('/:id', wordController.update);

/**
 * @swagger
 * /api/words/{id}:
 *   delete:
 *     summary: Delete word
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word deleted successfully
 *       404:
 *         description: Word not found
 */
router.delete('/:id', wordController.delete);

/**
 * @swagger
 * /api/words/bulk/delete:
 *   post:
 *     summary: Bulk delete words
 *     tags: [Words]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Words deleted successfully
 *       400:
 *         description: Invalid input
 */
router.post('/bulk/delete', wordController.bulkDelete);

module.exports = router;

