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
import { PLAN_CODES, BILLING_CYCLES } from '../constants/subscription.constants';

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
    loading,
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

  // Find active plan objects from API data
  const freePlan = plans.find((p) => p.planCode === PLAN_CODES.FREE) || {
    planCode: PLAN_CODES.FREE,
    name: 'Gói Miễn Phí',
    price: 0,
    currency: 'VND',
    durationMonths: 0,
  };

  const monthlyPlan = plans.find((p) => p.planCode === PLAN_CODES.PREMIUM_MONTHLY) || {
    planCode: PLAN_CODES.PREMIUM_MONTHLY,
    name: 'Gói Premium Tháng',
    price: 99000,
    currency: 'VND',
    durationMonths: 1,
  };

  const yearlyPlan = plans.find((p) => p.planCode === PLAN_CODES.PREMIUM_YEARLY) || {
    planCode: PLAN_CODES.PREMIUM_YEARLY,
    name: 'Gói Premium Năm',
    price: 990000,
    currency: 'VND',
    durationMonths: 12,
  };

  const currentActivePlan =
    billingCycle === BILLING_CYCLES.YEARLY ? yearlyPlan : monthlyPlan;

  // Calculate dynamic savings percentage
  const yearlySavingsPercentage =
    monthlyPlan.price > 0 && yearlyPlan.price > 0
      ? Math.max(0, Math.round((1 - yearlyPlan.price / (monthlyPlan.price * 12)) * 100))
      : 17;

  // Upgrade or Renew CTA action
  const handleUpgrade = (planCodeToBuy = currentActivePlan.planCode) => {
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
    selectedPlan,
    billingCycle,
    subscription,
    usage,
    paymentHistory,
    isPremium,
    effectivePlanCode,
    yearlySavingsPercentage,
    loading,
    historyLoading,
    error,
    handleBillingCycleChange,
    handleUpgrade,
    handleHistoryPageChange,
    reload: loadSubscriptionData,
  };
};

export default useSubscription;
