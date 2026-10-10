import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchMySubscriptionQuota,
  fetchPaymentHistory,
  fetchActivePlans,
  createCheckoutSession,
  verifyPayment,
  clearCurrentOrder,
} from '../redux/subscriptionSlice';
import { PLAN_CODES, PAYMENT_STATUS, SUBSCRIPTION_ERROR_MESSAGES } from '../constants/subscriptionConstants';
import { getCheckoutKey, regenerateCheckoutKey, clearCheckoutKey } from '../utils/checkoutKeys';
import { getApiErrorMsg } from '../../../utils/errorUtils';

const CHECKOUT_ERROR_FALLBACK = 'Không thể khởi tạo đơn thanh toán. Vui lòng thử lại.';
const PURCHASABLE_PLANS = [PLAN_CODES.PREMIUM_MONTHLY, PLAN_CODES.PREMIUM_YEARLY];
const POLL_INTERVAL_MS = 3500;

// Format seconds into MM:SS
const formatCountdown = (secs) => {
  if (secs == null) return '--:--';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const useCheckout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const {
    plans,
    subscription,
    currentOrder: orderData,
    checkoutLoading,
    verifyLoading,
  } = useSelector((state) => state.subscription);

  const orderCodeFromUrl = searchParams.get('orderCode');
  const planCodeFromUrl = searchParams.get('plan') || PLAN_CODES.PREMIUM_MONTHLY;
  const orderPlanCode = orderData?.planSnapshot?.planCode || orderData?.planCode || planCodeFromUrl;

  const [error, setError] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Guard refs
  const isPollingRef = useRef(false);
  const isCreatingRef = useRef(false);
  const lastVerifiedCodeRef = useRef(null);
  const pollTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Load plans if empty
  useEffect(() => {
    if (!plans || plans.length === 0) {
      dispatch(fetchActivePlans());
    }
  }, [dispatch, plans]);

  // Verify the order; on success refresh the plan and the payment history
  const checkOrderStatus = useCallback(
    async (codeToVerify, isManual = false) => {
      if (!codeToVerify || isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const data = await dispatch(verifyPayment(codeToVerify)).unwrap();
        if (data?.status === PAYMENT_STATUS.SUCCESS) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          // A paid order frees its key: the next purchase creates a new order
          clearCheckoutKey(data?.planSnapshot?.planCode || data?.planCode || planCodeFromUrl);
          dispatch(fetchMySubscriptionQuota());
          dispatch(fetchPaymentHistory());
          if (isManual) toast.success('Xác nhận thanh toán thành công!');
        }
      } catch (err) {
        if (isManual) {
          toast.error(getApiErrorMsg(SUBSCRIPTION_ERROR_MESSAGES, err, 'Không thể kiểm tra trạng thái đơn.'));
        }
      } finally {
        isPollingRef.current = false;
      }
    },
    [dispatch, planCodeFromUrl]
  );

  // Create (or resume, same Idempotency-Key) the PayOS order and put its code in the URL
  const startCheckout = useCallback(
    async (planCode, idempotencyKey) => {
      if (isCreatingRef.current) return;
      isCreatingRef.current = true;
      setError(null);

      try {
        const data = await dispatch(createCheckoutSession({ planCode, idempotencyKey })).unwrap();
        if (data?.orderCode) {
          lastVerifiedCodeRef.current = String(data.orderCode);
          setSearchParams({ plan: planCode, orderCode: String(data.orderCode) }, { replace: true });
        }
      } catch (err) {
        setError(getApiErrorMsg(SUBSCRIPTION_ERROR_MESSAGES, err, CHECKOUT_ERROR_FALLBACK));
      } finally {
        isCreatingRef.current = false;
      }
    },
    [dispatch, setSearchParams]
  );

  // URL with an orderCode: only verify / resume that order
  useEffect(() => {
    if (!orderCodeFromUrl) return;
    if (lastVerifiedCodeRef.current === orderCodeFromUrl && orderData?.orderCode === Number(orderCodeFromUrl)) {
      return;
    }
    lastVerifiedCodeRef.current = orderCodeFromUrl;
    checkOrderStatus(orderCodeFromUrl);
  }, [orderCodeFromUrl, checkOrderStatus, orderData?.orderCode]);

  // URL without an orderCode: create / resume the checkout of the plan once
  useEffect(() => {
    if (orderCodeFromUrl) return;
    if (!PURCHASABLE_PLANS.includes(planCodeFromUrl)) {
      setError(SUBSCRIPTION_ERROR_MESSAGES.INVALID_PLAN);
      return;
    }
    startCheckout(planCodeFromUrl, getCheckoutKey(planCodeFromUrl));
  }, [orderCodeFromUrl, planCodeFromUrl, startCheckout]);

  // Countdown until the payment link expires (expiresAt from the backend)
  useEffect(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    if (!orderData?.expiresAt || orderData?.status === PAYMENT_STATUS.SUCCESS) {
      setRemainingSeconds(null);
      setIsTimeUp(false);
      return undefined;
    }

    const updateCountdown = () => {
      const diffSec = Math.floor((new Date(orderData.expiresAt).getTime() - Date.now()) / 1000);
      if (diffSec <= 0) {
        setRemainingSeconds(0);
        setIsTimeUp(true);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        // Final check to catch a payment made at the last second
        if (orderData?.orderCode) checkOrderStatus(orderData.orderCode);
      } else {
        setRemainingSeconds(diffSec);
        setIsTimeUp(false);
      }
    };

    updateCountdown();
    countdownTimerRef.current = setInterval(updateCountdown, 1000);
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [orderData?.expiresAt, orderData?.status, orderData?.orderCode, checkOrderStatus]);

  // Poll pending / creating orders
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    const isActive =
      orderData?.status === PAYMENT_STATUS.PENDING || orderData?.status === PAYMENT_STATUS.CREATING;
    if (isActive && orderData?.orderCode) {
      pollTimerRef.current = setInterval(() => checkOrderStatus(orderData.orderCode), POLL_INTERVAL_MS);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [orderData?.status, orderData?.orderCode, checkOrderStatus]);

  const handleManualVerify = () => {
    if (orderData?.orderCode) checkOrderStatus(orderData.orderCode, true);
  };

  // Retry with the same key: resumes the same order
  const handleRetry = () => startCheckout(orderPlanCode, getCheckoutKey(orderPlanCode));

  // Brand new order (new key) after the previous one expired / failed
  const handleCreateNewOrder = () => {
    dispatch(clearCurrentOrder());
    setIsTimeUp(false);
    lastVerifiedCodeRef.current = null;
    startCheckout(orderPlanCode, regenerateCheckoutKey(orderPlanCode));
  };

  const handleCopy = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      toast.success(`Đã sao chép ${label}!`);
    } catch {
      toast.error('Không thể sao chép vào bộ nhớ tạm');
    }
  };

  return {
    orderData,
    // Limits of the plan being bought (plan.features from the database)
    planFeatures: plans?.find((plan) => plan.planCode === orderPlanCode)?.features,
    loading: checkoutLoading && !orderData,
    isVerifying: verifyLoading,
    error,
    remainingSeconds,
    formattedCountdown: formatCountdown(remainingSeconds),
    isTimeUp,
    subscription,
    handleManualVerify,
    handleRetry,
    handleCreateNewOrder,
    handleCopy,
  };
};

export default useCheckout;
