import { useState, useMemo } from 'react';

export const usePagination = (data, initialPageSize = 5) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 分页计算
  const paginationData = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = data.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentData,
      currentPage,
      pageSize
    };
  }, [data, currentPage, pageSize]);

  // 分页控制
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1); // 重置到第一页
  };

  // 渲染分页按钮
  const renderPagination = () => {
    const { totalPages, totalItems, startIndex, endIndex } = paginationData;
    
    // 始终显示分页器，即使数据少于一页

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          显示 {startIndex + 1} - {Math.min(endIndex, totalItems)} 条，共 {totalItems} 条
        </div>
        <div className="pagination-controls">
          <div className="page-size-selector">
            <label>每页显示：</label>
            <select value={pageSize} onChange={(e) => handlePageSizeChange(e.target.value)}>
              <option value="5">5 条</option>
              <option value="10">10 条</option>
              <option value="20">20 条</option>
              <option value="50">50 条</option>
              <option value="100">100 条</option>
            </select>
          </div>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              首页
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            {startPage > 1 && (
              <>
                <button className="pagination-btn" onClick={() => handlePageChange(1)}>
                  1
                </button>
                {startPage > 2 && <span style={{ padding: '0 5px' }}>...</span>}
              </>
            )}
            {pages.map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span style={{ padding: '0 5px' }}>...</span>}
                <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              末页
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    ...paginationData,
    handlePageChange,
    handlePageSizeChange,
    renderPagination
  };
};

