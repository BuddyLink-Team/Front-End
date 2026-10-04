import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openPaywall, closePaywall } from '../redux/subscriptionSlice';
import {
  QUOTA_FEATURES,
  QUOTA_MESSAGES,
  PLAN_CODES,
} from '../constants/subscription.constants';

export const usePaywall = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { subscription, usage, isPremium, isPaywallOpen, paywallReason } = useSelector(
    (state) => state.subscription
  );

  const isUserPremium =
    Boolean(isPremium) ||
    (subscription?.status === 'active' &&
      subscription?.planCode &&
      subscription?.planCode !== PLAN_CODES.FREE &&
      (!subscription?.endDate || new Date(subscription.endDate) > new Date()));

  /**
   * Handle server 403 / QUOTA_EXCEEDED errors cleanly
   * @param {Object} error Backend error response object
   * @returns {boolean} True if error was recognized and handled as a quota error
   */
  const handleQuotaError = (error) => {
    const errorCode = error?.code || error?.error?.code;
    const details = error?.details || error?.error?.details;
    const feature = details?.feature;

    if (errorCode === 'CHILD_QUOTA_EXCEEDED' || feature === QUOTA_FEATURES.CHILD_PROFILES) {
      dispatch(
        openPaywall({
          feature: QUOTA_FEATURES.CHILD_PROFILES,
          ...QUOTA_MESSAGES[QUOTA_FEATURES.CHILD_PROFILES],
        })
      );
      return true;
    }

    if (errorCode === 'QUOTA_EXCEEDED') {
      const quotaConfig =
        QUOTA_MESSAGES[feature] || QUOTA_MESSAGES.general;
      dispatch(
        openPaywall({
          feature: feature || 'general',
          title: quotaConfig.title,
          message: error?.message || quotaConfig.message,
        })
      );
      return true;
    }

    return false;
  };

  /**
   * Check child profile limit on client (1 profile for Free)
   * @param {number} currentChildCount
   */
  const checkChildLimit = (currentChildCount = 0) => {
    if (isUserPremium) return false;
    const quotaData = usage?.child_profiles;
    const limit = quotaData?.limit ?? 1;
    const used = quotaData?.used ?? currentChildCount;
    const remaining = quotaData?.remaining;

    if (limit !== -1 && (currentChildCount >= limit || used >= limit || remaining === 0)) {
      dispatch(
        openPaywall({
          feature: QUOTA_FEATURES.CHILD_PROFILES,
          ...QUOTA_MESSAGES[QUOTA_FEATURES.CHILD_PROFILES],
        })
      );
      return true;
    }
    return false;
  };

  /**
   * Check discovery swipes limit on client (5 swipes/day for Free)
   */
  const checkDiscoveryLimit = () => {
    if (isUserPremium) return false;
    const quotaData = usage?.discovery_swipes;
    const limit = quotaData?.limit ?? 5;
    const used = quotaData?.used ?? 0;
    const remaining = quotaData?.remaining;

    if (limit !== -1 && (used >= limit || remaining === 0)) {
      dispatch(
        openPaywall({
          feature: QUOTA_FEATURES.DISCOVERY_SWIPES,
          ...QUOTA_MESSAGES[QUOTA_FEATURES.DISCOVERY_SWIPES],
        })
      );
      return true;
    }
    return false;
  };

  /**
   * Check playdates created limit on client (3 created/month for Free)
   */
  const checkPlaydateLimit = () => {
    if (isUserPremium) return false;
    const quotaData = usage?.playdates_created;
    const limit = quotaData?.limit ?? 3;
    const used = quotaData?.used ?? 0;
    const remaining = quotaData?.remaining;

    if (limit !== -1 && (used >= limit || remaining === 0)) {
      dispatch(
        openPaywall({
          feature: QUOTA_FEATURES.PLAYDATES_CREATED,
          ...QUOTA_MESSAGES[QUOTA_FEATURES.PLAYDATES_CREATED],
        })
      );
      return true;
    }
    return false;
  };

  /**
   * Navigate to /subscription so user can compare & choose monthly/yearly plan
   */
  const handleUpgradeNow = () => {
    dispatch(closePaywall());
    navigate('/subscription');
  };

  const handleClose = () => {
    dispatch(closePaywall());
  };

  return {
    isPremium: isUserPremium,
    isPaywallOpen,
    paywallReason,
    handleQuotaError,
    checkChildLimit,
    checkDiscoveryLimit,
    checkPlaydateLimit,
    handleUpgradeNow,
    closePaywall: handleClose,
    openPaywall: (customConfig) => dispatch(openPaywall(customConfig)),
  };
};

export default usePaywall;
