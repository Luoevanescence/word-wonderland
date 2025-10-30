const FileService = require('../services/fileService');
const componentService = new FileService('components');

// 获取所有成分
const getAllComponents = (req, res) => {
  try {
    const components = componentService.findAll();
    res.json({
      success: true,
      data: components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取成分失败',
      error: error.message
    });
  }
};

// 获取单个成分
const getComponentById = (req, res) => {
  try {
    const component = componentService.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: '成分不存在'
      });
    }
    
    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取成分失败',
      error: error.message
    });
  }
};

// 创建成分
const createComponent = (req, res) => {
  try {
    const { name, englishName, description, example } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '成分名称不能为空'
      });
    }
    
    const newComponent = componentService.create({
      name,
      englishName: englishName || '',
      description: description || '',
      example: example || ''
    });
    
    res.status(201).json({
      success: true,
      message: '成分创建成功',
      data: newComponent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建成分失败',
      error: error.message
    });
  }
};

// 更新成分
const updateComponent = (req, res) => {
  try {
    const { name, englishName, description, example } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '成分名称不能为空'
      });
    }
    
    const updatedComponent = componentService.update(req.params.id, {
      name,
      englishName: englishName || '',
      description: description || '',
      example: example || ''
    });
    
    if (!updatedComponent) {
      return res.status(404).json({
        success: false,
        message: '成分不存在'
      });
    }
    
    res.json({
      success: true,
      message: '成分更新成功',
      data: updatedComponent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新成分失败',
      error: error.message
    });
  }
};

// 删除成分
const deleteComponent = (req, res) => {
  try {
    const deleted = componentService.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '成分不存在'
      });
    }
    
    res.json({
      success: true,
      message: '成分删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除成分失败',
      error: error.message
    });
  }
};

// 批量删除成分
const bulkDeleteComponents = (req, res) => {
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
      const deleted = componentService.delete(id);
      if (deleted) {
        results.deleted.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    res.status(200).json({
      success: true,
      message: `成功删除 ${results.deleted.length} 个成分`,
      data: {
        deletedCount: results.deleted.length,
        deletedIds: results.deleted,
        notFoundIds: results.notFound
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk deleting components',
      error: error.message
    });
  }
};

module.exports = {
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
  bulkDeleteComponents
};

