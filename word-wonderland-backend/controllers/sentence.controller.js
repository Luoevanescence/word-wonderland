const FileService = require('../services/fileService');
const sentenceService = new FileService('sentences');

// 创建新句子
exports.create = (req, res) => {
  try {
    const { sentence, englishName, translation, note, patternIds, wordIds, phraseIds, categoryId, categoryIds } = req.body;

    if (!sentence || !translation) {
      return res.status(400).json({
        success: false,
        message: 'Sentence and translation are required'
      });
    }

    // 处理分类：优先使用 categoryIds（数组），否则使用 categoryId（单个），向后兼容
    let finalCategoryIds = [];
    if (categoryIds !== undefined) {
      finalCategoryIds = Array.isArray(categoryIds) ? categoryIds.filter(id => id) : [];
    } else if (categoryId !== undefined && categoryId) {
      finalCategoryIds = [categoryId];
    }

    const newSentence = sentenceService.create({ 
      sentence, 
      englishName: englishName || '',
      translation, 
      note: note || '',
      patternIds: Array.isArray(patternIds) ? patternIds : [],
      wordIds: Array.isArray(wordIds) ? wordIds : [],
      phraseIds: Array.isArray(phraseIds) ? phraseIds : [],
      categoryIds: finalCategoryIds
    });

    res.status(201).json({
      success: true,
      data: newSentence,
      message: 'Sentence created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating sentence',
      error: error.message
    });
  }
};

// 获取所有句子
exports.findAll = (req, res) => {
  try {
    const sentences = sentenceService.findAll();
    res.status(200).json({
      success: true,
      data: sentences,
      count: sentences.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sentences',
      error: error.message
    });
  }
};

// 根据 ID 获取句子
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const sentence = sentenceService.findById(id);

    if (!sentence) {
      return res.status(404).json({
        success: false,
        message: 'Sentence not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sentence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sentence',
      error: error.message
    });
  }
};

// 更新句子
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { sentence, englishName, translation, note, patternIds, wordIds, phraseIds, categoryId, categoryIds } = req.body;

    const updates = {};
    if (sentence) updates.sentence = sentence;
    if (translation) updates.translation = translation;
    if (note !== undefined) updates.note = note;
    if (englishName !== undefined) updates.englishName = englishName;
    if (patternIds !== undefined) updates.patternIds = Array.isArray(patternIds) ? patternIds : [];
    if (wordIds !== undefined) updates.wordIds = Array.isArray(wordIds) ? wordIds : [];
    if (phraseIds !== undefined) updates.phraseIds = Array.isArray(phraseIds) ? phraseIds : [];
    
    // 处理分类：优先使用 categoryIds（数组），否则使用 categoryId（单个），向后兼容
    if (categoryIds !== undefined) {
      updates.categoryIds = Array.isArray(categoryIds) ? categoryIds.filter(id => id) : [];
    } else if (categoryId !== undefined) {
      // 如果提供了单个 categoryId，将其转换为数组
      updates.categoryIds = categoryId ? [categoryId] : [];
    }

    const updatedSentence = sentenceService.update(id, updates);

    if (!updatedSentence) {
      return res.status(404).json({
        success: false,
        message: 'Sentence not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSentence,
      message: 'Sentence updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating sentence',
      error: error.message
    });
  }
};

// 删除句子
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = sentenceService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sentence not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sentence deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sentence',
      error: error.message
    });
  }
};

// 批量删除句子
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
      const deleted = sentenceService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.deleted.length} sentence(s)`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sentences',
      error: error.message
    });
  }
};

// 获取随机句子
exports.getRandom = (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    if (count < 1) {
      return res.status(400).json({
        success: false,
        message: 'Count must be at least 1'
      });
    }

    const randomSentences = sentenceService.getRandom(count);

    res.status(200).json({
      success: true,
      data: randomSentences,
      count: randomSentences.length,
      requested: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random sentences',
      error: error.message
    });
  }
};

