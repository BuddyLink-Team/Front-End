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
import { PLAN_CODES, PAYMENT_STATUS } from '../constants/subscription.constants';

// Helper to generate UUID v4
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Stable session-scoped idempotency key helpers
const getIdempotencyKey = (planCode) => {
  const storageKey = `bl_checkout_idem_${planCode}`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = generateUUID();
    sessionStorage.setItem(storageKey, key);
  }
  return key;
};

const regenerateIdempotencyKey = (planCode) => {
  const storageKey = `bl_checkout_idem_${planCode}`;
  const newKey = generateUUID();
  sessionStorage.setItem(storageKey, newKey);
  return newKey;
};

const clearIdempotencyKey = (planCode) => {
  if (!planCode) return;
  const storageKey = `bl_checkout_idem_${planCode}`;
  sessionStorage.removeItem(storageKey);
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
    error: reduxError,
  } = useSelector((state) => state.subscription);

  const orderCodeFromUrl = searchParams.get('orderCode');
  const planCodeFromUrl = searchParams.get('plan') || PLAN_CODES.PREMIUM_MONTHLY;

  const [localError, setLocalError] = useState(null);
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

  // Core verification function using Redux thunk
  const checkOrderStatus = useCallback(
    async (codeToVerify, isManual = false) => {
      if (!codeToVerify || isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const resultAction = await dispatch(verifyPayment(codeToVerify));
        if (verifyPayment.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          if (data?.status === PAYMENT_STATUS.SUCCESS) {
            // Stop polling immediately
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);

            // Clear idempotency key on success so future purchases get a new order
            const targetPlanCode =
              data?.planSnapshot?.planCode || data?.planCode || planCodeFromUrl;
            clearIdempotencyKey(targetPlanCode);

            // Refresh user subscription rights and history
            dispatch(fetchMySubscriptionQuota());
            dispatch(fetchPaymentHistory());
            if (isManual) {
              toast.success('Xác nhận thanh toán thành công!');
            }
          }
        }
      } catch (err) {
        if (isManual) {
          toast.error(err?.message || 'Không thể kiểm tra trạng thái đơn');
        }
      } finally {
        isPollingRef.current = false;
      }
    },
    [dispatch, planCodeFromUrl]
  );

  // Effect 1: Handle URL with existing orderCode -> Only verify/resume that order
  useEffect(() => {
    if (!orderCodeFromUrl) return;

    // Skip if already in state with matching orderCode and already verified
    if (
      lastVerifiedCodeRef.current === orderCodeFromUrl &&
      orderData?.orderCode === Number(orderCodeFromUrl)
    ) {
      return;
    }

    lastVerifiedCodeRef.current = orderCodeFromUrl;
    checkOrderStatus(orderCodeFromUrl);
  }, [orderCodeFromUrl, checkOrderStatus, orderData?.orderCode]);

  // Effect 2: Handle URL without orderCode -> Create / Resume checkout session once
  useEffect(() => {
    // If URL already has an orderCode, Effect 1 handles it
    if (orderCodeFromUrl) return;

    const validPlan = [
      PLAN_CODES.PREMIUM_MONTHLY,
      PLAN_CODES.PREMIUM_YEARLY,
    ].includes(planCodeFromUrl);

    if (!validPlan) {
      setLocalError('Gói dịch vụ không hợp lệ. Vui lòng chọn lại gói cước.');
      return;
    }

    // Prevent parallel/double execution from React StrictMode or quick re-renders
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setLocalError(null);

    const idempotencyKey = getIdempotencyKey(planCodeFromUrl);

    dispatch(createCheckoutSession({ planCode: planCodeFromUrl, idempotencyKey }))
      .then((resultAction) => {
        if (createCheckoutSession.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          if (data?.orderCode) {
            lastVerifiedCodeRef.current = String(data.orderCode);
            setSearchParams(
              { plan: planCodeFromUrl, orderCode: String(data.orderCode) },
              { replace: true }
            );
          }
        } else {
          setLocalError(resultAction.payload || 'Không thể khởi tạo đơn thanh toán');
        }
      })
      .catch((err) => {
        setLocalError(err?.message || 'Không thể khởi tạo đơn thanh toán');
      })
      .finally(() => {
        isCreatingRef.current = false;
      });
  }, [orderCodeFromUrl, planCodeFromUrl, dispatch, setSearchParams]);

  // Countdown timer based on expiresAt from backend
  useEffect(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    if (!orderData?.expiresAt || orderData?.status === PAYMENT_STATUS.SUCCESS) {
      setRemainingSeconds(null);
      setIsTimeUp(false);
      return;
    }

    const updateCountdown = () => {
      const diffMs = new Date(orderData.expiresAt).getTime() - Date.now();
      const diffSec = Math.floor(diffMs / 1000);

      if (diffSec <= 0) {
        setRemainingSeconds(0);
        setIsTimeUp(true);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        // Final verify check when time expires to catch any late payment
        if (orderData?.orderCode) {
          checkOrderStatus(orderData.orderCode);
        }
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

  // Auto-polling every 3.5 seconds for pending / creating orders
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    const activeStatus =
      orderData?.status === PAYMENT_STATUS.PENDING ||
      orderData?.status === PAYMENT_STATUS.CREATING;

    if (activeStatus && orderData?.orderCode) {
      pollTimerRef.current = setInterval(() => {
        checkOrderStatus(orderData.orderCode);
      }, 3500);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [orderData?.status, orderData?.orderCode, checkOrderStatus]);

  // Manual verify trigger
  const handleManualVerify = () => {
    if (orderData?.orderCode) {
      checkOrderStatus(orderData.orderCode, true);
    }
  };

  // Retry creating checkout keeping the same idempotency key
  const handleRetry = () => {
    setLocalError(null);
    const targetPlanCode =
      orderData?.planSnapshot?.planCode || orderData?.planCode || planCodeFromUrl;
    const idempotencyKey = getIdempotencyKey(targetPlanCode);

    if (isCreatingRef.current) return;
    isCreatingRef.current = true;

    dispatch(createCheckoutSession({ planCode: targetPlanCode, idempotencyKey }))
      .then((resultAction) => {
        if (createCheckoutSession.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          if (data?.orderCode) {
            lastVerifiedCodeRef.current = String(data.orderCode);
            setSearchParams(
              { plan: targetPlanCode, orderCode: String(data.orderCode) },
              { replace: true }
            );
          }
        } else {
          setLocalError(resultAction.payload || 'Không thể khởi tạo đơn thanh toán');
        }
      })
      .catch((err) => {
        setLocalError(err?.message || 'Không thể khởi tạo đơn thanh toán');
      })
      .finally(() => {
        isCreatingRef.current = false;
      });
  };

  // Create a brand new order with a new idempotency key and clean URL
  const handleCreateNewOrder = () => {
    const targetPlanCode =
      orderData?.planSnapshot?.planCode || orderData?.planCode || planCodeFromUrl;
    const newKey = regenerateIdempotencyKey(targetPlanCode);

    dispatch(clearCurrentOrder());
    setIsTimeUp(false);
    setLocalError(null);
    lastVerifiedCodeRef.current = null;

    if (isCreatingRef.current) return;
    isCreatingRef.current = true;

    dispatch(createCheckoutSession({ planCode: targetPlanCode, idempotencyKey: newKey }))
      .then((resultAction) => {
        if (createCheckoutSession.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          if (data?.orderCode) {
            lastVerifiedCodeRef.current = String(data.orderCode);
            setSearchParams(
              { plan: targetPlanCode, orderCode: String(data.orderCode) },
              { replace: true }
            );
          }
        } else {
          setLocalError(resultAction.payload || 'Không thể khởi tạo đơn thanh toán');
        }
      })
      .catch((err) => {
        setLocalError(err?.message || 'Không thể khởi tạo đơn thanh toán');
      })
      .finally(() => {
        isCreatingRef.current = false;
      });
  };

  // Copy helper with toast
  const handleCopy = async (text, label) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(text));
        toast.success(`Đã sao chép ${label}!`);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = String(text);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success(`Đã sao chép ${label}!`);
      }
    } catch {
      toast.error('Không thể sao chép vào bộ nhớ tạm');
    }
  };

  // Format seconds into MM:SS
  const formatCountdown = (secs) => {
    if (secs == null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    orderData,
    loading: checkoutLoading && !orderData,
    isVerifying: verifyLoading,
    error: localError || reduxError,
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
