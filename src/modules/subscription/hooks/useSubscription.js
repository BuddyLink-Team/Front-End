import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchActivePlans,
  fetchMySubscriptionQuota,
  fetchPaymentHistory,
  setBillingCycle,
  setSelectedPlan,
} from '../redux/subscriptionSlice';
import { PLAN_CODES, BILLING_CYCLES, SUBSCRIPTION_ERROR_MESSAGES } from '../constants/subscriptionConstants';
import { getApiErrorMsg } from '../../../utils/errorUtils';

export const useSubscription = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    plans,
    selectedPlan,
    billingCycle,
    subscription,
    usage,
    effectivePlanCode,
    isPremium,
    paymentHistory,
    plansLoading,
    loading: quotaLoading,
    quotaLoaded,
    historyLoading,
    error,
  } = useSelector((state) => state.subscription);

  const { isAuthenticated } = useSelector((state) => state.auth || {});

  // Load plans and my subscription on mount
  const loadSubscriptionData = useCallback(() => {
    dispatch(fetchActivePlans());
    if (isAuthenticated) {
      dispatch(fetchMySubscriptionQuota());
      dispatch(fetchPaymentHistory({ page: 1, limit: 10 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Handle billing cycle change (monthly vs yearly)
  const handleBillingCycleChange = (cycle) => {
    dispatch(setBillingCycle(cycle));
  };

  // Plans come from the database only: nothing is shown until they are loaded
  const findPlan = (planCode) => plans.find((p) => p.planCode === planCode) || null;
  const freePlan = findPlan(PLAN_CODES.FREE);
  const monthlyPlan = findPlan(PLAN_CODES.PREMIUM_MONTHLY);
  const yearlyPlan = findPlan(PLAN_CODES.PREMIUM_YEARLY);
  const plansLoaded = Boolean(freePlan && monthlyPlan && yearlyPlan);

  const currentActivePlan = billingCycle === BILLING_CYCLES.YEARLY ? yearlyPlan : monthlyPlan;

  // Saving of the yearly plan against 12 monthly payments
  const yearlySavingsPercentage =
    monthlyPlan?.price > 0 && yearlyPlan?.price > 0
      ? Math.max(0, Math.round((1 - yearlyPlan.price / (monthlyPlan.price * 12)) * 100))
      : 0;

  // The Premium card shown is the plan in use (renewal), not just any active Premium
  const isCurrentPremiumPlan = Boolean(isPremium && subscription?.planCode === currentActivePlan?.planCode);

  // Upgrade or Renew CTA action
  const handleUpgrade = (planCodeToBuy = currentActivePlan?.planCode) => {
    dispatch(setSelectedPlan(planCodeToBuy));
    navigate(`/checkout?plan=${planCodeToBuy}`);
  };

  // Handle history page change
  const handleHistoryPageChange = (page) => {
    dispatch(fetchPaymentHistory({ page, limit: 10 }));
  };

  return {
    plans,
    freePlan,
    monthlyPlan,
    yearlyPlan,
    currentActivePlan,
    plansLoaded,
    isCurrentPremiumPlan,
    quotaLoaded,
    selectedPlan,
    billingCycle,
    subscription,
    usage,
    paymentHistory,
    isPremium,
    effectivePlanCode,
    yearlySavingsPercentage,
    loading: plansLoading || quotaLoading,
    historyLoading,
    error: error ? getApiErrorMsg(SUBSCRIPTION_ERROR_MESSAGES, error, 'Không thể tải thông tin gói dịch vụ.') : null,
    handleBillingCycleChange,
    handleUpgrade,
    handleHistoryPageChange,
    reload: loadSubscriptionData,
  };
};

export default useSubscription;
