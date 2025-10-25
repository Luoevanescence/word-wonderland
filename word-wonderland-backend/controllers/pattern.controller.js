const FileService = require('../services/fileService');
const patternService = new FileService('patterns');

// 创建新句型
exports.create = (req, res) => {
  try {
    const { pattern, description, example, translation } = req.body;

    if (!pattern || !description) {
      return res.status(400).json({
        success: false,
        message: 'Pattern and description are required'
      });
    }

    const newPattern = patternService.create({
      pattern,
      description,
      example: example || '',
      translation: translation || ''
    });

    res.status(201).json({
      success: true,
      data: newPattern,
      message: 'Sentence pattern created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating sentence pattern',
      error: error.message
    });
  }
};

// 获取所有句型
exports.findAll = (req, res) => {
  try {
    const patterns = patternService.findAll();
    res.status(200).json({
      success: true,
      data: patterns,
      count: patterns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sentence patterns',
      error: error.message
    });
  }
};

// 根据 ID 获取句型
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const pattern = patternService.findById(id);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Sentence pattern not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pattern
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sentence pattern',
      error: error.message
    });
  }
};

// 更新句型
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { pattern, description, example, translation } = req.body;

    const updates = {};
    if (pattern) updates.pattern = pattern;
    if (description) updates.description = description;
    if (example !== undefined) updates.example = example;
    if (translation !== undefined) updates.translation = translation;

    const updatedPattern = patternService.update(id, updates);

    if (!updatedPattern) {
      return res.status(404).json({
        success: false,
        message: 'Sentence pattern not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPattern,
      message: 'Sentence pattern updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating sentence pattern',
      error: error.message
    });
  }
};

// 删除句型
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = patternService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sentence pattern not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sentence pattern deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sentence pattern',
      error: error.message
    });
  }
};

// 批量删除句型
exports.bulkDelete = (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    const results = {
      deleted: [],
      notFound: []
    };

    ids.forEach(id => {
      const deleted = patternService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.deleted.length} pattern(s)`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting patterns',
      error: error.message
    });
  }
};

// 获取随机句型
exports.getRandom = (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    if (count < 1) {
      return res.status(400).json({
        success: false,
        message: 'Count must be at least 1'
      });
    }

    const randomPatterns = patternService.getRandom(count);

    res.status(200).json({
      success: true,
      data: randomPatterns,
      count: randomPatterns.length,
      requested: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random sentence patterns',
      error: error.message
    });
  }
};

