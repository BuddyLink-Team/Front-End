import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, HeartHandshake } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PricingCard } from '../components/PricingCard';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { PaymentHistoryList } from '../components/PaymentHistoryList';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/navigation/Tabs';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { BILLING_CYCLES } from '../constants/subscription.constants';

export const SubscriptionPage = () => {
  const {
    freePlan,
    monthlyPlan,
    yearlyPlan,
    currentActivePlan,
    plansLoaded,
    isCurrentPremiumPlan,
    quotaLoaded,
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

  // Format active end date
  const formattedEndDate = subscription?.endDate
    ? new Date(subscription.endDate).toLocaleDateString('vi-VN')
    : null;

  // Available billing tabs based on active plans
  const billingTabs = [
    monthlyPlan && { id: BILLING_CYCLES.MONTHLY, label: 'Theo tháng' },
    yearlyPlan && {
      id: BILLING_CYCLES.YEARLY,
      label: 'Theo năm',
      ...(yearlySavingsPercentage > 0 && { count: `-${yearlySavingsPercentage}%` }),
    },
  ].filter(Boolean);

  return (
    <div className="mx-auto space-y-10 pb-16">
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

        {/* Current membership notice bar (once GET /subscriptions/my answered) */}
        {quotaLoaded && effectivePlanCode && (
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

      {!plansLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" aria-busy="true">
          <Skeleton className="h-pricing-card rounded-2xl" />
          <Skeleton className="h-pricing-card rounded-2xl" />
        </div>
      )}

      {plansLoaded && (
        <>
          {/* 2. Dynamic Billing Cycle Switch (Monthly vs Yearly) */}
          {billingTabs.length > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Tabs
                tabs={billingTabs}
                activeTab={billingCycle}
                onChange={handleBillingCycleChange}
              />
            </div>
          )}
          {billingTabs.length === 1 && (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface">
                {billingTabs[0].label === 'Theo năm' ? 'Gói Hội Viên Theo Năm' : 'Gói Hội Viên Theo Tháng'}
                {billingTabs[0].count && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-bold text-xs">
                    {billingTabs[0].count}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* 3. Pricing Cards (Free vs Premium) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Free plan: the default plan, never bought, so no action while Premium is active */}
            <PricingCard
              plan={freePlan}
              isCurrentPlan={!isPremium}
              isPremiumActive={false}
              onUpgrade={() => {}}
              showAction={quotaLoaded && !isPremium}
              disabled={loading}
              billingCycle={billingCycle}
              yearlySavingsPercentage={yearlySavingsPercentage}
            />

            {/* Selected Premium plan: renew when it is the plan in use, otherwise buy / add months */}
            {currentActivePlan ? (
              <PricingCard
                plan={currentActivePlan}
                isCurrentPlan={isCurrentPremiumPlan}
                isPremiumActive={isPremium}
                endDate={subscription?.endDate}
                onUpgrade={handleUpgrade}
                disabled={loading}
                billingCycle={billingCycle}
                yearlySavingsPercentage={yearlySavingsPercentage}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-lowest/60 p-8 flex flex-col items-center justify-center text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-on-surface-variant/40" />
                <h3 className="text-base font-bold text-on-surface">Gói Hội Viên Premium tạm ngưng</h3>
                <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                  Hiện tại các gói Premium đang tạm thời ngưng nhận đăng ký mới để bảo trì hệ thống. Ba mẹ vui lòng quay lại sau!
                </p>
              </div>
            )}
          </div>
        </>
      )}

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
        <ComparisonMatrix freePlan={freePlan} premiumPlan={monthlyPlan || yearlyPlan} />
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
