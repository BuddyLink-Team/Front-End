import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/cards/EmptyState';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { PlaydateCard } from '../components/PlaydateCard';
import { PlaydateCalendarView } from '../components/PlaydateCalendarView';
import { PlaydateFilterTabs } from '../components/PlaydateFilterTabs';
import { usePlaydate } from '../hooks/usePlaydate';
import { PLAYDATE_VIEW_MODES } from '../constants/playdateConstants';

export const PlaydateListPage = () => {
  const navigate = useNavigate();
  const {
    playdates,
    counts,
    activeTab,
    viewMode,
    searchQuery,
    isLoading,
    completingId,
    confirmCompleteId,
    handleTabChange,
    handleViewModeChange,
    handleSearchChange,
    promptCompletePlaydate,
    closeConfirmModal,
    handleCompletePlaydate,
  } = usePlaydate();

  return (
    <div className="space-y-6 md:space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-hairline shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
              Quản lý Playdate & Lịch hẹn
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-dark border border-primary/20">
              <Sparkles className="w-3 h-3" /> Dashboard
            </span>
          </div>
          <p className="text-sm text-text-muted">
            Theo dõi, điều phối các buổi hẹn chơi và duy trì chuỗi gắn kết hàng tuần cho bé
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate('/playdates/create')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-xs hover:shadow"
          >
            Lên lịch hẹn mới
          </Button>
        </div>
      </div>

      {/* Control Toolbar: Tabs, View Switcher & Search */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <PlaydateFilterTabs
            activeTab={activeTab}
            onChange={handleTabChange}
            counts={counts}
          />

          {/* View Mode Toggle: List vs Calendar */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm hoạt động, địa điểm..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* View Switcher Button Group */}
            <div className="inline-flex items-center p-1 bg-[#f0f4f2] rounded-xl border border-hairline">
              <button
                type="button"
                onClick={() => handleViewModeChange(PLAYDATE_VIEW_MODES.LIST)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all select-none ${
                  viewMode === PLAYDATE_VIEW_MODES.LIST
                    ? 'bg-white text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Dạng danh sách thẻ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange(PLAYDATE_VIEW_MODES.CALENDAR)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all select-none ${
                  viewMode === PLAYDATE_VIEW_MODES.CALENDAR
                    ? 'bg-white text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Dạng lịch biểu"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lịch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white border border-hairline rounded-2xl p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
              <div className="h-10 bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : viewMode === PLAYDATE_VIEW_MODES.CALENDAR ? (
        <PlaydateCalendarView
          playdates={playdates}
          onComplete={promptCompletePlaydate}
          completingId={completingId}
        />
      ) : playdates.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="w-7 h-7 text-primary" />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {playdates.map((item) => (
            <PlaydateCard
              key={item.id}
              playdate={item}
              onComplete={promptCompletePlaydate}
              isCompleting={completingId === item.id}
            />
          ))}
        </div>
      )}

      {/* Complete Playdate Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmCompleteId)}
        title="Xác nhận hoàn thành buổi hẹn"
        description="Bạn có chắc chắn muốn chuyển trạng thái buổi hẹn này sang 'Đã hoàn thành'? Hệ thống sẽ ghi nhận chuỗi tuần và cho phép các gia đình gửi đánh giá."
        confirmLabel="Đánh dấu hoàn thành"
        cancelLabel="Hủy"
        variant="info"
        isLoading={completingId === confirmCompleteId}
        onConfirm={() => handleCompletePlaydate(confirmCompleteId)}
        onCancel={closeConfirmModal}
      />
    </div>
  );
};

export default PlaydateListPage;
