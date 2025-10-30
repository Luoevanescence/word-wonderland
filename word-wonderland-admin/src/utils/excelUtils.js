import * as XLSX from 'xlsx';

/**
 * 导出数据为 Excel 文件
 * @param {Array} data - 要导出的数据数组
 * @param {String} filename - 文件名（不含扩展名）
 * @param {Array} headers - 表头配置 [{ key: 'field', label: '显示名称' }]
 */
export const exportToExcel = (data, filename, headers) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return false;
  }

  try {
    // 转换数据格式，使用自定义表头
    const excelData = data.map(item => {
      const row = {};
      headers.forEach(header => {
        if (header.key.includes('.')) {
          // 支持嵌套属性，如 'definitions.0.meaning'
          const keys = header.key.split('.');
          let value = item;
          for (const key of keys) {
            value = value?.[key];
          }
          row[header.label] = value || '';
        } else if (header.transform) {
          // 支持自定义转换函数
          row[header.label] = header.transform(item[header.key], item);
        } else {
          row[header.label] = item[header.key] || '';
        }
      });
      return row;
    });

    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 设置列宽
    const colWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;

    // 导出文件
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Export to Excel failed:', error);
    return false;
  }
};

/**
 * 从 Excel 文件读取数据
 * @param {File} file - Excel 文件对象
 * @param {Array} fieldMapping - 字段映射 [{ excelKey: 'Excel列名', dataKey: 'data字段名', required: true }]
 * @returns {Promise<Array>} - 返回解析后的数据数组
 */
export const importFromExcel = (file, fieldMapping) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 读取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          reject(new Error('Excel 文件为空'));
          return;
        }

        // 数据转换和验证
        const transformedData = [];
        const errors = [];

        jsonData.forEach((row, index) => {
          const newRow = {};
          let hasError = false;

          fieldMapping.forEach(field => {
            const excelValue = row[field.excelKey];

            // 必填字段验证
            if (field.required && (excelValue === undefined || excelValue === '')) {
              errors.push(`第 ${index + 2} 行：缺少必填字段 "${field.excelKey}"`);
              hasError = true;
              return;
            }

            // 应用自定义转换函数
            if (field.transform) {
              try {
                newRow[field.dataKey] = field.transform(excelValue, row);
              } catch (err) {
                errors.push(`第 ${index + 2} 行：字段 "${field.excelKey}" 转换失败 - ${err.message}`);
                hasError = true;
              }
            } else {
              newRow[field.dataKey] = excelValue;
            }
          });

          if (!hasError) {
            transformedData.push(newRow);
          }
        });

        if (errors.length > 0) {
          reject(new Error(errors.join('\n')));
          return;
        }

        resolve(transformedData);
      } catch (error) {
        reject(new Error(`读取 Excel 文件失败: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * 下载 Excel 模板
 * @param {String} filename - 文件名
 * @param {Array} headers - 表头
 * @param {Array} sampleData - 示例数据（可选）
 */
export const downloadExcelTemplate = (filename, headers, sampleData = []) => {
  try {
    // 创建表头行
    const headerRow = {};
    headers.forEach(header => {
      headerRow[header.label] = header.example || '';
    });

    // 如果有示例数据，使用示例数据，否则使用空模板
    const templateData = sampleData.length > 0 ? sampleData : [headerRow];

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '模板');

    // 设置列宽
    const colWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;

    // 导出文件
    XLSX.writeFile(workbook, `${filename}_模板.xlsx`);
    return true;
  } catch (error) {
    console.error('Download template failed:', error);
    return false;
  }
};

/**
 * 验证 Excel 文件格式
 * @param {File} file - 文件对象
 * @returns {Boolean} - 是否为有效的 Excel 文件
 */
export const validateExcelFile = (file) => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];

  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
    return false;
  }

  // 文件大小限制 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return false;
  }

  return true;
};

/**
 * 导出选中的数据为 Excel 文件
 * @param {Array} allData - 所有数据数组
 * @param {Array} selectedIds - 选中的 ID 数组
 * @param {String} filename - 文件名（不含扩展名）
 * @param {Array} headers - 表头配置
 */
export const exportSelectedToExcel = (allData, selectedIds, filename, headers) => {
  if (!selectedIds || selectedIds.length === 0) {
    console.error('No selected data to export');
    return false;
  }

  // 筛选选中的数据
  const selectedData = allData.filter(item => selectedIds.includes(item.id));
  
  if (selectedData.length === 0) {
    console.error('No matching data found');
    return false;
  }

  return exportToExcel(selectedData, `${filename}_选中${selectedData.length}项`, headers);
};

