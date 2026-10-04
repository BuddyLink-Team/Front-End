import PropTypes from 'prop-types';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '../../../components/cards/EmptyState';
import { Button } from '../../../components/ui/Button';
import { PAYMENT_STATUS } from '../constants/subscription.constants';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const configs = {
    [PAYMENT_STATUS.SUCCESS]: {
      label: 'Thành công',
      className: 'bg-[#eaf3ec] text-[#3d6841] border-[#d2e7d7]',
    },
    [PAYMENT_STATUS.PENDING]: {
      label: 'Chờ thanh toán',
      className: 'bg-[#fef7e6] text-[#755a1b] border-[#fae4b2]',
    },
    [PAYMENT_STATUS.CREATING]: {
      label: 'Đang tạo',
      className: 'bg-[#fef7e6] text-[#755a1b] border-[#fae4b2]',
    },
    [PAYMENT_STATUS.FAILED]: {
      label: 'Thất bại',
      className: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]',
    },
    [PAYMENT_STATUS.CANCELLED]: {
      label: 'Đã hủy',
      className: 'bg-[#edf2f0] text-[#718096] border-[#d9e2de]',
    },
    [PAYMENT_STATUS.EXPIRED]: {
      label: 'Đã hết hạn',
      className: 'bg-[#edf2f0] text-[#718096] border-[#d9e2de]',
    },
  };

  const config = configs[normalized] || {
    label: status || 'Không xác định',
    className: 'bg-[#edf2f0] text-[#718096] border-[#d9e2de]',
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs select-none ${config.className}`}
    >
      {config.label}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export const PaymentHistoryList = ({
  historyData,
  loading,
  onPageChange,
}) => {
  const items = historyData?.items || [];
  const pagination = historyData?.pagination || { page: 1, limit: 10, total: 0 };
  const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10)) || 1;

  if (loading && items.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
        <p className="text-sm text-on-surface-variant">Đang tải lịch sử giao dịch...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6">
        <EmptyState
          icon={<Receipt className="w-6 h-6 text-primary" />}
          title="Chưa có lịch sử giao dịch"
          description="Bạn chưa thực hiện giao dịch mua gói hội viên nào trên BuddyLink."
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-outline-variant/40 bg-surface/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Lịch sử giao dịch</h3>
          <p className="text-xs text-on-surface-variant">
            Danh sách các đơn thanh toán gói dịch vụ của bạn
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant/40 bg-surface-container-low/40">
              <th className="py-3.5 px-6 font-semibold text-on-surface">Mã đơn</th>
              <th className="py-3.5 px-6 font-semibold text-on-surface">Gói dịch vụ</th>
              <th className="py-3.5 px-6 font-semibold text-on-surface">Số tiền</th>
              <th className="py-3.5 px-6 font-semibold text-on-surface">Trạng thái</th>
              <th className="py-3.5 px-6 font-semibold text-on-surface">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {items.map((item) => {
              const formattedAmount =
                new Intl.NumberFormat('vi-VN').format(item.amount || 0) + ' đ';
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleString('vi-VN')
                : '--';

              return (
                <tr key={item._id || item.orderCode} className="hover:bg-surface/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-on-surface">
                    #{item.orderCode}
                  </td>
                  <td className="py-4 px-6 font-medium text-on-surface">
                    {item.planName || item.planCode}
                  </td>
                  <td className="py-4 px-6 font-bold text-on-surface">
                    {formattedAmount}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-6 text-xs text-on-surface-variant">
                    {formattedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
          <div>
            Trang {pagination.page} / {totalPages} (Tổng {pagination.total} giao dịch)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Sau <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

PaymentHistoryList.propTypes = {
  historyData: PropTypes.shape({
    items: PropTypes.array,
    pagination: PropTypes.object,
  }),
  loading: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
};

export default PaymentHistoryList;
