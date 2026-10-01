import { useState, useEffect, useCallback } from 'react';
import { subscriptionApi } from '../api/subscriptionApi';

export const useSubscriptionQuota = () => {
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuota = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getMySubscriptionQuota();
      const data = res?.data || res || null;
      setQuotaInfo(data);
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const subscription = quotaInfo?.subscription;
  const quota = quotaInfo?.quota;
  const limits = quota?.limits || {};
  const usage = quota?.usage || {};

  // Child profile quota helpers
  const childLimit = limits.childProfiles ?? 1;
  const isChildUnlimited = childLimit === -1;
  const childProfilesCount = usage.childProfiles ?? 0;
  const isChildLimitReached = !isChildUnlimited && childProfilesCount >= childLimit;

  return {
    quotaInfo,
    subscription,
    quota,
    limits,
    usage,
    childLimit,
    isChildUnlimited,
    isChildLimitReached,
    isLoading,
    error,
    refetchQuota: fetchQuota,
  };
};

export default useSubscriptionQuota;
