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
    const { name, description, example } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '成分名称不能为空'
      });
    }
    
    const newComponent = componentService.create({
      name,
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
    const { name, description, example } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '成分名称不能为空'
      });
    }
    
    const updatedComponent = componentService.update(req.params.id, {
      name,
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

module.exports = {
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent
};

