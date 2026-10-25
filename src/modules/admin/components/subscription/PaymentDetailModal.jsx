import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Modal } from '../../../../components/feedback/Modal';
import { Button } from '../../../../components/ui/Button';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { Spinner } from '../../../../components/feedback/Spinner';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { adminSubscriptionApi } from '../../api/adminSubscriptionApi';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export const PaymentDetailModal = ({ paymentId, isOpen, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setDetail(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    adminSubscriptionApi
      .getPaymentDetail(paymentId)
      .then((res) => {
        if (!isMounted) return;
        setDetail(res?.data || res);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết giao dịch');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, paymentId]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Chi tiết đối soát giao dịch</span>
          {detail?.orderCode && (
            <span className="text-xs font-mono bg-surface-container px-2 py-0.5 rounded text-on-surface">
              #{detail.orderCode}
            </span>
          )}
        </div>
      }
      maxWidth="max-w-xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-on-surface-variant">Đang tải chi tiết giao dịch...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-error-container/20 rounded-xl border border-error-container flex items-center gap-2 text-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : detail ? (
        <div className="space-y-4 text-xs">
          {/* Header Status & Amount */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-hairline flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant mb-0.5">Số tiền thanh toán</p>
              <p className="text-lg font-bold text-primary-ink">
                {formatCurrency(detail.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant mb-1">Trạng thái</p>
              <StatusChip status={detail.status} />
            </div>
          </div>

          {/* Parent Info */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-hairline space-y-2">
            <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
              Thông tin phụ huynh
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-on-surface-variant">Họ và tên:</span>
                <p className="font-medium text-on-surface">{detail.parent?.fullName || '—'}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Email tài khoản:</span>
                <p className="font-medium text-on-surface">{detail.parent?.email || '—'}</p>
              </div>
            </div>
          </div>

          {/* Plan Snapshot */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-hairline space-y-2">
            <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
              Gói dịch vụ tại thời điểm mua (Snapshot)
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-on-surface-variant">Tên gói:</span>
                <p className="font-semibold text-on-surface">{detail.planSnapshot?.name || '—'}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Mã gói (planCode):</span>
                <p className="font-mono text-on-surface">{detail.planSnapshot?.planCode || '—'}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Đơn giá gốc:</span>
                <p className="text-on-surface">{formatCurrency(detail.planSnapshot?.price)}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Thời hạn cấp:</span>
                <p className="text-on-surface">{detail.planSnapshot?.durationMonths || 0} tháng</p>
              </div>
            </div>
          </div>

          {/* Payment & Bank Details */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-hairline space-y-2">
            <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
              Thông tin kỹ thuật PayOS & Ngân hàng
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-on-surface-variant">Mã đơn hàng (orderCode):</span>
                <div className="flex items-center gap-1 font-mono font-bold text-on-surface">
                  <span>{detail.orderCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(detail.orderCode, 'orderCode')}
                    className="p-1 text-on-surface-variant hover:text-primary"
                  >
                    {copiedField === 'orderCode' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant">Mã giao dịch (transactionId):</span>
                <div className="flex items-center gap-1 font-mono text-on-surface">
                  <span>{detail.transactionId || 'Chưa ghi nhận'}</span>
                  {detail.transactionId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(detail.transactionId, 'transactionId')}
                      className="p-1 text-on-surface-variant hover:text-primary"
                    >
                      {copiedField === 'transactionId' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant">Phương thức:</span>
                <p className="uppercase font-medium text-on-surface">{detail.paymentMethod || 'PAYOS'}</p>
              </div>

              <div>
                <span className="text-on-surface-variant">Mã ngân hàng (BIN):</span>
                <p className="font-mono text-on-surface">{detail.bankInfo?.bin || '—'}</p>
              </div>

              <div>
                <span className="text-on-surface-variant">Số tài khoản chuyển khoản:</span>
                <p className="font-mono text-on-surface">{detail.bankInfo?.accountNumber || '—'}</p>
              </div>

              <div>
                <span className="text-on-surface-variant">Tên tài khoản:</span>
                <p className="text-on-surface">{detail.bankInfo?.accountName || '—'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps & Grant Result */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-hairline space-y-2">
            <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
              Thời gian & Quyền lợi kích hoạt
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-on-surface-variant">Thời gian tạo:</span>
                <p className="font-mono text-on-surface">
                  {detail.createdAt ? dayjs(detail.createdAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
                </p>
              </div>

              <div>
                <span className="text-on-surface-variant">Thời gian thanh toán:</span>
                <p className="font-mono text-on-surface">
                  {detail.paidAt ? dayjs(detail.paidAt).format('DD/MM/YYYY HH:mm:ss') : 'Chưa thanh toán'}
                </p>
              </div>

              {detail.grantResult?.effectiveStartDate && (
                <div>
                  <span className="text-on-surface-variant">Bắt đầu chu kỳ:</span>
                  <p className="font-mono text-on-surface">
                    {dayjs(detail.grantResult.effectiveStartDate).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              )}

              {detail.grantResult?.effectiveEndDate && (
                <div>
                  <span className="text-on-surface-variant">Hạn dùng chu kỳ:</span>
                  <p className="font-mono text-on-surface">
                    {dayjs(detail.grantResult.effectiveEndDate).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              )}
            </div>

            {detail.failureReason && (
              <div className="mt-2 p-2.5 rounded-lg bg-error-container/20 border border-error-container text-error text-xs">
                <span className="font-bold">Lý do thất bại:</span> {detail.failureReason}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default PaymentDetailModal;
