const express = require('express');
const router = express.Router();
const partOfSpeechController = require('../controllers/partOfSpeech.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     PartOfSpeech:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *           description: 词性代码（如 n, v, adj）
 *         name:
 *           type: string
 *           description: 词性名称（如 名词, 动词）
 *         description:
 *           type: string
 *           description: 描述说明
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/parts-of-speech:
 *   post:
 *     summary: 创建新词性
 *     tags: [Parts of Speech]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartOfSpeech'
 *     responses:
 *       201:
 *         description: 词性创建成功
 */
router.post('/', partOfSpeechController.create);

/**
 * @swagger
 * /api/parts-of-speech:
 *   get:
 *     summary: 获取所有词性
 *     tags: [Parts of Speech]
 *     responses:
 *       200:
 *         description: 词性列表
 */
router.get('/', partOfSpeechController.findAll);

/**
 * @swagger
 * /api/parts-of-speech/{id}:
 *   get:
 *     summary: 根据 ID 获取词性
 *     tags: [Parts of Speech]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 词性详情
 *       404:
 *         description: 词性未找到
 */
router.get('/:id', partOfSpeechController.findById);

/**
 * @swagger
 * /api/parts-of-speech/{id}:
 *   put:
 *     summary: 更新词性
 *     tags: [Parts of Speech]
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
 *             $ref: '#/components/schemas/PartOfSpeech'
 *     responses:
 *       200:
 *         description: 词性更新成功
 */
router.put('/:id', partOfSpeechController.update);

/**
 * @swagger
 * /api/parts-of-speech/{id}:
 *   delete:
 *     summary: 删除词性
 *     tags: [Parts of Speech]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 词性删除成功
 */
router.delete('/:id', partOfSpeechController.delete);

// 批量删除词性
router.post('/bulk/delete', partOfSpeechController.bulkDelete);

module.exports = router;

