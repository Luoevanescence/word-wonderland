const FileService = require('../services/fileService');
const partOfSpeechService = new FileService('partsOfSpeech');

// 创建新词性
exports.create = (req, res) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Code and name are required'
      });
    }

    // 检查是否已存在
    const existing = partOfSpeechService.findAll().find(pos => pos.code === code);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '该词性代码已存在'
      });
    }

    const newPartOfSpeech = partOfSpeechService.create({ code, name, description: description || '' });

    res.status(201).json({
      success: true,
      data: newPartOfSpeech,
      message: 'Part of speech created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating part of speech',
      error: error.message
    });
  }
};

// 获取所有词性
exports.findAll = (req, res) => {
  try {
    const partsOfSpeech = partOfSpeechService.findAll();
    res.status(200).json({
      success: true,
      data: partsOfSpeech,
      count: partsOfSpeech.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching parts of speech',
      error: error.message
    });
  }
};

// 根据 ID 获取词性
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const partOfSpeech = partOfSpeechService.findById(id);

    if (!partOfSpeech) {
      return res.status(404).json({
        success: false,
        message: 'Part of speech not found'
      });
    }

    res.status(200).json({
      success: true,
      data: partOfSpeech
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching part of speech',
      error: error.message
    });
  }
};

// 更新词性
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;

    const updates = {};
    if (code) updates.code = code;
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedPartOfSpeech = partOfSpeechService.update(id, updates);

    if (!updatedPartOfSpeech) {
      return res.status(404).json({
        success: false,
        message: 'Part of speech not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPartOfSpeech,
      message: 'Part of speech updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating part of speech',
      error: error.message
    });
  }
};

// 删除词性
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = partOfSpeechService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Part of speech not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Part of speech deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting part of speech',
      error: error.message
    });
  }
};

// 批量删除词性
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
      const deleted = partOfSpeechService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.deleted.length} part(s) of speech`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting parts of speech',
      error: error.message
    });
  }
};

