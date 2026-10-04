import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCheckout } from '../hooks/useCheckout';
import { Button } from '../../../components/ui/Button';
import { PAYMENT_STATUS } from '../constants/subscription.constants';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    orderData,
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
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
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
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
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

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/subscription')}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại bảng giá gói
        </button>

        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Thanh toán an toàn qua PayOS</span>
        </div>
      </div>

      {/* Case 1: SUCCESS STATE */}
      {isSuccess && (
        <div className="rounded-3xl border border-primary/30 bg-surface-container-lowest p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Thanh Toán Thành Công!
            </h2>
            <p className="text-sm text-on-surface-variant">
              Tài khoản của bạn đã được nâng cấp thành công lên gói Hội viên Premium.
              {formattedEndDate && (
                <span className="block mt-1 font-semibold text-primary">
                  Thời hạn sử dụng đến: {formattedEndDate}
                </span>
              )}
            </p>
          </div>

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

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              className="w-full sm:w-auto px-8"
              onClick={() => navigate('/subscription')}
            >
              Xem thông tin gói
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      )}

      {/* Case 2: FAILED / CANCELLED STATE */}
      {(isFailed || isCancelled) && (
        <div className="rounded-3xl border border-error/30 bg-surface-container-lowest p-8 text-center space-y-6 shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-on-surface">
              {isCancelled ? 'Đơn Hàng Đã Bị Hủy' : 'Thanh Toán Không Thành Công'}
            </h2>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              Giao dịch chưa hoàn tất hoặc đã bị hủy. Nếu tài khoản ngân hàng của bạn đã bị trừ tiền, vui lòng liên hệ bộ phận hỗ trợ kèm mã đơn hàng để được đối soát ngay.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/subscription')}>
              Quay lại chọn gói
            </Button>
            <Button variant="primary" onClick={handleCreateNewOrder}>
              Tạo đơn mới
            </Button>
          </div>
        </div>
      )}

      {/* Case 3: EXPIRED STATE (Server confirmed expired) */}
      {isExpired && !isSuccess && !isFailed && !isCancelled && (
        <div className="rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center space-y-6 shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-container-high text-on-surface-variant">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-on-surface">Mã Thanh Toán Đã Hết Hạn</h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Phiên thanh toán đã quá hạn. Vui lòng tạo đơn mới để tiếp tục chuyển khoản.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/subscription')}>
              Quay lại
            </Button>
            <Button variant="primary" onClick={handleCreateNewOrder}>
              Tạo mã thanh toán mới
            </Button>
          </div>
        </div>
      )}

      {/* Case 4: PENDING PAYMENT INTERFACE */}
      {isPending && !isExpired && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Order Summary & Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Chi tiết đơn hàng
                </span>
                <span className="font-mono text-xs font-bold text-on-surface">
                  #{orderData.orderCode}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Gói dịch vụ:</span>
                  <span className="font-semibold text-on-surface">
                    {orderData.planSnapshot?.name || orderData.planName || 'Gói Hội Viên Premium'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Chu kỳ:</span>
                  <span className="font-medium text-on-surface">
                    {durationText}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-outline-variant/30 text-base font-bold">
                  <span className="text-on-surface">Tổng thanh toán:</span>
                  <span className="text-primary text-xl font-extrabold">
                    {formattedAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Highlights */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Quyền lợi kích hoạt ngay:</span>
              </div>
              <ul className="text-xs text-on-surface-variant space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Không giới hạn quản lý hồ sơ bé</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>
                    Không giới hạn lượt quẹt tìm bạn mỗi ngày{' '}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface-variant">
                      Sắp ra mắt
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>
                    Không giới hạn tạo cuộc hẹn Playdate mỗi tháng{' '}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface-variant">
                      Sắp ra mắt
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Direct PayOS Link Button */}
            {orderData.checkoutUrl && (
              <a
                href={orderData.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full text-xs font-medium">
                  <ExternalLink className="w-4 h-4 mr-2 text-primary" />
                  Mở trang thanh toán PayOS tập trung
                </Button>
              </a>
            )}
          </div>

          {/* Right Column: QR Code & Bank Transfer Information */}
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 space-y-6 shadow-sm">
            {/* Header with Countdown */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-on-surface">Quét mã VietQR</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
                isTimeUp ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{isTimeUp ? 'Hết giờ' : formattedCountdown}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-outline-variant/40">
              {orderData.qrCode ? (
                orderData.qrCode.startsWith('http') ? (
                  <img
                    src={orderData.qrCode}
                    alt="VietQR Code"
                    className={`w-48 h-48 sm:w-56 sm:h-56 object-contain ${isTimeUp ? 'opacity-40 grayscale' : ''}`}
                  />
                ) : (
                  <div className={isTimeUp ? 'opacity-40 grayscale' : ''}>
                    <QRCodeSVG
                      value={orderData.qrCode}
                      size={200}
                      level="M"
                      includeMargin
                    />
                  </div>
                )
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                  Đang tải mã QR...
                </div>
              )}
              <p className="mt-2 text-[11px] text-on-surface-variant text-center">
                {isTimeUp
                  ? 'Thời gian giữ mã đã hết. Bạn vẫn có thể kiểm tra giao dịch hoặc tạo mã mới.'
                  : 'Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã'}
              </p>
            </div>

            {/* Bank Transfer Details Table (if bankInfo available) */}
            {orderData.bankInfo && (
              <div className="rounded-xl bg-surface-container-low/60 border border-outline-variant/40 p-4 space-y-2.5 text-xs">
                {orderData.bankInfo.bankName && (
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Ngân hàng:</span>
                    <span className="font-semibold text-on-surface">
                      {orderData.bankInfo.bankName}
                    </span>
                  </div>
                )}

                {orderData.bankInfo.accountNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-on-surface">
                        {orderData.bankInfo.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(orderData.bankInfo.accountNumber, 'số tài khoản')
                        }
                        className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        title="Sao chép"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {orderData.bankInfo.accountName && (
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Chủ tài khoản:</span>
                    <span className="font-semibold text-on-surface uppercase">
                      {orderData.bankInfo.accountName}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Số tiền chính xác:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-primary">{formattedAmount}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(orderData.amount, 'số tiền')}
                      className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {orderData.bankInfo.description && (
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-on-surface bg-surface-container-highest px-1.5 py-0.5 rounded">
                        {orderData.bankInfo.description}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(orderData.bankInfo.description, 'nội dung chuyển khoản')
                        }
                        className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        title="Sao chép"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Polling & Manual Verify Button */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                className="w-full font-semibold shadow-sm"
                onClick={handleManualVerify}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Đang kiểm tra giao dịch...
                  </span>
                ) : (
                  'Kiểm tra thanh toán'
                )}
              </Button>

              {isTimeUp && (
                <Button
                  variant="outline"
                  className="w-full font-medium text-xs"
                  onClick={handleCreateNewOrder}
                >
                  Tạo đơn thanh toán mới
                </Button>
              )}

              <p className="text-[11px] text-center text-on-surface-variant">
                Hệ thống tự động kiểm tra mỗi 3 giây và kích hoạt ngay khi nhận tiền
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
