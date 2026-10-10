import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, CalendarDays, LayoutGrid, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/cards/EmptyState';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { SearchBar } from '../../../components/search/SearchBar';
import { Pagination } from '../../../components/navigation/Pagination';
import { useToast } from '../../../hooks/useToast';
import { cn } from '../../../utils/cn';
import { PlaydateCard } from '../components/PlaydateCard';
import { PlaydateCalendarView } from '../components/PlaydateCalendarView';
import { PlaydateFilterTabs } from '../components/PlaydateFilterTabs';
import { RescheduleModal } from '../components/RescheduleModal';
import { usePlaydate } from '../hooks/usePlaydate';
import { PLAYDATE_VIEW_MODES } from '../constants/playdateConstants';

const VIEW_MODE_OPTIONS = [
  { id: PLAYDATE_VIEW_MODES.LIST, icon: LayoutGrid, title: 'Dạng danh sách' },
  { id: PLAYDATE_VIEW_MODES.CALENDAR, icon: CalendarDays, title: 'Dạng lịch biểu' },
];

export const PlaydateListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    playdates,
    counts,
    activeTab,
    viewMode,
    searchQuery,
    page,
    totalPages,
    calendarMonth,
    isLoading,
    completingId,
    confirmCompleteId,
    reschedulingPlaydate,
    cancellingPlaydate,
    isCancelling,
    handleTabChange,
    handleViewModeChange,
    handleSearchChange,
    handlePageChange,
    handleCalendarMonthChange,
    promptCompletePlaydate,
    closeConfirmModal,
    handleCompletePlaydate,
    setReschedulingPlaydate,
    setCancellingPlaydate,
    handleConfirmCancel,
    handleRescheduleSuccess,
  } = usePlaydate();

  return (
    <div className="w-full space-y-6 md:space-y-7 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-hairline shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-label-md font-semibold text-primary-dark tracking-widest uppercase select-none">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span>Lịch trình gắn kết</span>
          </div>
          <h1 className="text-headline-lg-mobile sm:text-headline-lg text-text-primary">Quản lý cuộc hẹn chơi</h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            Không gian an lành ghi lại từng khoảnh khắc giao lưu, kết bạn tự nhiên và ấm áp của các con.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/playdates/create')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-full"
          >
            Tạo cuộc hẹn mới
          </Button>
        </div>
      </div>

      {/* 2. Toolbar: tabs, search, view mode */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <PlaydateFilterTabs activeTab={activeTab} onChange={handleTabChange} counts={counts} />

        <div className="flex items-center flex-wrap gap-2.5 self-start xl:self-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm theo hoạt động, địa điểm..."
            className="w-56 sm:w-64"
          />

          <div className="inline-flex items-center p-0.5 bg-surface-container-lowest rounded-full border border-hairline shadow-2xs">
            {VIEW_MODE_OPTIONS.map(({ id, icon: Icon, title }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleViewModeChange(id)}
                aria-pressed={viewMode === id}
                className={cn(
                  'p-1.5 rounded-full transition-colors select-none',
                  viewMode === id ? 'bg-primary-soft text-primary-ink' : 'text-text-muted hover:text-text-primary',
                )}
                title={title}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-surface-container-lowest border border-hairline rounded-3xl p-5 flex items-center gap-5 animate-pulse"
            >
              <div className="w-24 h-28 bg-surface-container-low rounded-2xl shrink-0" />
              <div className="flex-1 w-full space-y-3">
                <div className="h-4 bg-surface-container rounded-full w-1/4" />
                <div className="h-6 bg-surface-container rounded w-2/3" />
                <div className="h-4 bg-surface-container-low rounded w-1/2" />
              </div>
              <div className="h-9 bg-surface-container-low rounded-full w-32 shrink-0" />
            </div>
          ))}
        </div>
      ) : viewMode === PLAYDATE_VIEW_MODES.CALENDAR ? (
        <PlaydateCalendarView
          playdates={playdates}
          onComplete={promptCompletePlaydate}
          completingId={completingId}
          displayedMonth={calendarMonth}
          onMonthChange={handleCalendarMonthChange}
        />
      ) : playdates.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="w-7 h-7" />}
          title="Chưa có cuộc hẹn nào"
          description={
            searchQuery
              ? `Không tìm thấy kết quả nào khớp với "${searchQuery}". Vui lòng thử từ khóa khác.`
              : 'Hãy kết nối với các gia đình lân cận và tạo buổi Playdate đầu tiên cho các bé.'
          }
          actionLabel="Tạo cuộc hẹn ngay"
          onAction={() => navigate('/playdates/create')}
        />
      ) : (
        <div className="space-y-4">
          {playdates.map((item) => (
            <PlaydateCard
              key={item.id}
              playdate={item}
              onComplete={promptCompletePlaydate}
              onReschedule={setReschedulingPlaydate}
              onCancel={setCancellingPlaydate}
              isCompleting={completingId === item.id}
            />
          ))}
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="justify-center pt-2" />
          )}
        </div>
      )}

      {/* 4. Safety guideline banner */}
      <div className="bg-primary-soft border border-primary-border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary-on-fixed-variant flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary-on-container">Nguyên tắc hẹn gặp an lành</h4>
            <p className="text-xs text-primary-ink mt-0.5">
              Phụ huynh luôn đồng hành cùng các bé tại địa điểm công cộng thoáng mát, có giám sát thân thiện.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            toast.toast(
              'Cẩm nang an toàn: Luôn chọn địa điểm công cộng thông thoáng, kiểm tra kỹ thông tin bạn bè và luôn có phụ huynh giám sát các bé.',
              { duration: 4000 },
            )
          }
          className="text-xs font-semibold text-primary-dark hover:underline self-end sm:self-auto shrink-0 select-none"
        >
          Xem cẩm nang an toàn
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(confirmCompleteId)}
        title="Xác nhận hoàn thành buổi hẹn"
        description="Bạn có chắc chắn muốn chuyển trạng thái buổi hẹn này sang 'Đã hoàn thành'? Nếu không xác nhận, hệ thống sẽ tự hoàn thành vào 0h ngày hôm sau."
        confirmLabel="Đánh dấu hoàn thành"
        cancelLabel="Hủy"
        variant="info"
        isLoading={completingId === confirmCompleteId}
        onConfirm={() => handleCompletePlaydate(confirmCompleteId)}
        onCancel={closeConfirmModal}
      />

      <ConfirmDialog
        open={Boolean(cancellingPlaydate)}
        title="Xác nhận hủy cuộc hẹn"
        description={`Bạn có chắc chắn muốn hủy cuộc hẹn "${cancellingPlaydate?.activity}"? Thông báo hủy sẽ được gửi đến tất cả phụ huynh tham gia.`}
        confirmLabel="Xác nhận hủy"
        cancelLabel="Đóng"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingPlaydate(null)}
      />

      {reschedulingPlaydate && (
        <RescheduleModal
          isOpen={Boolean(reschedulingPlaydate)}
          playdate={reschedulingPlaydate}
          onClose={() => setReschedulingPlaydate(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
};

export default PlaydateListPage;
