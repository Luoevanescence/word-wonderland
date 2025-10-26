/**
 * 表格列宽拖拽调整工具
 * 用法：在页面组件中调用 initTableResize()
 */

export const initTableResize = () => {
  const tables = document.querySelectorAll('.data-table table');
  
  tables.forEach(table => {
    const headers = table.querySelectorAll('th');
    
    headers.forEach((header, index) => {
      // 跳过最后一列和复选框列
      if (index === headers.length - 1 || header.classList.contains('checkbox-cell')) {
        return;
      }

      // 创建拖拽手柄
      const resizer = document.createElement('div');
      resizer.className = 'table-resizer';
      header.style.position = 'relative';
      header.appendChild(resizer);

      let startX, startWidth;

      const initResize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startX = e.pageX;
        startWidth = header.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        resizer.classList.add('resizing');
      };

      const resize = (e) => {
        const width = startWidth + (e.pageX - startX);
        if (width > 50) { // 最小宽度 50px
          header.style.width = width + 'px';
        }
      };

      const stopResize = () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        resizer.classList.remove('resizing');
      };

      resizer.addEventListener('mousedown', initResize);
    });
  });
};

// 清理函数
export const cleanupTableResize = () => {
  const resizers = document.querySelectorAll('.table-resizer');
  resizers.forEach(resizer => resizer.remove());
};

