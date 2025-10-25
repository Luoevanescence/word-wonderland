const express = require('express');
const router = express.Router();
const phraseController = require('../controllers/phrase.controller');

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
router.post('/', phraseController.create);

/**
 * @swagger
 * /api/phrases:
 *   get:
 *     summary: Get all phrases
 *     tags: [Phrases]
 *     responses:
 *       200:
 *         description: List of all phrases
 */
router.get('/', phraseController.findAll);

/**
 * @swagger
 * /api/phrases/random:
 *   get:
 *     summary: Get random phrases
 *     tags: [Phrases]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of random phrases
 */
router.get('/random', phraseController.getRandom);

/**
 * @swagger
 * /api/phrases/{id}:
 *   get:
 *     summary: Get phrase by ID
 *     tags: [Phrases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phrase details
 *       404:
 *         description: Phrase not found
 */
router.get('/:id', phraseController.findById);

/**
 * @swagger
 * /api/phrases/{id}:
 *   put:
 *     summary: Update phrase
 *     tags: [Phrases]
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
 *             $ref: '#/components/schemas/Phrase'
 *     responses:
 *       200:
 *         description: Phrase updated successfully
 */
router.put('/:id', phraseController.update);

/**
 * @swagger
 * /api/phrases/{id}:
 *   delete:
 *     summary: Delete phrase
 *     tags: [Phrases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phrase deleted successfully
 */
router.delete('/:id', phraseController.delete);

// 批量删除短语
router.post('/bulk/delete', phraseController.bulkDelete);

module.exports = router;

