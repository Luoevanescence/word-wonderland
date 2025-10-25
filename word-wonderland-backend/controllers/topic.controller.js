const FileService = require('../services/fileService');
const topicService = new FileService('topics');

// 创建新主题
exports.create = (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Topic name is required'
      });
    }

    const newTopic = topicService.create({
      name,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: newTopic,
      message: 'Topic created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating topic',
      error: error.message
    });
  }
};

// 获取所有主题
exports.findAll = (req, res) => {
  try {
    const topics = topicService.findAll();
    res.status(200).json({
      success: true,
      data: topics,
      count: topics.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
};

// 根据 ID 获取主题
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    const topic = topicService.findById(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topic',
      error: error.message
    });
  }
};

// 更新主题
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedTopic = topicService.update(id, updates);

    if (!updatedTopic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTopic,
      message: 'Topic updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating topic',
      error: error.message
    });
  }
};

// 删除主题
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = topicService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting topic',
      error: error.message
    });
  }
};

// 批量删除主题
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
      const deleted = topicService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.deleted.length} topic(s)`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting topics',
      error: error.message
    });
  }
};

// 获取随机主题
exports.getRandom = (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    if (count < 1) {
      return res.status(400).json({
        success: false,
        message: 'Count must be at least 1'
      });
    }

    const randomTopics = topicService.getRandom(count);

    res.status(200).json({
      success: true,
      data: randomTopics,
      count: randomTopics.length,
      requested: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random topics',
      error: error.message
    });
  }
};

