import { useState, useEffect, useCallback } from 'react';
import { subscriptionApi } from '../api/subscriptionApi';
import { PLAN_CODES } from '../constants/subscription.constants';

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
  const usage = quotaInfo?.usage || {};
  const isPremium = Boolean(quotaInfo?.isPremium) || (subscription?.status === 'active' && subscription?.planCode !== PLAN_CODES.FREE);
  const effectivePlanCode = quotaInfo?.effectivePlanCode || subscription?.planCode || PLAN_CODES.FREE;

  // Child profile quota mapped from usage.child_profiles
  const childQuota = usage.child_profiles || {};
  const childLimit = isPremium ? -1 : (childQuota.limit ?? 1);
  const isChildUnlimited = isPremium || childLimit === -1;
  const childProfilesCount = childQuota.used ?? 0;
  const isChildLimitReached = !isChildUnlimited && (childProfilesCount >= childLimit || childQuota.remaining === 0);

  // Discovery and Playdate quotas mapped from usage
  const discoveryQuota = usage.discovery_swipes || {};
  const playdateQuota = usage.playdates_created || {};

  return {
    quotaInfo,
    subscription,
    usage,
    isPremium,
    effectivePlanCode,
    // Child helpers
    childLimit,
    childProfilesCount,
    isChildUnlimited,
    isChildLimitReached,
    childRemaining: childQuota.remaining,
    // Additional quota helpers
    discoveryQuota,
    playdateQuota,
    isLoading,
    error,
    refetchQuota: fetchQuota,
  };
};

export default useSubscriptionQuota;
