const FileService = require('../services/fileService');
const wordService = new FileService('words');

// 创建新单词
exports.create = (req, res) => {
  try {
    const { word, category, categoryId, definitions } = req.body;

    if (!word || !definitions || !Array.isArray(definitions) || definitions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Word and definitions (array) are required'
      });
    }

    // 验证定义结构
    for (const def of definitions) {
      if (!def.partOfSpeech || !def.meaning) {
        return res.status(400).json({
          success: false,
          message: 'Each definition must have partOfSpeech and meaning'
        });
      }
    }

    const newWord = wordService.create({ 
      word, 
      category: category || '', // backward compatibility
      categoryId: categoryId || '',
      definitions 
    });

    res.status(201).json({
      success: true,
      data: newWord,
      message: 'Word created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating word',
      error: error.message
    });
  }
};

// 获取所有单词
exports.findAll = (req, res) => {
  try {
    const words = wordService.findAll();
    res.status(200).json({
      success: true,
      data: words,
      count: words.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching words',
      error: error.message
    });
  }
};

// 根据 ID 获取单词
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const word = wordService.findById(id);

    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }

    res.status(200).json({
      success: true,
      data: word
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching word',
      error: error.message
    });
  }
};

// 更新单词
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { word, category, categoryId, definitions } = req.body;

    const updates = {};
    if (word) updates.word = word;
    if (definitions) {
      // 如果提供了定义，则验证定义
      if (!Array.isArray(definitions) || definitions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Definitions must be a non-empty array'
        });
      }
      for (const def of definitions) {
        if (!def.partOfSpeech || !def.meaning) {
          return res.status(400).json({
            success: false,
            message: 'Each definition must have partOfSpeech and meaning'
          });
        }
      }
      updates.definitions = definitions;
    }
    if (category !== undefined) updates.category = category; // backward compatibility
    if (categoryId !== undefined) updates.categoryId = categoryId;

    const updatedWord = wordService.update(id, updates);

    if (!updatedWord) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedWord,
      message: 'Word updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating word',
      error: error.message
    });
  }
};

// 删除单词
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = wordService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Word deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting word',
      error: error.message
    });
  }
};

// 批量删除单词
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
      const deleted = wordService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.deleted.length} word(s)`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting words',
      error: error.message
    });
  }
};

// 获取随机单词
exports.getRandom = (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    if (count < 1) {
      return res.status(400).json({
        success: false,
        message: 'Count must be at least 1'
      });
    }

    const randomWords = wordService.getRandom(count);

    res.status(200).json({
      success: true,
      data: randomWords,
      count: randomWords.length,
      requested: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random words',
      error: error.message
    });
  }
};

