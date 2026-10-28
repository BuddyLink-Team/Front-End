import React from 'react';
import { Modal } from '../../../../components/feedback/Modal';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { Button } from '../../../../components/ui/Button';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CHIPS,
  SUBSCRIPTION_PLAN_NAMES,
} from '../../constants/admin.constants';
import { formatCurrency, formatDateTime } from '../../../../utils/formatters';

const DetailRow = ({ label, children }) => (
  <div>
    <dt className="text-label-md text-text-muted">{label}</dt>
    <dd className="text-body-md text-text-primary mt-0.5">{children}</dd>
  </div>
);

/**
 * Audit detail of one payment (checkoutUrl and qrCode are never sent by the API).
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Object|null} payment - GET /transactions/:id data
 * @param {boolean} [isLoading]
 * @param {string|null} [errorMessage]
 */
export const PaymentDetailModal = ({ isOpen, onClose, payment, isLoading, errorMessage }) => {
  const chip = PAYMENT_STATUS_CHIPS[payment?.status];
  const grant = payment?.grantResult;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết giao dịch"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : !payment ? (
        <p className="py-8 text-center text-body-md text-text-muted">
          {errorMessage || 'Không tìm thấy thông tin giao dịch.'}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-low flex items-center justify-between gap-3">
            <div>
              <p className="text-label-md text-text-muted">Mã đơn hàng</p>
              <p className="font-mono text-headline-md font-semibold text-text-primary">#{payment.orderCode}</p>
            </div>
            <StatusChip status={chip?.status || payment.status} label={chip?.label} />
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Phụ huynh">
              <span className="font-semibold">{payment.parent?.fullName || '—'}</span>
              <span className="block text-label-md text-text-muted">{payment.parent?.email || '—'}</span>
            </DetailRow>
            <DetailRow label="Thời gian thanh toán">
              {formatDateTime(payment.paidAt) || '—'}
            </DetailRow>
            <DetailRow label="Gói đăng ký">
              {SUBSCRIPTION_PLAN_NAMES[payment.planSnapshot?.planCode] || payment.planSnapshot?.name || '—'}
            </DetailRow>
            <DetailRow label="Số tiền">
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
            </DetailRow>
            <DetailRow label="Phương thức">
              {PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod || '—'}
            </DetailRow>
            <DetailRow label="Mã giao dịch cổng">
              <span className="font-mono">{payment.transactionId || '—'}</span>
            </DetailRow>
            <DetailRow label="Tạo lúc">{formatDateTime(payment.createdAt)}</DetailRow>
            {payment.failureReason && <DetailRow label="Lý do thất bại">{payment.failureReason}</DetailRow>}
          </dl>

          {grant?.effectiveStartDate && (
            <div className="p-3 rounded-xl border border-hairline space-y-1">
              <p className="text-label-md font-semibold text-text-primary">
                Thời hạn Premium được cộng ({grant.monthsGranted} tháng)
              </p>
              <p className="text-body-md text-text-muted">
                {formatDateTime(grant.effectiveStartDate)} – {formatDateTime(grant.effectiveEndDate)}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PaymentDetailModal;
