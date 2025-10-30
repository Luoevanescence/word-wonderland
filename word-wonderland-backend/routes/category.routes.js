const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');

// 需要认证的管理端路由
router.post('/', authMiddleware, controller.create);
router.get('/', authMiddleware, controller.findAll);
router.get('/:id', authMiddleware, controller.findById);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);
router.post('/bulk/delete', authMiddleware, controller.bulkDelete);

module.exports = router;


