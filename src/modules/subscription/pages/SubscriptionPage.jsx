import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, HeartHandshake } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PricingCard } from '../components/PricingCard';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { PaymentHistoryList } from '../components/PaymentHistoryList';
import { Button } from '../../../components/ui/Button';
import { BILLING_CYCLES } from '../constants/subscription.constants';

export const SubscriptionPage = () => {
  const {
    freePlan,
    monthlyPlan,
    yearlyPlan,
    currentActivePlan,
    billingCycle,
    subscription,
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
    reload,
  } = useSubscription();

  const isYearly = billingCycle === BILLING_CYCLES.YEARLY;

  // Format active end date
  const formattedEndDate = subscription?.endDate
    ? new Date(subscription.endDate).toLocaleDateString('vi-VN')
    : null;

  // Format prices for billing toggle
  const monthlyPriceText =
    monthlyPlan.price > 0
      ? `Theo tháng (${new Intl.NumberFormat('vi-VN').format(monthlyPlan.price)}đ)`
      : 'Theo tháng';

  const yearlyPriceText =
    yearlyPlan.price > 0
      ? `Theo năm (${new Intl.NumberFormat('vi-VN').format(yearlyPlan.price)}đ)`
      : 'Theo năm';

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 pt-4">
      {/* 1. Header & Current Status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed text-xs font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Gói Hội Viên BuddyLink</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          Gói Hội Viên BuddyLink Gia Đình
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Đồng hành cùng sự phát triển xã hội và tình bạn tuổi thơ của bé trong không gian an lành, tin cậy.
        </p>

        {/* Current membership notice bar */}
        {effectivePlanCode && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/50 text-xs text-on-surface shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                Gói hiện tại:{' '}
                <strong className="font-bold text-on-surface">
                  {isPremium ? 'Hội Viên Premium' : 'Gói Miễn Phí'}
                </strong>
                {isPremium && formattedEndDate && (
                  <span className="text-on-surface-variant ml-1">
                    (Còn hạn đến: {formattedEndDate})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error state with retry button */}
      {error && (
        <div className="rounded-2xl border border-error/30 bg-error-container/40 p-4 flex items-center justify-between gap-4 text-sm text-on-error-container">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Thử lại
          </Button>
        </div>
      )}

      {/* 2. Dynamic Billing Cycle Switch (Monthly vs Yearly) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="p-1 rounded-full bg-surface-container-low border border-outline-variant/60 flex items-center gap-1 shadow-2xs">
          <button
            type="button"
            onClick={() => handleBillingCycleChange(BILLING_CYCLES.MONTHLY)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              !isYearly
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {monthlyPriceText}
          </button>
          <button
            type="button"
            onClick={() => handleBillingCycleChange(BILLING_CYCLES.YEARLY)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              isYearly
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>{yearlyPriceText}</span>
            {yearlySavingsPercentage > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-extrabold shadow-2xs">
                -{yearlySavingsPercentage}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Pricing Cards (Free vs Premium) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* Free Plan Card */}
        <PricingCard
          plan={freePlan}
          isCurrentPlan={!isPremium}
          isPremiumActive={false}
          onUpgrade={() => {}}
          disabled={loading}
          billingCycle={billingCycle}
          yearlySavingsPercentage={yearlySavingsPercentage}
        />

        {/* Selected Premium Plan Card */}
        <PricingCard
          plan={currentActivePlan}
          isCurrentPlan={isPremium}
          isPremiumActive={isPremium}
          endDate={subscription?.endDate}
          onUpgrade={handleUpgrade}
          disabled={loading}
          billingCycle={billingCycle}
          yearlySavingsPercentage={yearlySavingsPercentage}
        />
      </div>

      {/* 4. Trust & Safety Guarantee Banner */}
      <div className="rounded-2xl border border-primary/20 bg-surface-container-low/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h4 className="text-base font-bold text-on-surface">
            Thanh toán an toàn & bảo mật qua PayOS
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Mọi giao dịch thanh toán đều được mã hóa bảo mật qua cổng PayOS và kích hoạt quyền lợi gói Hội viên Premium ngay sau khi hệ thống ghi nhận giao dịch thành công.
          </p>
        </div>
      </div>

      {/* 5. Comparison Matrix */}
      <div className="pt-2">
        <ComparisonMatrix />
      </div>

      {/* 6. Payment Transaction History */}
      <div className="pt-2">
        <PaymentHistoryList
          historyData={paymentHistory}
          loading={historyLoading}
          onPageChange={handleHistoryPageChange}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
