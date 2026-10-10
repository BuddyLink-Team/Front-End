import PropTypes from 'prop-types';
import { Copy, Clock, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const CopyButton = ({ onClick }) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    title="Sao chép"
    aria-label="Sao chép"
    className="p-1 text-on-surface-variant hover:text-primary"
  >
    <Copy className="w-3.5 h-3.5" />
  </Button>
);

CopyButton.propTypes = { onClick: PropTypes.func.isRequired };

const InfoRow = ({ label, children }) => (
  <div className="flex justify-between items-center gap-3">
    <span className="text-on-surface-variant">{label}</span>
    <div className="flex items-center gap-1.5 text-right">{children}</div>
  </div>
);

InfoRow.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

/**
 * Pending checkout, right column: VietQR code with countdown, bank transfer details and verify actions.
 */
export const CheckoutQrPanel = ({
  orderData,
  formattedAmount,
  formattedCountdown,
  isTimeUp,
  isVerifying,
  onCopy,
  onVerify,
  onCreateNewOrder,
}) => {
  const { qrCode, bankInfo } = orderData;
  const qrClass = isTimeUp ? 'opacity-40 grayscale' : '';

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-on-surface">Quét mã VietQR</span>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold',
            isTimeUp ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isTimeUp ? 'Hết giờ' : formattedCountdown}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-outline-variant/40">
        {!qrCode && (
          <div className="w-48 h-48 flex items-center justify-center bg-surface-muted text-xs text-text-muted">
            Đang tải mã QR...
          </div>
        )}
        {qrCode && qrCode.startsWith('http') && (
          <img src={qrCode} alt="Mã VietQR" className={cn('w-48 h-48 sm:w-56 sm:h-56 object-contain', qrClass)} />
        )}
        {qrCode && !qrCode.startsWith('http') && (
          <div className={qrClass}>
            <QRCodeSVG value={qrCode} size={200} level="M" includeMargin />
          </div>
        )}
        <p className="mt-2 text-[11px] text-on-surface-variant text-center">
          {isTimeUp
            ? 'Thời gian giữ mã đã hết. Bạn vẫn có thể kiểm tra giao dịch hoặc tạo mã mới.'
            : 'Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã'}
        </p>
      </div>

      {bankInfo && (
        <div className="rounded-xl bg-surface-container-low/60 border border-outline-variant/40 p-4 space-y-2.5 text-xs">
          {bankInfo.bankName && (
            <InfoRow label="Ngân hàng:">
              <span className="font-semibold text-on-surface">{bankInfo.bankName}</span>
            </InfoRow>
          )}
          {bankInfo.accountNumber && (
            <InfoRow label="Số tài khoản:">
              <span className="font-mono font-bold text-on-surface">{bankInfo.accountNumber}</span>
              <CopyButton onClick={() => onCopy(bankInfo.accountNumber, 'số tài khoản')} />
            </InfoRow>
          )}
          {bankInfo.accountName && (
            <InfoRow label="Chủ tài khoản:">
              <span className="font-semibold text-on-surface uppercase">{bankInfo.accountName}</span>
            </InfoRow>
          )}
          <InfoRow label="Số tiền chính xác:">
            <span className="font-bold text-primary">{formattedAmount}</span>
            <CopyButton onClick={() => onCopy(orderData.amount, 'số tiền')} />
          </InfoRow>
          {bankInfo.description && (
            <InfoRow label="Nội dung chuyển khoản:">
              <span className="font-mono font-bold text-on-surface bg-surface-container-highest px-1.5 py-0.5 rounded">
                {bankInfo.description}
              </span>
              <CopyButton onClick={() => onCopy(bankInfo.description, 'nội dung chuyển khoản')} />
            </InfoRow>
          )}
        </div>
      )}

      <div className="space-y-2 pt-2">
        <Button variant="primary" className="w-full font-semibold" onClick={onVerify} isLoading={isVerifying}>
          {isVerifying ? 'Đang kiểm tra giao dịch...' : 'Kiểm tra thanh toán'}
        </Button>
        {isTimeUp && (
          <Button variant="outline" className="w-full font-medium text-xs" onClick={onCreateNewOrder}>
            Tạo đơn thanh toán mới
          </Button>
        )}
        <p className="text-[11px] text-center text-on-surface-variant">
          Hệ thống tự động kiểm tra vài giây một lần và kích hoạt ngay khi nhận tiền
        </p>
      </div>
    </div>
  );
};

CheckoutQrPanel.propTypes = {
  orderData: PropTypes.object.isRequired,
  formattedAmount: PropTypes.string.isRequired,
  formattedCountdown: PropTypes.string.isRequired,
  isTimeUp: PropTypes.bool,
  isVerifying: PropTypes.bool,
  onCopy: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
  onCreateNewOrder: PropTypes.func.isRequired,
};

export default CheckoutQrPanel;
