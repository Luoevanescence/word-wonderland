const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topic.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
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
 * /api/topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Topic'
 *     responses:
 *       201:
 *         description: Topic created successfully
 */
router.post('/', topicController.create);

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: List of all topics
 */
router.get('/', topicController.findAll);

/**
 * @swagger
 * /api/topics/random:
 *   get:
 *     summary: Get random topics
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of random topics
 */
router.get('/random', topicController.getRandom);

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     summary: Get topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic details
 *       404:
 *         description: Topic not found
 */
router.get('/:id', topicController.findById);

/**
 * @swagger
 * /api/topics/{id}:
 *   put:
 *     summary: Update topic
 *     tags: [Topics]
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
 *             $ref: '#/components/schemas/Topic'
 *     responses:
 *       200:
 *         description: Topic updated successfully
 */
router.put('/:id', topicController.update);

/**
 * @swagger
 * /api/topics/{id}:
 *   delete:
 *     summary: Delete topic
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic deleted successfully
 */
router.delete('/:id', topicController.delete);

// 批量删除主题
router.post('/bulk/delete', topicController.bulkDelete);

module.exports = router;

