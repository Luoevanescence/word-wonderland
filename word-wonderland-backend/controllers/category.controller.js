const FileService = require('../services/fileService');
const categoryService = new FileService('categories');

// 获取全部分类
exports.findAll = (req, res) => {
  try {
    const categories = categoryService.findAll();
    res.status(200).json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
};

// 获取单个
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const category = categoryService.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
  }
};

// 创建
exports.create = (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const newCategory = categoryService.create({ name, code: code || '', description: description || '' });
    res.status(201).json({ success: true, data: newCategory, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
  }
};

// 更新
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code;
    if (description !== undefined) updates.description = description;
    const updated = categoryService.update(id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: updated, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
  }
};

// 删除
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = categoryService.delete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
  }
};

// 批量删除
exports.bulkDelete = (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }
    const results = { deleted: [], notFound: [] };
    ids.forEach(id => {
      const deleted = categoryService.delete(id);
      if (deleted) results.deleted.push(id); else results.notFound.push(id);
    });
    res.status(200).json({ success: true, message: `Successfully deleted ${results.deleted.length} category(s)`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting categories', error: error.message });
  }
};


