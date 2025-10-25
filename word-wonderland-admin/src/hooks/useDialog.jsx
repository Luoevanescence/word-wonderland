import { useState } from 'react';

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {},
  });

  const showConfirm = ({ title, message, type = 'confirm', onConfirm }) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        onConfirm();
        closeDialog();
      },
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    dialogState,
    showConfirm,
    closeDialog,
  };
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
};

