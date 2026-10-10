import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { Button } from '../../../components/ui/Button';
import { CheckoutStatusCard } from '../components/CheckoutStatusCard';
import { CheckoutOrderSummary } from '../components/CheckoutOrderSummary';
import { CheckoutQrPanel } from '../components/CheckoutQrPanel';
import { PAYMENT_STATUS } from '../constants/subscriptionConstants';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    orderData,
    planFeatures,
    loading,
    isVerifying,
    error,
    formattedCountdown,
    isTimeUp,
    subscription,
    handleManualVerify,
    handleRetry,
    handleCreateNewOrder,
    handleCopy,
  } = useCheckout();

  // Status checks from authoritative backend data
  const isSuccess = orderData?.status === PAYMENT_STATUS.SUCCESS;
  const isFailed = orderData?.status === PAYMENT_STATUS.FAILED;
  const isCancelled = orderData?.status === PAYMENT_STATUS.CANCELLED;
  const isExpired = orderData?.status === PAYMENT_STATUS.EXPIRED;
  const isPending =
    orderData?.status === PAYMENT_STATUS.PENDING ||
    orderData?.status === PAYMENT_STATUS.CREATING;

  // Format currency
  const formattedAmount =
    new Intl.NumberFormat('vi-VN').format(orderData?.amount || 0) + ' đ';

  // Duration label: read from planSnapshot.durationMonths first, fallback to durationMonths
  const durationMonths =
    orderData?.planSnapshot?.durationMonths ?? orderData?.durationMonths ?? 1;
  const durationText =
    durationMonths === 12 ? '12 tháng (1 năm)' : `${durationMonths} tháng`;

  // Format end date for success
  const formattedEndDate = subscription?.endDate
    ? new Date(subscription.endDate).toLocaleDateString('vi-VN')
    : null;

  if (loading) {
    return (
      <div className="mx-auto py-16 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">Đang khởi tạo phiên thanh toán PayOS...</h2>
        <p className="text-sm text-on-surface-variant">Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="mx-auto py-16 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">Không thể tạo đơn thanh toán</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/subscription')}>
            Quay lại chọn gói
          </Button>
          <Button variant="primary" onClick={handleRetry}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const backToPlans = () => navigate('/subscription');

  return (
    <div className="mx-auto py-6 space-y-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={backToPlans} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Quay lại bảng giá gói
        </Button>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Thanh toán an toàn qua PayOS</span>
        </div>
      </div>

      {isSuccess && (
        <CheckoutStatusCard
          icon={CheckCircle2}
          tone="success"
          title="Thanh toán thành công!"
          description={
            <>
              Tài khoản của bạn đã được nâng cấp lên gói Hội viên Premium.
              {formattedEndDate && (
                <span className="block mt-1 font-semibold text-primary">Thời hạn sử dụng đến: {formattedEndDate}</span>
              )}
            </>
          }
          actions={
            <>
              <Button variant="primary" className="w-full sm:w-auto px-8" onClick={backToPlans}>
                Xem thông tin gói
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </>
          }
        >
          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/40 p-4 max-w-sm mx-auto text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-on-surface">#{orderData.orderCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Số tiền:</span>
              <span className="font-bold text-on-surface">{formattedAmount}</span>
            </div>
          </div>
        </CheckoutStatusCard>
      )}

      {(isFailed || isCancelled) && (
        <CheckoutStatusCard
          icon={XCircle}
          tone="error"
          title={isCancelled ? 'Đơn hàng đã bị hủy' : 'Thanh toán không thành công'}
          description="Giao dịch chưa hoàn tất hoặc đã bị hủy. Nếu tài khoản ngân hàng của bạn đã bị trừ tiền, vui lòng liên hệ bộ phận hỗ trợ kèm mã đơn hàng để được đối soát."
          actions={
            <>
              <Button variant="outline" onClick={backToPlans}>Quay lại chọn gói</Button>
              <Button variant="primary" onClick={handleCreateNewOrder}>Tạo đơn mới</Button>
            </>
          }
        />
      )}

      {isExpired && (
        <CheckoutStatusCard
          icon={Clock}
          title="Mã thanh toán đã hết hạn"
          description="Phiên thanh toán đã quá hạn. Vui lòng tạo đơn mới để tiếp tục chuyển khoản."
          actions={
            <>
              <Button variant="outline" onClick={backToPlans}>Quay lại</Button>
              <Button variant="primary" onClick={handleCreateNewOrder}>Tạo mã thanh toán mới</Button>
            </>
          }
        />
      )}

      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <CheckoutOrderSummary orderData={orderData} planFeatures={planFeatures} durationText={durationText} formattedAmount={formattedAmount} />
          <CheckoutQrPanel
            orderData={orderData}
            formattedAmount={formattedAmount}
            formattedCountdown={formattedCountdown}
            isTimeUp={isTimeUp}
            isVerifying={isVerifying}
            onCopy={handleCopy}
            onVerify={handleManualVerify}
            onCreateNewOrder={handleCreateNewOrder}
          />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
