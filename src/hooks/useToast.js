import { useMemo } from 'react';
import toast from 'react-hot-toast';

// Stable helpers (module-level) so callers can safely list the returned object in hook dependencies
const toastApi = Object.freeze({
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id) => toast.dismiss(id),
  toast,
});

export function useToast() {
  return useMemo(() => toastApi, []);
}
