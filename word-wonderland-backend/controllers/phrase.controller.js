const FileService = require('../services/fileService');
const phraseService = new FileService('phrases');

// 创建新短语
exports.create = (req, res) => {
  try {
    const { phrase, meaning, example } = req.body;

    if (!phrase || !meaning) {
      return res.status(400).json({
        success: false,
        message: 'Phrase and meaning are required'
      });
    }

    const newPhrase = phraseService.create({ phrase, meaning, example: example || '' });

    res.status(201).json({
      success: true,
      data: newPhrase,
      message: 'Phrase created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating phrase',
      error: error.message
    });
  }
};

// 获取所有短语
exports.findAll = (req, res) => {
  try {
    const phrases = phraseService.findAll();
    res.status(200).json({
      success: true,
      data: phrases,
      count: phrases.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching phrases',
      error: error.message
    });
  }
};

// 根据 ID 获取短语
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const phrase = phraseService.findById(id);

    if (!phrase) {
      return res.status(404).json({
        success: false,
        message: 'Phrase not found'
      });
    }

    res.status(200).json({
      success: true,
      data: phrase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching phrase',
      error: error.message
    });
  }
};

// 更新短语
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { phrase, meaning, example } = req.body;

    const updates = {};
    if (phrase) updates.phrase = phrase;
    if (meaning) updates.meaning = meaning;
    if (example !== undefined) updates.example = example;

    const updatedPhrase = phraseService.update(id, updates);

    if (!updatedPhrase) {
      return res.status(404).json({
        success: false,
        message: 'Phrase not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPhrase,
      message: 'Phrase updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating phrase',
      error: error.message
    });
  }
};

// 删除短语
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = phraseService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Phrase not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Phrase deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting phrase',
      error: error.message
    });
  }
};

// 批量删除短语
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
      const deleted = phraseService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.deleted.length} phrase(s)`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting phrases',
      error: error.message
    });
  }
};

// 获取随机短语
exports.getRandom = (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    if (count < 1) {
      return res.status(400).json({
        success: false,
        message: 'Count must be at least 1'
      });
    }

    const randomPhrases = phraseService.getRandom(count);

    res.status(200).json({
      success: true,
      data: randomPhrases,
      count: randomPhrases.length,
      requested: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random phrases',
      error: error.message
    });
  }
};

