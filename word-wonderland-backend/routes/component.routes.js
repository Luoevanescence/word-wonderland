const express = require('express');
const router = express.Router();
const componentController = require('../controllers/component.controller');

router.get('/', componentController.getAllComponents);
router.get('/:id', componentController.getComponentById);
router.post('/', componentController.createComponent);
router.put('/:id', componentController.updateComponent);
router.delete('/:id', componentController.deleteComponent);

module.exports = router;

