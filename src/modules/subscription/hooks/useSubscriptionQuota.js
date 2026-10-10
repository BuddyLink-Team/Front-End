import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubscriptionQuota } from '../redux/subscriptionSlice';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PLAN_CODES, QUOTA_FEATURES, SUBSCRIPTION_ERROR_MESSAGES } from '../constants/subscriptionConstants';

/**
 * Current plan and usage quota of the signed-in parent (data lives in the subscription slice).
 * Usage comes from GET /subscriptions/my: { isPremium, effectivePlanCode, subscription, usage }
 * where usage[feature] = { limit, used, remaining, periodType, resetAt } (-1 = unlimited).
 */
export const useSubscriptionQuota = () => {
  const dispatch = useDispatch();
  const {
    subscription,
    usage: storedUsage,
    isPremium: isPremiumFlag,
    effectivePlanCode: storedPlanCode,
    loading: isLoading,
    error,
  } = useSelector((state) => state.subscription);

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

  const usage = storedUsage || {};
  const isPremium =
    Boolean(isPremiumFlag) || (subscription?.status === 'active' && subscription?.planCode !== PLAN_CODES.FREE);
  const effectivePlanCode = storedPlanCode || subscription?.planCode || PLAN_CODES.FREE;

  // Child profile quota mapped from usage.child_profiles
  const childQuota = usage[QUOTA_FEATURES.CHILD_PROFILES] || {};
  const childLimit = isPremium ? -1 : (childQuota.limit ?? 1);
  const isChildUnlimited = isPremium || childLimit === -1;
  const childProfilesCount = childQuota.used ?? 0;
  const isChildLimitReached = !isChildUnlimited && (childProfilesCount >= childLimit || childQuota.remaining === 0);

  // Discovery and Playdate quotas mapped from usage
  const discoveryQuota = usage[QUOTA_FEATURES.DISCOVERY_SWIPES] || {};
  const playdateQuota = usage[QUOTA_FEATURES.PLAYDATES_CREATED] || {};

  // Flat limits (-1 = unlimited), undefined until the quota is loaded
  const limits = {
    childProfiles: storedUsage ? childLimit : undefined,
    discoveryViewsPerDay: isPremium ? -1 : discoveryQuota.limit,
    playdatesCreatedPerMonth: isPremium ? -1 : playdateQuota.limit,
  };

  const errorMessage = error
    ? getApiErrorMsg(SUBSCRIPTION_ERROR_MESSAGES, error, 'Không thể tải thông tin gói dịch vụ.')
    : null;

  return {
    quotaInfo: storedUsage ? { subscription, usage, isPremium, effectivePlanCode } : null,
    subscription,
    usage,
    limits,
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
    error: errorMessage,
    refetchQuota: fetchQuota,
  };
};

export default useSubscriptionQuota;
