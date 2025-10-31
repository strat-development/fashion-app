import { useToast as useToastContext } from '@/providers/toastContext';

export const useToast = () => {
  const { showToast: showToastInternal } = useToastContext();

  const showError = (message: string, duration?: number) => {
    showToastInternal(message, 'error', duration);
  };

  const showSuccess = (message: string, duration?: number) => {
    showToastInternal(message, 'success', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showToastInternal(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showToastInternal(message, 'info', duration);
  };

  return {
    showToast: showToastInternal,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};

