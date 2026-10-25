import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminSubscriptionApi } from '../api/adminSubscriptionApi';

export const useAdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminSubscriptionApi.getPlans();
      const planList = response?.data?.plans || response?.plans || [];
      setPlans(planList);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Không thể tải danh sách gói dịch vụ';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const updatePlan = useCallback(
    async (id, payload) => {
      setIsUpdating(true);
      try {
        const response = await adminSubscriptionApi.updatePlan(id, payload);
        const updated = response?.data?.plan || response?.plan;
        setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
        toast.success('Cập nhật gói dịch vụ thành công!');
        return { success: true, plan: updated };
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Không thể cập nhật gói dịch vụ';
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    plans,
    isLoading,
    error,
    isUpdating,
    refetch: fetchPlans,
    updatePlan,
  };
};

export default useAdminPlans;
