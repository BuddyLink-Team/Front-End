import toast from 'react-hot-toast';

export function useToast() {
  const showSuccess = (msg) => toast.success(msg);
  const showError = (msg) => toast.error(msg);
  const showLoading = (msg) => toast.loading(msg);
  const dismiss = (id) => toast.dismiss(id);

  return {
    success: showSuccess,
    error: showError,
    loading: showLoading,
    dismiss,
    toast,
  };
}
