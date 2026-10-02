import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Crown, Check, Sparkles } from 'lucide-react';
import { closePaywall } from '../redux/subscriptionSlice';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import {
  QUOTA_MESSAGES,
  DEFAULT_PLAN_BENEFITS,
} from '../constants/subscription.constants';

export const PaywallModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isPaywallOpen, paywallReason } = useSelector(
    (state) => state.subscription
  );

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
  const config = QUOTA_MESSAGES[feature] || QUOTA_MESSAGES.general;
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

        {/* 3 Core Premium Benefits */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đặc quyền khi nâng cấp Premium:</span>
          </div>

          <div className="rounded-xl border border-outline-variant/50 bg-surface-container-low/40 divide-y divide-outline-variant/30 text-xs">
            {DEFAULT_PLAN_BENEFITS.map((benefit) => (
              <div
                key={benefit.key}
                className="flex items-center justify-between p-3"
              >
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <span>{benefit.name}</span>
                  {benefit.isUpcoming && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface-variant">
                      Sắp ra mắt
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {benefit.premiumText}
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
