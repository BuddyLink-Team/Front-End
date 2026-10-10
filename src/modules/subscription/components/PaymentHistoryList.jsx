import PropTypes from 'prop-types';
import { Receipt } from 'lucide-react';
import { EmptyState } from '../../../components/cards/EmptyState';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Pagination } from '../../../components/navigation/Pagination';
import { PAYMENT_STATUS_CHIPS } from '../constants/subscriptionConstants';

const StatusBadge = ({ status }) => {
  const chip = PAYMENT_STATUS_CHIPS[(status || '').toLowerCase()];
  return <StatusChip status={chip?.variant || 'cancelled'} label={chip?.label || status || 'Không xác định'} />;
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
        <div className="px-6 py-4 border-t border-outline-variant/40 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div>
            Trang {pagination.page} / {totalPages} (Tổng {pagination.total} giao dịch)
          </div>
          <Pagination currentPage={pagination.page} totalPages={totalPages} onPageChange={onPageChange} />
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
