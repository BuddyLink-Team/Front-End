import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Crown, Check, Sparkles } from 'lucide-react';
import { openPaywall, closePaywall } from '../redux/subscriptionSlice';
import { APP_EVENTS } from '../../../constants/event.constants';
import { getPlanBenefits } from '../utils/planBenefits';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import {
  QUOTA_FEATURES,
  QUOTA_MESSAGES,
  PLAN_CODES,
} from '../constants/subscriptionConstants';

export const PaywallModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isPaywallOpen, paywallReason, plans } = useSelector(
    (state) => state.subscription
  );
  const premiumPlan = plans.find((plan) => plan.planCode === PLAN_CODES.PREMIUM_MONTHLY);

  // Quota errors caught by apiClient (services/apiClient.js) open the paywall
  useEffect(() => {
    const handleQuotaExceeded = (event) => dispatch(openPaywall(event.detail));
    window.addEventListener(APP_EVENTS.QUOTA_EXCEEDED, handleQuotaExceeded);
    return () => window.removeEventListener(APP_EVENTS.QUOTA_EXCEEDED, handleQuotaExceeded);
  }, [dispatch]);

  if (!isPaywallOpen) return null;

  const handleClose = () => {
    dispatch(closePaywall());
  };

  const handleUpgrade = () => {
    dispatch(closePaywall());
    navigate('/subscription');
  };

  // Determine modal title & message based on quota feature reason
  const feature = paywallReason?.feature;
  const config = QUOTA_MESSAGES[feature] || QUOTA_MESSAGES[QUOTA_FEATURES.GENERAL];
  const modalTitle = paywallReason?.title || config.title;
  const modalMessage = paywallReason?.message || config.message;

  return (
    <Modal
      isOpen={isPaywallOpen}
      onClose={handleClose}
      title="Giới Hạn Gói Miễn Phí"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Header Visual Box */}
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white mb-3 shadow-sm">
            <Crown className="w-6 h-6 text-tertiary-fixed" />
          </div>
          <h4 className="text-base font-bold text-on-surface">
            {modalTitle}
          </h4>
          <p className="mt-1.5 text-xs text-on-surface-variant leading-relaxed">
            {modalMessage}
          </p>
        </div>

        {/* Premium benefits (PROJECT_OVERVIEW 14.1) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đặc quyền khi nâng cấp Premium:</span>
          </div>

          <div className="rounded-xl border border-outline-variant/50 bg-surface-container-low/40 divide-y divide-outline-variant/30 text-xs">
            {getPlanBenefits(premiumPlan?.features, true).map((benefit) => (
              <div
                key={benefit.key}
                className="flex items-center justify-between p-3"
              >
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <span>{benefit.name}</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="primary"
            className="w-full font-semibold shadow-sm"
            onClick={handleUpgrade}
          >
            Nâng cấp Premium ngay
          </Button>
          <Button
            variant="ghost"
            className="w-full text-xs text-on-surface-variant hover:text-on-surface"
            onClick={handleClose}
          >
            Để sau
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaywallModal;
