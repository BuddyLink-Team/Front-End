import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Plus,
  Baby,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Avatar } from '../../../components/ui/Avatar';
import { Modal } from '../../../components/feedback/Modal';
import { PlaceSearchModal } from '../components/PlaceSearchModal';
import { useCreatePlaydate } from '../hooks/useCreatePlaydate';

// Quick activity suggestions
const ACTIVITY_SUGGESTIONS = [
  { label: 'Xếp hình Lego 🧩', value: 'Buổi chơi xếp hình Lego & giao lưu' },
  { label: 'Dã ngoại công viên 🌳', value: 'Dã ngoại & vận động tại công viên' },
  { label: 'Vẽ tranh & Sáng tạo 🎨', value: 'Buổi vẽ tranh sáng tạo ngoài trời' },
  { label: 'Đá bóng & Vận động ⚽', value: 'Đá bóng & trò chơi rèn luyện thể chất' },
  { label: 'Đọc sách & Kể chuyện 📚', value: 'Giao lưu đọc sách & kể chuyện cho bé' },
  { label: 'Khu vui chơi giải trí 🎪', value: 'Vui chơi trải nghiệm tại khu giải trí' },
  { label: 'Làm bánh & Nấu ăn 🧁', value: 'Lớp học làm bánh mini cho các bé' },
];

// Quick time slot presets
const TIME_PRESETS = [
  '09:00 - 11:00',
  '14:00 - 16:00',
  '15:30 - 17:30',
  '17:00 - 19:00',
];

export const CreatePlaydatePage = () => {
  const navigate = useNavigate();
  const {
    isPremium,
    todayStr,
    myChildren,
    friends,
    selectedFriends,
    selectedChildId,
    activity,
    time,
    errors,
    isLoadingInitialData,
    isSubmitting,
    showNearbyModal,
    quotaExceededModal,
    register,
    handleSubmit,
    setValue,
    setShowNearbyModal,
    setQuotaExceededModal,
    handleToggleFriend,
    handleSelectQuickActivity,
    handleSelectTime,
    handleSelectPlace,
  } = useCreatePlaydate();

  return (
    <div className="w-full pb-16 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/playdates')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="rounded-xl border border-hairline hover:bg-white"
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
              Tạo cuộc hẹn chơi mới
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Lên lịch Playdate, mời bạn bè cùng tham gia và tự động khởi tạo nhóm trò chuyện
            </p>
          </div>
        </div>

        {/* Subscription Quota Indicator Badge */}
        {isPremium ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary-dark shrink-0 self-start sm:self-auto font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Gói Premium: <strong>Không giới hạn cuộc hẹn</strong></span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-hairline text-xs text-text-muted shrink-0 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Gói Miễn phí: <strong>Tối đa 3 cuộc hẹn/tháng</strong></span>
          </div>
        )}
      </div>

      {/* Main White Card Layout */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-hairline rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xs space-y-8">
          {/* SECTION 1: CHỌN BÉ THAM GIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Baby className="w-4 h-4 text-primary" />
                1. Chọn bé tham gia của bạn <span className="text-error">*</span>
              </label>
              {myChildren.length > 0 && (
                <span className="text-xs text-text-muted">{myChildren.length} hồ sơ bé</span>
              )}
            </div>

            {isLoadingInitialData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <div className="h-16 bg-surface-subtle rounded-2xl animate-pulse" />
                <div className="h-16 bg-surface-subtle rounded-2xl animate-pulse" />
              </div>
            ) : myChildren.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline text-center space-y-2">
                <p className="text-sm text-text-muted">Bạn chưa có hồ sơ bé nào.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/children/add')}
                >
                  Tạo hồ sơ cho bé ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {myChildren.map((child) => {
                  const childId = (child._id || child.id)?.toString();
                  const isSelected = selectedChildId === childId;
                  return (
                    <div
                      key={childId}
                      onClick={() => setValue('hostChildId', childId, { shouldValidate: true })}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-2xs'
                          : 'border-hairline hover:border-gray-300 hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={child.avatarUrl}
                          alt={child.displayName}
                          size="md"
                          className="bg-primary/20 text-primary-dark font-semibold"
                        />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {child.displayName}
                          </p>
                          <p className="text-xs text-text-muted">
                            {child.gender === 'boy' ? 'Bé trai' : 'Bé gái'}
                            {child.interests?.length > 0 && ` • ${child.interests.slice(0, 2).join(', ')}`}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-hairline bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.hostChildId && (
              <p className="text-xs text-error">{errors.hostChildId.message}</p>
            )}
          </div>

          {/* SECTION 2: MỜI BẠN BÈ THAM GIA */}
          <div className="space-y-3 pt-6 border-t border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary" />
                  2. Mời gia đình bạn bè tham gia
                </label>
                <p className="text-xs text-text-muted mt-0.5">
                  Chọn các phụ huynh trong danh sách kết nối đã chấp thuận để cùng vui chơi
                </p>
              </div>
              <span className="text-xs text-primary font-semibold">
                Đã chọn: {selectedFriends.length} bạn bè
              </span>
            </div>

            {isLoadingInitialData ? (
              <div className="h-24 bg-surface-subtle rounded-2xl animate-pulse" />
            ) : friends.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline text-center space-y-2">
                <p className="text-sm text-text-muted">
                  Bạn chưa có phụ huynh kết nối nào có hồ sơ bé phù hợp để mời.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/discovery')}
                >
                  Khám phá thêm bạn bè
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3.5 rounded-2xl border border-hairline bg-surface-container-low/30 space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={friend.avatarUrl}
                        alt={friend.fullName}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {friend.fullName}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {friend.children?.length || 0} bé
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-hairline/60">
                      {friend.children?.map((c) => {
                        const isInvited = selectedFriends.some(
                          (p) => p.parentId === friend.id && p.childId === (c.id || c._id)
                        );
                        return (
                          <button
                            key={c.id || c._id}
                            type="button"
                            onClick={() => handleToggleFriend(friend, c)}
                            className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                              isInvited
                                ? 'bg-primary text-white border-primary shadow-2xs font-medium'
                                : 'bg-white text-text-muted border-hairline hover:border-primary/40'
                            }`}
                          >
                            <span>{c.displayName}</span>
                            {isInvited && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: HOẠT ĐỘNG & GỢI Ý */}
          <div className="space-y-3 pt-6 border-t border-hairline">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tertiary-dark" />
              3. Hoạt động & Gợi ý hoạt động nhanh <span className="text-error">*</span>
            </label>

            <Input
              placeholder="Nhập tên hoạt động hoặc buổi hẹn (Ví dụ: Buổi chơi lego cuối tuần)..."
              {...register('activity')}
              error={errors.activity?.message}
            />

            {/* Quick Activity Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-xs text-text-muted">Gợi ý hoạt động phổ biến:</span>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectQuickActivity(item.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all select-none ${
                      activity === item.value
                        ? 'bg-tertiary text-tertiary-on-container border-tertiary font-medium shadow-2xs'
                        : 'bg-surface-subtle text-text-muted border-hairline hover:border-gray-300 hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: BỘ CHỌN NGÀY & GIỜ */}
          <div className="space-y-3 pt-6 border-t border-hairline">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              4. Bộ chọn ngày & giờ thân thiện <span className="text-error">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ngày diễn ra *"
                type="date"
                min={todayStr}
                {...register('scheduledDate')}
                error={errors.scheduledDate?.message}
                leftIcon={<CalendarIcon className="w-4 h-4" />}
              />

              <div className="space-y-1.5">
                <Input
                  label="Khung giờ diễn ra *"
                  placeholder="Ví dụ: 15:30 - 17:30 hoặc 09:00"
                  {...register('time')}
                  error={errors.time?.message}
                  leftIcon={<Clock className="w-4 h-4" />}
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectTime(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        time === preset
                          ? 'bg-primary/10 border-primary text-primary-dark font-medium'
                          : 'bg-surface-subtle text-text-muted border-hairline hover:border-gray-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: ĐỊA ĐIỂM HẸN CHƠI */}
          <div className="space-y-3 pt-6 border-t border-hairline">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-error" />
                5. Địa điểm hẹn chơi <span className="text-error">*</span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNearbyModal(true)}
                leftIcon={<Compass className="w-4 h-4 text-secondary" />}
                className="text-xs rounded-xl border-secondary/30 text-secondary-dark hover:bg-secondary/5"
              >
                Tìm kiếm địa điểm lân cận
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên địa điểm *"
                placeholder="Ví dụ: Công viên Cầu Ánh Sao"
                {...register('locationName')}
              />
              <Input
                label="Địa chỉ cụ thể *"
                placeholder="Ví dụ: Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM"
                {...register('locationAddress')}
              />
            </div>
            {errors.location && (
              <p className="text-xs text-error mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* SECTION 6: GHI CHÚ BỔ SUNG */}
          <div className="space-y-3 pt-6 border-t border-hairline">
            <Textarea
              label="Ghi chú thêm cho phụ huynh (Tùy chọn)"
              rows={3}
              placeholder="Nhắc nhở mang đồ dùng, trang phục, hoặc ghi chú sức khỏe cho các bé..."
              {...register('note')}
              error={errors.note?.message}
            />
          </div>

          {/* FORM FOOTER ACTIONS */}
          <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted text-center sm:text-left">
              Hệ thống sẽ tự động tạo phòng chat nhóm cho tất cả phụ huynh được mời.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto rounded-xl shadow-xs hover:shadow"
            >
              Tạo lời mời & Buổi hẹn
            </Button>
          </div>
        </div>
      </form>

      {/* Place search modal */}
      <PlaceSearchModal
        isOpen={showNearbyModal}
        onClose={() => setShowNearbyModal(false)}
        onSelectPlace={handleSelectPlace}
      />

      {/* Quota Exceeded Modal */}
      <Modal
        isOpen={quotaExceededModal}
        onClose={() => setQuotaExceededModal(false)}
        title="Đã đạt giới hạn cuộc hẹn"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              Nâng cấp gói BuddyLink Premium
            </p>
            <p className="text-xs text-text-muted">
              Tài khoản gói Miễn phí được tạo tối đa <strong>3 cuộc hẹn chơi trong mỗi tháng</strong>.
              Hãy nâng cấp lên gói BuddyLink Premium để tạo không giới hạn cuộc hẹn và nhận các tính năng kết nối thông minh!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuotaExceededModal(false)}
              className="rounded-xl"
            >
              Để sau
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setQuotaExceededModal(false);
                navigate('/subscription');
              }}
              className="rounded-xl shadow-xs"
            >
              Nâng cấp ngay
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePlaydatePage;
