import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  Star,
  Baby,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/cards/EmptyState';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { PlaydateCard } from '../components/PlaydateCard';
import { PlaydateCalendarView } from '../components/PlaydateCalendarView';
import { RescheduleModal } from '../components/RescheduleModal';
import { usePlaydate } from '../hooks/usePlaydate';
import { PLAYDATE_VIEW_MODES, PLAYDATE_TABS } from '../constants/playdateConstants';
import { playdateApi } from '../api/playdateApi';

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
    fetchPlaydates,
    handleTabChange,
    handleViewModeChange,
    handleSearchChange,
    promptCompletePlaydate,
    closeConfirmModal,
    handleCompletePlaydate,
  } = usePlaydate();

  // Reschedule & Cancel modals state
  const [reschedulingPlaydate, setReschedulingPlaydate] = useState(null);
  const [cancellingPlaydate, setCancellingPlaydate] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Trigger reschedule from top header button (picks first upcoming playdate or prompts)
  const handleTopRescheduleClick = () => {
    const upcomingItem = playdates.find((p) => p.status === 'upcoming');
    if (upcomingItem) {
      setReschedulingPlaydate(upcomingItem);
    } else {
      toast('Không có cuộc hẹn sắp tới nào để dời lịch.');
    }
  };

  // Execute cancel action
  const handleConfirmCancel = async () => {
    if (!cancellingPlaydate) return;
    setIsCancelling(true);
    try {
      await playdateApi.cancelPlaydate(cancellingPlaydate.id, {
        reason: 'Hủy bởi phụ huynh tổ chức',
      });
      toast.success('Đã hủy cuộc hẹn chơi thành công.');
      setCancellingPlaydate(null);
      fetchPlaydates();
    } catch (err) {
      toast.error('Không thể hủy cuộc hẹn. Vui lòng thử lại sau.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-7 pb-16 max-w-6xl mx-auto">
      {/* 1. Page Header matching Stitch layout */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-2">
          {/* Top Label */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B7A48] tracking-widest uppercase select-none">
            <span className="w-2 h-2 rounded-full bg-[#5B9A68] inline-block" />
            <span>LỊCH TRÌNH GẮN KẾT</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Quản lý cuộc hẹn chơi
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
            Không gian an lành ghi lại từng khoảnh khắc giao lưu, kết bạn tự nhiên và ấm áp của các con.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
          {/* Thử dời lịch */}
          <button
            type="button"
            onClick={handleTopRescheduleClick}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-[#EEF5F9] text-[#2C5E7A] hover:bg-[#DEECF4] border border-[#D1E3EE] transition-all cursor-pointer select-none"
            title="Dời lịch cuộc hẹn sắp tới"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#2C5E7A]" />
            <span>Thử dời lịch</span>
          </button>

          {/* Đánh giá buổi chơi */}
          <button
            type="button"
            onClick={() => handleTabChange('completed')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-[#FDECC8] text-[#8C5E14] hover:bg-[#F9DFAC] border border-[#F5D899] transition-all cursor-pointer select-none"
          >
            <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
            <span>Đánh giá buổi chơi</span>
          </button>

          {/* Tạo cuộc hẹn mới */}
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate('/playdates/create')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#5B9A68] hover:bg-[#4C8558] text-white shadow-xs hover:shadow transition-all"
          >
            Tạo cuộc hẹn mới
          </Button>
        </div>
      </div>

      {/* 2. Control Toolbar: Tabs & Filters matching Stitch layout */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left Side: Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {PLAYDATE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 select-none whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#EBF5ED] text-[#2C6E3D] border border-[#CDE5D1] shadow-2xs'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-[#CDE5D1] text-[#1E4D2B]'
                      : 'bg-slate-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Quick Filters & Search & View Mode Switcher */}
        <div className="flex items-center flex-wrap gap-2.5 self-start xl:self-auto">
          <span className="text-xs text-gray-500 font-medium">Lọc theo:</span>

          {/* Child filter chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-gray-700 shadow-2xs select-none">
            <Baby className="w-3.5 h-3.5 text-[#5B9A68]" />
            <span>Bé Bơ (4 tuổi)</span>
          </div>

          {/* Month filter chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-gray-700 shadow-2xs select-none">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Tháng 10/2026</span>
          </div>

          {/* Search Input */}
          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5B9A68]/20 focus:border-[#5B9A68] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: List vs Calendar */}
          <div className="inline-flex items-center p-0.5 bg-white rounded-full border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleViewModeChange(PLAYDATE_VIEW_MODES.LIST)}
              className={`p-1.5 rounded-full transition-all select-none cursor-pointer ${
                viewMode === PLAYDATE_VIEW_MODES.LIST
                  ? 'bg-[#EBF5ED] text-[#2C6E3D]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Dạng danh sách thẻ ngang"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange(PLAYDATE_VIEW_MODES.CALENDAR)}
              className={`p-1.5 rounded-full transition-all select-none cursor-pointer ${
                viewMode === PLAYDATE_VIEW_MODES.CALENDAR
                  ? 'bg-[#EBF5ED] text-[#2C6E3D]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Dạng lịch biểu"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Horizontal Cards Stack */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-5 animate-pulse"
            >
              <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl shrink-0" />
              <div className="flex-1 w-full space-y-3">
                <div className="h-4 bg-slate-200 rounded-full w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-9 bg-slate-100 rounded-full w-32 shrink-0" />
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
          icon={<CalendarIcon className="w-7 h-7 text-[#5B9A68]" />}
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
        <div className="space-y-4 md:space-y-4">
          {playdates.map((item) => (
            <PlaydateCard
              key={item.id}
              playdate={item}
              onComplete={promptCompletePlaydate}
              onReschedule={(pd) => setReschedulingPlaydate(pd)}
              onCancel={(pd) => setCancellingPlaydate(pd)}
              isCompleting={completingId === item.id}
            />
          ))}
        </div>
      )}

      {/* 4. Bottom Safety Guideline Banner matching Stitch layout */}
      <div className="bg-[#EAF5EC] border border-[#D5EBD9] rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#BBE2C4] text-[#2C6E3D] flex items-center justify-center font-bold text-sm shrink-0 select-none">
            &lt;
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B4325]">
              Nguyên tắc hẹn gặp an lành
            </h4>
            <p className="text-xs text-[#3A6B46] mt-0.5">
              Phụ huynh luôn đồng hành cùng các bé tại địa điểm công cộng thoáng mát, có giám sát thân thiện.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            toast(
              'Cẩm nang an toàn: Luôn lựa chọn địa điểm công cộng thông thoáng, kiểm tra kỹ thông tin bạn bè và luôn có phụ huynh giám sát các bé.',
              { icon: '🛡️', duration: 4000 }
            )
          }
          className="text-xs font-bold text-[#2C6E3D] hover:text-[#1B4325] hover:underline self-end sm:self-auto shrink-0 cursor-pointer select-none"
        >
          Xem cẩm nang an toàn
        </button>
      </div>

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

      {/* Cancel Playdate Confirmation Dialog */}
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

      {/* Reschedule Modal */}
      {reschedulingPlaydate && (
        <RescheduleModal
          isOpen={Boolean(reschedulingPlaydate)}
          playdate={reschedulingPlaydate}
          onClose={() => setReschedulingPlaydate(null)}
          onSuccess={() => {
            setReschedulingPlaydate(null);
            fetchPlaydates();
          }}
        />
      )}
    </div>
  );
};

export default PlaydateListPage;
