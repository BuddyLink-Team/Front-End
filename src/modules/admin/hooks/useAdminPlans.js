import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminPlans, updateAdminPlan } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

// Shown under the price of a plan bought for several months: its price per month and the saving
// against paying the 1-month plan each month (null / 0 for the other plans)
const withDerivedPrices = (plans) => {
  const monthlyPrice = plans.find((plan) => plan.durationMonths === 1)?.price || 0;
  return plans.map((plan) => {
    const isMultiMonth = plan.durationMonths > 1;
    const fullPrice = monthlyPrice * plan.durationMonths;
    return {
      ...plan,
      monthlyEquivalent: isMultiMonth ? Math.round(plan.price / plan.durationMonths) : null,
      savingsPercent:
        isMultiMonth && fullPrice > plan.price ? Math.round((1 - plan.price / fullPrice) * 100) : 0,
    };
  });
};

/**
 * Subscription plans tab: every plan (inactive included) and editing one of them.
 */
export const useAdminPlans = () => {
  const dispatch = useDispatch();
  const { success, error: toastError } = useToast();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dispatch(fetchAdminPlans()).unwrap();
      setPlans(withDerivedPrices(data?.plans || []));
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được danh sách gói dịch vụ.'));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** @returns {Promise<boolean>} true when saved */
  const updatePlan = useCallback(
    async (id, payload) => {
      setIsUpdating(true);
      try {
        const { plan } = await dispatch(updateAdminPlan({ id, payload })).unwrap();
        setPlans((prev) => withDerivedPrices(prev.map((item) => (item.id === id ? plan : item))));
        success('Đã cập nhật gói dịch vụ.');
        return true;
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không cập nhật được gói dịch vụ.'));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [dispatch, success, toastError]
  );

  return { plans, isLoading, errorMessage, isUpdating, reload, updatePlan };
};

export default useAdminPlans;
