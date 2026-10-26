import React from 'react';
import { X, Receipt, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

const STATUS_CONFIG = {
  creating: { label: 'Khởi tạo', bg: 'bg-surface-container text-on-surface-variant', dot: 'bg-outline' },
  pending: { label: 'Chờ thanh toán', bg: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  success: { label: 'Thành công', bg: 'bg-primary-soft text-primary-dark font-semibold', dot: 'bg-primary' },
  failed: { label: 'Thất bại', bg: 'bg-red-100 text-red-800 font-semibold', dot: 'bg-red-500' },
  cancelled: { label: 'Đã hủy', bg: 'bg-orange-100 text-orange-800 font-semibold', dot: 'bg-orange-500' },
  expired: { label: 'Hết hạn', bg: 'bg-surface-container-highest text-on-surface-variant', dot: 'bg-outline' },
};

export const PaymentDetailModal = ({ payment, isOpen, onClose, isLoading }) => {
  if (!isOpen) return null;

  const statusInfo = STATUS_CONFIG[payment?.status] || {
    label: payment?.status || 'Unknown',
    bg: 'bg-surface-container text-on-surface',
    dot: 'bg-outline',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-container/50 flex items-center justify-center text-secondary">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Hóa đơn điện tử e-Invoice</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant text-xs">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tải thông tin đối soát...</span>
          </div>
        ) : !payment ? (
          <div className="py-8 text-center text-xs text-on-surface-variant">
            Không tìm thấy thông tin giao dịch
          </div>
        ) : (
          <div className="py-4 space-y-4 text-on-surface text-xs">
            {/* Top Code & Status Banner */}
            <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold block">
                  Mã đơn hàng
                </span>
                <span className="text-xl font-mono text-secondary font-bold">
                  #{payment.orderCode || payment.id?.slice(-8)}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusInfo.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                {statusInfo.label}
              </span>
            </div>

            {/* 2-column details grid */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-hairline">
              <div>
                <span className="text-on-surface-variant block text-xs">Phụ huynh thanh toán:</span>
                <span className="font-semibold text-on-surface text-sm">
                  {payment.parent?.fullName || 'Chưa cập nhật'}
                </span>
                <span className="text-on-surface-variant block text-xs mt-0.5">
                  {payment.parent?.email || '—'}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs">Thời gian thanh toán:</span>
                <span className="font-medium text-on-surface text-xs">
                  {payment.paidAt
                    ? dayjs(payment.paidAt).format('DD/MM/YYYY HH:mm:ss')
                    : payment.createdAt
                    ? dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    : '—'}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs">Gói đăng ký:</span>
                <span className="font-semibold text-secondary text-xs">
                  {payment.planSnapshot?.name || payment.planSnapshot?.planCode || '—'}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs">Tổng tiền thực thu:</span>
                <span className="font-bold text-base text-primary">
                  {formatCurrency(payment.amount)} {payment.currency || 'VND'}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs">Kênh thanh toán:</span>
                <span className="font-medium text-on-surface text-xs capitalize">
                  {payment.paymentMethod === 'payos' ? 'VietQR (PayOS)' : payment.paymentMethod || 'Chuyển khoản'}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs">Mã giao dịch cổng (Ref ID):</span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {payment.transactionId || payment.orderCode || '—'}
                </span>
              </div>
            </div>

            {/* Effective Period (Grant Result) */}
            {payment.effectivePeriod?.effectiveStartDate && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-hairline space-y-1">
                <span className="text-xs font-semibold text-on-surface block">
                  Thời hạn quyền lợi kích hoạt:
                </span>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Từ: {dayjs(payment.effectivePeriod.effectiveStartDate).format('DD/MM/YYYY HH:mm')}</span>
                  <span>Đến: {dayjs(payment.effectivePeriod.effectiveEndDate).format('DD/MM/YYYY HH:mm')}</span>
                </div>
              </div>
            )}

            {/* Security Assurance Badge */}
            <div className="p-2.5 rounded-xl bg-primary-soft/40 flex items-center justify-between text-on-surface text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-medium">Đối soát điện tử tự động</span>
              </div>
              <span className="font-bold text-primary-dark">Chứng từ hợp lệ</span>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailModal;
