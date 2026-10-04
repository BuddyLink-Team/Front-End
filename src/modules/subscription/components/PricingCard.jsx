import PropTypes from 'prop-types';
import {
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { PLAN_CODES } from '../constants/subscription.constants';

export const PricingCard = ({
  plan,
  isCurrentPlan,
  isPremiumActive,
  endDate,
  onUpgrade,
  disabled,
  billingCycle,
  yearlySavingsPercentage,
}) => {
  const isPremiumCard = plan.planCode !== PLAN_CODES.FREE;
  const isYearly = billingCycle === 'yearly';

  // Format price
  const formattedPrice =
    plan.price > 0
      ? new Intl.NumberFormat('vi-VN').format(plan.price) + 'đ'
      : '0đ';

  // Format duration label
  const durationLabel =
    plan.durationMonths === 12
      ? '/ năm'
      : plan.durationMonths === 1
      ? '/ tháng'
      : '/ tháng';

  // Equivalent monthly cost for yearly plan
  const equivalentMonthlyPrice =
    plan.durationMonths === 12 && plan.price > 0
      ? Math.round(plan.price / 12)
      : null;

  // Calculate formatted end date
  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString('vi-VN')
    : null;

  // Benefits list matching Stitch UI and 3 core features
  // Benefits list matching 3 core features and realistic support
  const benefits = isPremiumCard
    ? [
        {
          text: (
            <span>
              Quản lý <strong className="font-semibold text-primary">KHÔNG giới hạn</strong> hồ sơ bé cho gia đình
            </span>
          ),
          included: true,
        },
        {
          text: (
            <span>
              Ghép đôi <strong className="font-semibold text-primary">KHÔNG giới hạn</strong> bạn chơi cùng độ tuổi{' '}
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-normal">
                Sắp ra mắt
              </span>
            </span>
          ),
          included: true,
        },
        {
          text: (
            <span>
              Tổ chức & khởi tạo <strong className="font-semibold text-primary">KHÔNG giới hạn</strong> cuộc hẹn Playdate{' '}
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-normal">
                Sắp ra mắt
              </span>
            </span>
          ),
          included: true,
        },
      ]
    : [
        {
          text: (
            <span>
              Tối đa <strong className="font-semibold text-on-surface">1 hồ sơ bé</strong>
            </span>
          ),
          included: true,
        },
        {
          text: (
            <span>
              <strong className="font-semibold text-on-surface">5 lượt quẹt ghép đôi</strong> mỗi ngày{' '}
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-normal">
                Sắp ra mắt
              </span>
            </span>
          ),
          included: true,
        },
        {
          text: (
            <span>
              Tối đa <strong className="font-semibold text-on-surface">3 cuộc hẹn Playdate</strong> mỗi tháng{' '}
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-normal">
                Sắp ra mắt
              </span>
            </span>
          ),
          included: true,
        },
      ];

  return (
    <div
      className={`relative flex flex-col justify-between bg-surface-container-lowest rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
        isPremiumCard
          ? 'shadow-md hover:shadow-xl border-2 border-primary/40 ring-1 ring-primary/10'
          : 'shadow-sm hover:shadow-md border border-outline-variant/60'
      }`}
    >
      {/* Badge Nổi bật màu bơ ấm áp */}
      {isPremiumCard && (
        <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold shadow-sm select-none">
          <Sparkles className="w-3.5 h-3.5 text-tertiary" />
          <span>Được phụ huynh yêu thích</span>
        </div>
      )}

      <div className="flex flex-col">
        {/* Top Header Card */}
        <div className="flex items-center justify-between">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isPremiumCard
                ? 'bg-primary-container/20 text-primary'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {isPremiumCard ? (
              <Crown className="w-5 h-5 text-primary" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-on-surface-variant" />
            )}
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isPremiumCard
                ? 'bg-primary-fixed text-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            {isPremiumCard ? 'Đặc quyền trọn vẹn' : 'Mặc định'}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-on-surface mt-4 tracking-tight">
          {plan.name}
        </h3>
        <p className="text-sm text-on-surface-variant mt-1 min-h-[40px] leading-relaxed">
          {isPremiumCard
            ? 'Trải nghiệm tương tác không ranh giới, kết nối bạn chơi cho bé không giới hạn.'
            : 'Dành cho cha mẹ muốn bắt đầu kết nối nhẹ nhàng và tìm hiểu cộng đồng.'}
        </p>

        {/* Price Section */}
        <div className="mt-4 flex items-baseline gap-1.5">
          <span
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isPremiumCard ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {formattedPrice}
          </span>
          <span className="text-sm font-medium text-on-surface-variant">
            {durationLabel}
          </span>
        </div>

        {/* Sub-billing note for Yearly or Active date */}
        <div className="min-h-[22px] mt-1">
          {isPremiumCard && isYearly && equivalentMonthlyPrice && (
            <p className="text-xs font-semibold text-tertiary">
              * Tiết kiệm {yearlySavingsPercentage}% (chỉ ~{new Intl.NumberFormat('vi-VN').format(equivalentMonthlyPrice)}đ/tháng)
            </p>
          )}
          {isCurrentPlan && isPremiumActive && formattedEndDate && (
            <p className="text-xs font-semibold text-primary">
              ✓ Đang hoạt động đến: {formattedEndDate}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-surface-container-highest my-4"></div>

        {/* Benefits List */}
        <ul className="flex flex-col gap-3 text-sm text-on-surface mb-6">
          {benefits.map((b, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 leading-snug ${
                !b.included ? 'text-outline-variant opacity-60' : ''
              }`}
            >
              {b.included ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Minus className="w-4 h-4 text-outline-variant shrink-0 mt-0.5" />
              )}
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button & CTA Section */}
      <div className="pt-2 flex flex-col gap-2">
        {isCurrentPlan && (!isPremiumCard || isPremiumActive) ? (
          <div className="w-full">
            {isPremiumActive ? (
              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-bold text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                onClick={() => onUpgrade(plan.planCode)}
                disabled={disabled}
              >
                <span>Gia hạn Premium</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                className="w-full py-3 px-6 rounded-full bg-surface-container text-on-surface-variant font-semibold text-sm flex items-center justify-center gap-1.5 cursor-default"
                disabled
              >
                <Check className="w-4 h-4 text-primary" />
                <span>Đang sử dụng</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={`w-full py-3.5 px-6 rounded-full font-bold text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              isPremiumCard
                ? 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => onUpgrade(plan.planCode)}
            disabled={disabled}
          >
            <span>{isPremiumCard ? 'Nâng cấp ngay' : 'Bắt đầu sử dụng'}</span>
            {isPremiumCard && <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

PricingCard.propTypes = {
  plan: PropTypes.shape({
    planCode: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    currency: PropTypes.string,
    durationMonths: PropTypes.number,
    features: PropTypes.object,
  }).isRequired,
  isCurrentPlan: PropTypes.bool,
  isPremiumActive: PropTypes.bool,
  endDate: PropTypes.string,
  onUpgrade: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  billingCycle: PropTypes.string,
  yearlySavingsPercentage: PropTypes.number,
};

export default PricingCard;
