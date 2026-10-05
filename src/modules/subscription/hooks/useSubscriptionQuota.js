import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubscriptionQuota } from '../redux/subscriptionSlice';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { SUBSCRIPTION_ERROR_MESSAGES } from '../constants/subscriptionConstants';

/**
 * Current plan and usage quota of the signed-in parent (data lives in the subscription slice).
 */
export const useSubscriptionQuota = () => {
  const dispatch = useDispatch();
  const { subscription, quota, isLoading, error } = useSelector((state) => state.subscription);

  const fetchQuota = useCallback(async () => {
    try {
      return await dispatch(fetchMySubscriptionQuota()).unwrap();
    } catch {
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const limits = quota?.limits || {};
  const usage = quota?.usage || {};

  // Child profile quota helpers
  const childLimit = limits.childProfiles ?? 1;
  const isChildUnlimited = childLimit === -1;
  const childProfilesCount = usage.childProfiles ?? 0;
  const isChildLimitReached = !isChildUnlimited && childProfilesCount >= childLimit;

  const errorMessage = error
    ? getApiErrorMsg(SUBSCRIPTION_ERROR_MESSAGES, error, 'Không thể tải thông tin gói dịch vụ.')
    : null;

  return {
    quotaInfo: quota ? { subscription, quota } : null,
    subscription,
    quota,
    limits,
    usage,
    childLimit,
    isChildUnlimited,
    isChildLimitReached,
    isLoading,
    error: errorMessage,
    refetchQuota: fetchQuota,
  };
};

export default useSubscriptionQuota;
