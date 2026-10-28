import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ShieldCheck, Search, UserX, UserCheck, Calendar, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/cards/Card';
import { EmptyState } from '../../../components/cards/EmptyState';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Spinner } from '../../../components/feedback/Spinner';
import { Pagination } from '../../../components/navigation/Pagination';
import { SearchBar } from '../../../components/search/SearchBar';
import { cn } from '../../../utils/cn';
import { useBlockedUsers } from '../hooks/useBlockedUsers';

export const BlockedUsersSettingsPage = () => {
  const navigate = useNavigate();
  const {
    items,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    isSearching,
    isLoading,
    errorMessage,
    isSubmitting,
    reload,
    unblock,
  } = useBlockedUsers();
  const [targetToUnblock, setTargetToUnblock] = useState(null);

  const handleConfirmUnblock = async () => {
    if (!targetToUnblock) return;
    const result = await unblock(targetToUnblock);
    if (result.success) setTargetToUnblock(null);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (isLoading && items.length === 0) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Spinner size="lg" className="text-primary mb-3" />
          <p className="text-sm text-text-muted">Đang tải danh sách người dùng đã chặn...</p>
        </div>
      );
    }

    if (errorMessage && items.length === 0) {
      return (
        <EmptyState
          icon={<AlertCircle className="w-6 h-6 text-error stroke-1.75" />}
          title="Không thể tải danh sách chặn"
          description={errorMessage}
          actionLabel="Thử lại"
          onAction={reload}
        />
      );
    }

    if (items.length === 0) {
      return isSearching ? (
        <EmptyState
          icon={<Search className="w-6 h-6 stroke-1.75" />}
          title="Không tìm thấy kết quả phù hợp"
          description={`Không có phụ huynh nào khớp với từ khóa “${search.trim()}”.`}
          actionLabel="Xóa tìm kiếm"
          onAction={() => setSearch('')}
        />
      ) : (
        <EmptyState
          icon={<ShieldCheck className="w-6 h-6 stroke-1.75" />}
          title="Bạn chưa chặn phụ huynh nào"
          description="Khi bạn chặn một người dùng từ trò chuyện hoặc hồ sơ, họ sẽ xuất hiện tại đây."
          actionLabel="Khám phá bạn chơi mới"
          onAction={() => navigate('/discovery')}
        />
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span>Đang hiển thị {items.length} phụ huynh</span>
          <span>Tổng số: {pagination.total}</span>
        </div>

        {items.map((user) => {
          const formattedDate = user.blockedAt ? dayjs(user.blockedAt).format('DD/MM/YYYY') : null;

          return (
            <Card
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar src={user.avatarUrl} alt={user.fullName} size="lg" className="shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-text-primary truncate">
                    {user.fullName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-text-muted">
                    {user.reason && (
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container border border-hairline text-label-sm">
                        Lý do: {user.reason}
                      </span>
                    )}
                    {formattedDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Đã chặn ngày {formattedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetToUnblock(user)}
                leftIcon={<UserCheck className="w-4 h-4" />}
                className="self-end sm:self-auto shrink-0"
              >
                Bỏ chặn
              </Button>
            </Card>
          );
        })}

        {pagination.totalPages > 1 && (
          <div className="pt-4 flex justify-center">
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header Card */}
      <Card padding="lg" className="sticky top-20 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-error-container text-error">
                <UserX className="w-6 h-6 stroke-1.75" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Người dùng đã chặn
              </h1>
            </div>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Người dùng bị chặn sẽ không thể tìm thấy hồ sơ, gửi lời mời kết nối hoặc nhắn tin cho bạn.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={reload}
            disabled={isLoading}
            leftIcon={<RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />}
            className="self-start md:self-auto shrink-0"
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Unblock notice */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline flex items-start gap-3 text-sm text-text-muted">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-text-primary">Lưu ý khi bỏ chặn: </span>
          kết nối bạn bè trước đây sẽ <strong>không</strong> tự động khôi phục. Hai bên cần gửi lại lời mời kết nối để trò chuyện tiếp.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
        placeholder="Tìm kiếm theo tên phụ huynh..."
        className="max-w-md"
      />

      {renderContent()}

      <ConfirmDialog
        open={Boolean(targetToUnblock)}
        title={`Bỏ chặn ${targetToUnblock?.fullName || 'phụ huynh'}?`}
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
