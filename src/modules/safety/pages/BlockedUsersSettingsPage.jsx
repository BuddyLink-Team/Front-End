import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Search,
  UserX,
  UserCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Spinner } from '../../../components/feedback/Spinner';
import { Pagination } from '../../../components/navigation/Pagination';
import { useSafetyActions } from '../hooks/useSafetyActions';
import { cn } from '../../../utils/cn';

export const BlockedUsersSettingsPage = () => {
  const navigate = useNavigate();
  const {
    fetchBlockedUsers,
    unblockUser,
    blockedUsers,
    isLoadingBlockedUsers,
    isSubmitting,
    blockedUsersError,
  } = useSafetyActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetToUnblock, setTargetToUnblock] = useState(null);

  // Load blocked users on mount and page change
  useEffect(() => {
    fetchBlockedUsers({ page: currentPage, limit: 10 }).catch(() => {});
  }, [fetchBlockedUsers, currentPage]);

  const items = blockedUsers?.items || [];
  const pagination = blockedUsers?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Local search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter(
      (user) =>
        (user.displayName && user.displayName.toLowerCase().includes(query)) ||
        (user.fullName && user.fullName.toLowerCase().includes(query)) ||
        (user.reason && user.reason.toLowerCase().includes(query)),
    );
  }, [items, searchQuery]);

  // Handle unblock confirm
  const handleConfirmUnblock = async () => {
    if (!targetToUnblock) return;
    const targetId = targetToUnblock.parentId || targetToUnblock.id;
    const displayName = targetToUnblock.displayName || targetToUnblock.fullName || 'Người dùng';

    const result = await unblockUser(targetId, displayName);
    if (result.success) {
      setTargetToUnblock(null);
      // If we unblocked the last item on current page and currentPage > 1, go to previous page
      if (items.length <= 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas pb-16">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-hairline py-6 sticky top-20 z-10 shadow-2xs">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-text-muted hover:text-text-primary rounded-xl"
                aria-label="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-error-container/40 text-error">
                    <UserX className="w-4 h-4" />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                    Danh sách người dùng đã chặn
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-1">
                  Người dùng bị chặn sẽ không thể tìm thấy hồ sơ, gửi lời mời kết nối hoặc nhắn tin cho bạn.
                </p>
              </div>
            </div>

            {/* Quick Refresh */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchBlockedUsers({ page: currentPage, limit: 10 })}
                disabled={isLoadingBlockedUsers}
                className="gap-1.5 text-xs text-text-muted hover:text-text-primary border-hairline"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isLoadingBlockedUsers && 'animate-spin')} />
                <span>Làm mới</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Safe notice banner */}
        <div className="mb-6 p-4 rounded-2xl bg-surface-container-low border border-hairline flex items-start gap-3 text-xs sm:text-sm text-text-muted">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-text-primary">Lưu ý khi mở chặn: </span>
            Khi bạn mở chặn một phụ huynh, mối quan hệ kết nối bạn bè trước đây sẽ <strong>không</strong> tự động phục hồi. Đối phương có thể tìm thấy hồ sơ công khai của bạn và gửi lời mời kết nối lại.
          </div>
        </div>

        {/* Search Bar if there are multiple items */}
        {items.length > 0 && (
          <div className="mb-6 max-w-md">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên phụ huynh hoặc lý do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-text-muted" />}
              className="bg-white border-hairline text-sm rounded-xl"
            />
          </div>
        )}

        {/* Loading State */}
        {isLoadingBlockedUsers && items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Spinner size="lg" className="text-primary mb-3" />
            <p className="text-sm text-text-muted">Đang tải danh sách người dùng đã chặn...</p>
          </div>
        ) : blockedUsersError && items.length === 0 ? (
          /* Error State */
          <div className="py-16 px-4 bg-white rounded-2xl border border-hairline text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-primary mb-1">Không thể tải danh sách chặn</h3>
            <p className="text-xs sm:text-sm text-text-muted mb-4 leading-relaxed">
              Đã xảy ra sự cố khi kết nối tới máy chủ. Vui lòng thử lại.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => fetchBlockedUsers({ page: currentPage, limit: 10 })}
            >
              Thử lại
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 bg-white rounded-2xl border border-hairline text-center max-w-lg mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-primary-soft/50 text-primary flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1.5">
              Bạn chưa chặn phụ huynh nào
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm mx-auto mb-6">
              Không gian kết nối của bạn hiện hoàn toàn an toàn và thoải mái. Khi bạn chặn một người dùng từ trò chuyện hoặc hồ sơ, họ sẽ xuất hiện tại đây.
            </p>
            <Link to="/discovery">
              <Button type="button" variant="primary" size="sm">
                Khám phá bạn chơi mới
              </Button>
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          /* No search results */
          <div className="py-12 px-4 bg-white rounded-2xl border border-hairline text-center max-w-md mx-auto">
            <Search className="w-10 h-10 text-text-muted mx-auto mb-2" />
            <h3 className="text-sm font-bold text-text-primary mb-1">
              Không tìm thấy kết quả phù hợp
            </h3>
            <p className="text-xs text-text-muted mb-3">
              Không tìm thấy phụ huynh nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-primary hover:underline text-xs"
            >
              Xóa tìm kiếm
            </Button>
          </div>
        ) : (
          /* List of Blocked Users */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted px-1 mb-2">
              <span>Đang hiển thị {filteredItems.length} phụ huynh</span>
              <span>Tổng số: {pagination.total}</span>
            </div>

            <div className="grid gap-3">
              {filteredItems.map((user) => {
                const displayName = user.displayName || user.fullName || 'Người dùng BuddyLink';
                const avatar = user.avatar || user.avatarUrl;
                const formattedDate = user.blockedAt
                  ? dayjs(user.blockedAt).format('DD/MM/YYYY')
                  : null;

                return (
                  <div
                    key={user.id || user.parentId}
                    className="bg-white rounded-2xl border border-hairline p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40 shadow-2xs"
                  >
                    {/* User Profile Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar
                        src={avatar}
                        alt={displayName}
                        size="lg"
                        className="border border-hairline shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-text-primary truncate">
                          {displayName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-text-muted">
                          {user.reason && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-text-muted text-label-sm border border-hairline">
                              <span>Lý do: {user.reason}</span>
                            </span>
                          )}
                          {formattedDate && (
                            <span className="inline-flex items-center gap-1 text-outline">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Đã chặn ngày {formattedDate}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unblock Action Button */}
                    <div className="flex items-center justify-end shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setTargetToUnblock(user)}
                        className="gap-1.5 border-hairline text-text-primary hover:border-primary hover:text-primary hover:bg-primary-soft/30 transition-all text-xs font-semibold"
                      >
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span>Bỏ chặn</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Unblock Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(targetToUnblock)}
        title={`Bỏ chặn ${targetToUnblock?.displayName || targetToUnblock?.fullName || 'phụ huynh'}?`}
        description="Sau khi bỏ chặn, phụ huynh này có thể tìm thấy bạn và gửi lời mời kết nối lại. Kết nối bạn bè trước đây sẽ không tự động khôi phục."
        confirmLabel="Bỏ chặn"
        cancelLabel="Hủy"
        variant="warning"
        isLoading={isSubmitting}
        onConfirm={handleConfirmUnblock}
        onCancel={() => setTargetToUnblock(null)}
      />
    </div>
  );
};

export default BlockedUsersSettingsPage;
