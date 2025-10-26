import { useEffect } from 'react';

/**
 * 自定义Hook：监听全局弹窗关闭事件
 * @param {boolean} showModal - 弹窗显示状态
 * @param {function} setShowModal - 设置弹窗显示状态的函数
 * @param {function} resetForm - 重置表单的函数（可选）
 */
const useGlobalModalClose = (showModal, setShowModal, resetForm = null) => {
  useEffect(() => {
    const handleCloseAllModals = () => {
      if (showModal) {
        setShowModal(false);
        // 如果提供了重置表单的函数，则调用它
        if (resetForm && typeof resetForm === 'function') {
          resetForm();
        }
      }
    };

    // 添加事件监听器
    window.addEventListener('closeAllModals', handleCloseAllModals);
    
    // 清理函数：移除事件监听器
    return () => {
      window.removeEventListener('closeAllModals', handleCloseAllModals);
    };
  }, [showModal, setShowModal, resetForm]);
};

export default useGlobalModalClose;
