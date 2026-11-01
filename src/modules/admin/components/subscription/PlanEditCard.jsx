import React, { useState } from 'react';
import { ShieldCheck, Gem, Crown, CheckCircle2, Sliders, Edit3 } from 'lucide-react';
import { EditPlanModal } from './EditPlanModal';
import { Button } from '../../../../components/ui/Button';
import { PLAN_FEATURE_FIELDS, UNLIMITED_LIMIT } from '../../constants/admin.constants';
import { formatCount, formatCurrency } from '../../../../utils/formatters';
import { cn } from '../../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../../constants/icon.constants';

// Look of each plan card, by planCode: white card, solid pastel accents (`*-soft` + `*-border` + `*-dark`)
const PLAN_STYLES = {
  free: {
    card: 'border-hairline',
    tag: 'bg-surface-muted border-hairline-strong text-text-muted',
    tagLabel: 'Mặc định hệ thống',
    icon: ShieldCheck,
    iconClass: 'text-text-muted',
    price: 'text-text-primary',
    check: 'text-primary',
    description: 'Dành cho phụ huynh mới trải nghiệm kết nối cộng đồng.',
    buttonVariant: 'outline',
    button: '',
  },
  premium_monthly: {
    card: 'border-2 border-primary-border',
    tag: 'bg-secondary-soft border-secondary-border text-secondary-dark',
    tagLabel: 'Gói Linh hoạt',
    icon: Gem,
    iconClass: 'text-primary-dark',
    price: 'text-primary-dark',
    check: 'text-primary',
    description: 'Gia đình VIP Tháng - Kết nối linh hoạt không ràng buộc.',
    buttonVariant: 'primary',
    button: '',
  },
  premium_yearly: {
    card: 'border-2 border-tertiary-border',
    tag: 'bg-tertiary-soft border-tertiary-border text-tertiary-dark',
    tagLabel: 'Cam kết trọn năm',
    icon: Crown,
    iconClass: 'text-tertiary-dark',
    price: 'text-tertiary-dark',
    check: 'text-tertiary-dark',
    description: 'Gia đình VIP Năm - Trải nghiệm hoàn hảo không âu lo.',
    buttonVariant: 'primary',
    button: 'bg-tertiary text-tertiary-dark hover:bg-tertiary-fixed-dim focus:ring-tertiary-border',
  },
};

const formatLimit = (value) => (value === UNLIMITED_LIMIT ? 'Không giới hạn' : formatCount(value));

/**
 * One plan of the plans tab: price, on-sale state, its real limits and the edit modal.
 *
 * @param {Object} plan - Plan of useAdminPlans (`monthlyEquivalent`, `savingsPercent` derived there)
 * @param {(id: string, payload: Object) => Promise<boolean>} onUpdate
 * @param {boolean} [isUpdating]
 */
export const PlanEditCard = ({ plan, onUpdate, isUpdating }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const style = PLAN_STYLES[plan.planCode] || PLAN_STYLES.premium_monthly;
  const PlanIcon = style.icon;
  const isMonthly = plan.planCode === 'premium_monthly';
  const ButtonIcon = plan.isFree ? Sliders : Edit3;

  return (
    <>
      <div
        className={cn(
          'bg-surface-container-lowest rounded-2xl p-6 shadow-xs border flex flex-col justify-between relative transition-all duration-300 hover:shadow-md',
          style.card
        )}
      >
        {isMonthly && (
          <div className="absolute -top-3 right-6 bg-primary text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-xs">
            Phổ biến nhất
          </div>
        )}
        {plan.savingsPercent > 0 && (
          <div className="absolute -top-3 right-6 bg-tertiary text-tertiary-dark px-3 py-0.5 rounded-full text-xs font-semibold shadow-xs">
            Tiết kiệm {plan.savingsPercent}%
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className={cn('px-3 py-1 rounded-full border text-xs font-semibold', style.tag)}>{style.tagLabel}</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold',
                plan.isActive
                  ? 'bg-primary-soft border-primary-border text-primary-dark'
                  : 'bg-surface-muted border-hairline-strong text-text-muted'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', plan.isActive ? 'bg-primary animate-pulse' : 'bg-outline')} />
              {plan.isActive ? (plan.isFree ? 'Hoạt động' : 'Đang kích hoạt') : 'Tạm ngưng'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PlanIcon size={ICON_SIZE.XL} strokeWidth={ICON_STROKE.DEFAULT} className={style.iconClass} />
            <h3 className="text-lg font-semibold text-on-surface">{plan.name}</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{style.description}</p>

          <div className="my-4 pb-3 border-b border-hairline">
            <div className="text-2xl font-semibold tracking-tight text-on-surface">
              <span className={style.price}>{formatCurrency(plan.price)}</span>{' '}
              {!plan.isFree && (
                <span className="text-xs font-medium text-on-surface-variant">
                  / {plan.durationMonths > 1 ? `${plan.durationMonths} tháng` : 'tháng'}
                </span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant">
              {plan.isFree
                ? 'Không giới hạn thời gian sử dụng'
                : plan.monthlyEquivalent
                  ? `Chỉ ~${formatCurrency(plan.monthlyEquivalent)}/tháng`
                  : 'Trả trước, không tự động gia hạn'}
            </span>
          </div>

          <div className="space-y-2.5 mb-6">
            <div className="text-xs uppercase tracking-wider text-on-surface font-semibold">Quota &amp; Đặc quyền:</div>
            {PLAN_FEATURE_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-start gap-2 text-xs text-on-surface">
                <CheckCircle2
                  size={ICON_SIZE.MD}
                  strokeWidth={ICON_STROKE.DEFAULT}
                  className={cn('shrink-0 mt-0.5', style.check)}
                />
                <span>
                  {label}: <strong className="font-semibold">{formatLimit(plan.features?.[key])}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant={style.buttonVariant}
          onClick={() => setIsEditModalOpen(true)}
          leftIcon={<ButtonIcon size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.DEFAULT} />}
          className={cn('w-full py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:scale-100', style.button)}
        >
          {plan.isFree ? 'Chỉnh sửa cấu hình' : 'Chỉnh sửa gói'}
        </Button>
      </div>

      <EditPlanModal
        plan={plan}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onUpdate}
        isUpdating={isUpdating}
      />
    </>
  );
};

export default PlanEditCard;
