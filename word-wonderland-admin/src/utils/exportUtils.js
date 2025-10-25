/**
 * 导出工具函数
 * 用于将数据导出为 JSON 文件
 */

/**
 * 下载 JSON 文件
 * @param {any} data - 要导出的数据
 * @param {string} filename - 文件名（不含扩展名）
 */
export const downloadJSON = (data, filename) => {
  try {
    // 转换为 JSON 字符串，格式化输出（缩进2空格）
    const jsonString = JSON.stringify(data, null, 2);
    
    // 创建 Blob 对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 添加时间戳到文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `${filename}_${timestamp}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('导出 JSON 失败:', error);
    return false;
  }
};

/**
 * 导出所有数据（包含统计信息）
 * @param {any} data - 要导出的数据
 * @param {string} dataType - 数据类型（words, phrases等）
 */
export const downloadJSONWithMeta = (data, dataType) => {
  const exportData = {
    exportTime: new Date().toISOString(),
    dataType: dataType,
    total: Array.isArray(data) ? data.length : 0,
    data: data
  };
  
  return downloadJSON(exportData, dataType);
};

/**
 * 导出选中的数据
 * @param {Array} allData - 所有数据
 * @param {Array} selectedIds - 选中的ID数组
 * @param {string} filename - 文件名
 */
export const downloadSelectedJSON = (allData, selectedIds, filename) => {
  const selectedData = allData.filter(item => selectedIds.includes(item.id));
  return downloadJSON(selectedData, `${filename}_selected`);
};

