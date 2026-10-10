import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Search,
  CheckCircle2,
  Check,
  Plus,
  Baby,
  MessageCircle,
  StickyNote,
  PencilLine,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Avatar } from '../../../components/ui/Avatar';
import { FilterChips } from '../../../components/search/FilterChips';
import { FormPageHeader } from '../../../components/form/FormPageHeader';
import { FormSection } from '../../../components/form/FormSection';
import { formatDate } from '../../../utils/formatters';
import { ACTIVITIES } from '../../../constants/activity.constants';
import { PlaceSearchModal } from '../components/PlaceSearchModal';
import { PlaydateSummaryRow } from '../components/PlaydateSummaryRow';
import { useCreatePlaydate } from '../hooks/useCreatePlaydate';

// Quick activity suggestions shown before "Xem tất cả" (the host child's favorites come first)
const ACTIVITY_PREVIEW_COUNT = 8;

// Quick start time presets
const TIME_PRESETS = ['08:00', '09:00', '15:00', '16:30'].map((preset) => ({
  id: preset,
  label: preset,
}));

// Friends shown before "Xem thêm"
const FRIENDS_PREVIEW_COUNT = 6;

export const CreatePlaydatePage = () => {
  const navigate = useNavigate();
  const {
    isPremium,
    playdateLimit,
    todayStr,
    myChildren,
    friends,
    selectedFriends,
    selectedChildId,
    activity,
    scheduledDate,
    time,
    locationName,
    locationAddress,
    errors,
    isLoadingInitialData,
    isSubmitting,
    showNearbyModal,
    register,
    handleSubmit,
    setValue,
    setShowNearbyModal,
    handleToggleFriend,
    handleSelectQuickActivity,
    handleSelectTime,
    handleSelectPlace,
  } = useCreatePlaydate();

  const [showManualLocation, setShowManualLocation] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const selectedChild = myChildren.find((c) => (c._id || c.id)?.toString() === selectedChildId);

  // Suggestions from the shared catalog: the host child's favorite activities first
  const favorites = selectedChild?.favoriteActivities || [];
  const activitySuggestions = [
    ...ACTIVITIES.filter((a) => favorites.includes(a.value)),
    ...ACTIVITIES.filter((a) => !favorites.includes(a.value)),
  ].map(({ value, playdateTitle, icon }) => ({ id: playdateTitle, label: value, icon }));
  const visibleActivitySuggestions = showAllActivities
    ? activitySuggestions
    : activitySuggestions.filter((option, index) => index < ACTIVITY_PREVIEW_COUNT || option.id === activity);
  const visibleFriends = showAllFriends ? friends : friends.slice(0, FRIENDS_PREVIEW_COUNT);
  // Manual inputs open by themselves when a location error can only be fixed there
  const isManualLocationOpen = showManualLocation || (Boolean(errors.location) && !locationName);

  const quotaText = isPremium
    ? 'Gói Premium: không giới hạn cuộc hẹn'
    : `Gói Miễn phí: tối đa ${playdateLimit} cuộc hẹn/tháng`;

  const submitButton = (
    <Button
      type="submit"
      variant="primary"
      size="md"
      isLoading={isSubmitting}
      leftIcon={<Plus className="w-4 h-4" />}
      className="w-full rounded-xl shadow-xs hover:shadow"
    >
      Tạo buổi hẹn
    </Button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto pb-16 space-y-6">
      <FormPageHeader
        title="Tạo cuộc hẹn chơi mới"
        description="Lên lịch buổi chơi và mời bạn bè của bé cùng tham gia"
        onBack={() => navigate('/playdates')}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-surface-container-lowest border border-hairline rounded-2xl p-5 sm:p-8 shadow-2xs">
          {/* Host child */}
          <FormSection
            title="Bé tham gia"
            description="Bé của bạn sẽ là chủ buổi hẹn."
            icon={Baby}
            required
          >
            {isLoadingInitialData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-16 bg-surface-container-low rounded-2xl animate-pulse" />
                <div className="h-16 bg-surface-container-low rounded-2xl animate-pulse" />
              </div>
            ) : myChildren.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline text-center space-y-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myChildren.map((child) => {
                  const childId = (child._id || child.id)?.toString();
                  const isSelected = selectedChildId === childId;
                  return (
                    <button
                      type="button"
                      key={childId}
                      aria-pressed={isSelected}
                      onClick={() => setValue('hostChildId', childId, { shouldValidate: true })}
                      className={`p-3.5 rounded-2xl border transition-colors text-left flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary-soft shadow-2xs'
                          : 'border-hairline hover:border-hairline-strong hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar
                          src={child.avatarUrl}
                          alt={child.displayName}
                          size="md"
                          className="text-primary-dark font-semibold"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {child.displayName}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {child.gender === 'boy' ? 'Bé trai' : 'Bé gái'}
                            {child.interests?.length > 0 && ` • ${child.interests.slice(0, 2).join(', ')}`}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 shrink-0 aspect-square rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-on-primary'
                            : 'border-hairline bg-surface-container-lowest'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.hostChildId && (
              <p className="text-xs text-error">{errors.hostChildId.message}</p>
            )}
          </FormSection>

          {/* Activity */}
          <FormSection
            title="Hoạt động"
            description="Đặt tên buổi hẹn hoặc chọn nhanh một gợi ý. Hoạt động bé yêu thích được xếp lên đầu."
            icon={Sparkles}
            required
          >
            <Input
              placeholder="Ví dụ: Buổi chơi lego cuối tuần"
              {...register('activity')}
              error={errors.activity?.message}
            />
            <FilterChips
              options={visibleActivitySuggestions}
              selected={activity}
              onChange={(value) => value && handleSelectQuickActivity(value)}
              className="flex-wrap"
            />
            {activitySuggestions.length > ACTIVITY_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setShowAllActivities((prev) => !prev)}
                className="text-xs font-medium text-primary-dark hover:underline"
              >
                {showAllActivities ? 'Thu gọn gợi ý' : `Xem tất cả ${activitySuggestions.length} hoạt động`}
              </button>
            )}
          </FormSection>

          {/* Date & time */}
          <FormSection title="Thời gian" icon={CalendarIcon} required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ngày"
                type="date"
                min={todayStr}
                {...register('scheduledDate')}
                error={errors.scheduledDate?.message}
                leftIcon={<CalendarIcon className="w-4 h-4" />}
              />
              <div className="space-y-2">
                <Input
                  label="Giờ"
                  type="time"
                  {...register('time')}
                  error={errors.time?.message}
                  leftIcon={<Clock className="w-4 h-4" />}
                />
                <FilterChips
                  options={TIME_PRESETS}
                  selected={time}
                  onChange={(value) => value && handleSelectTime(value)}
                  className="flex-wrap"
                />
              </div>
            </div>
          </FormSection>

          {/* Place */}
          <FormSection
            title="Địa điểm"
            description="Tìm địa điểm vui chơi gần bạn hoặc nhập địa chỉ thủ công."
            icon={MapPin}
            required
          >
            {isManualLocationOpen ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tên địa điểm"
                    placeholder="Ví dụ: Công viên Biển Đông"
                    {...register('locationName')}
                  />
                  <Input
                    label="Địa chỉ cụ thể"
                    placeholder="Ví dụ: Võ Nguyên Giáp, Phường Phước Mỹ, Đà Nẵng"
                    {...register('locationAddress')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualLocation(false);
                    setShowNearbyModal(true);
                  }}
                  className="text-xs font-medium text-primary-dark hover:underline inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Tìm địa điểm lân cận thay vì nhập tay
                </button>
              </>
            ) : locationName ? (
              <div className="p-3.5 rounded-2xl border border-primary bg-primary-soft flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary-dark flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{locationName}</p>
                  <p className="text-xs text-text-muted truncate">{locationAddress || 'Chưa có địa chỉ'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowNearbyModal(true)}>
                    Đổi
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Sửa địa chỉ thủ công"
                    onClick={() => setShowManualLocation(true)}
                  >
                    <PencilLine className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowNearbyModal(true)}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-hairline-strong hover:border-primary hover:bg-primary-soft/50 transition-colors flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-dark flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">Tìm địa điểm cho bé</p>
                    <p className="text-xs text-text-muted">Công viên, khu vui chơi, thư viện… gần bạn</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualLocation(true)}
                  className="text-xs font-medium text-text-muted hover:text-text-primary hover:underline"
                >
                  Hoặc nhập địa chỉ thủ công
                </button>
              </>
            )}
            {errors.location && (
              <p className="text-xs text-error">{errors.location.message}</p>
            )}
          </FormSection>

          {/* Invited friends */}
          <FormSection
            title="Mời bạn bè"
            description="Chọn bé của các phụ huynh đã kết nối với bạn."
            icon={Users}
            optional
            aside={
              selectedFriends.length > 0 && (
                <span className="font-semibold text-primary-dark">Đã mời {selectedFriends.length} bé</span>
              )
            }
          >
            {isLoadingInitialData ? (
              <div className="h-24 bg-surface-container-low rounded-2xl animate-pulse" />
            ) : friends.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline text-center space-y-2">
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleFriends.map((friend) => (
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

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-hairline/60">
                        {friend.children?.map((c) => {
                          const isInvited = selectedFriends.some(
                            (p) => p.parentId === friend.id && p.childId === (c.id || c._id)
                          );
                          return (
                            <button
                              key={c.id || c._id}
                              type="button"
                              aria-pressed={isInvited}
                              onClick={() => handleToggleFriend(friend, c)}
                              className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                                isInvited
                                  ? 'bg-primary text-primary-on-primary border-primary shadow-2xs font-medium'
                                  : 'bg-surface-container-lowest text-text-muted border-hairline hover:border-primary-border'
                              }`}
                            >
                              <span>{c.displayName}</span>
                              {isInvited && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {friends.length > FRIENDS_PREVIEW_COUNT && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFriends((prev) => !prev)}
                    className="w-full rounded-xl border border-hairline"
                  >
                    {showAllFriends
                      ? 'Thu gọn'
                      : `Xem thêm ${friends.length - FRIENDS_PREVIEW_COUNT} phụ huynh`}
                  </Button>
                )}
              </>
            )}
          </FormSection>

          {/* Note */}
          <FormSection
            title="Ghi chú"
            description="Lời nhắn gửi kèm cho các phụ huynh được mời."
            icon={StickyNote}
            optional
          >
            <Textarea
              rows={3}
              placeholder="Nhắc nhở mang đồ dùng, trang phục, hoặc ghi chú sức khỏe cho các bé..."
              {...register('note')}
              error={errors.note?.message}
            />
          </FormSection>
        </div>

        {/* Summary panel (desktop) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-6">
          <div className="bg-surface-container-lowest border border-hairline rounded-2xl p-6 shadow-2xs space-y-5">
            <p className="text-sm font-semibold text-text-primary">Tóm tắt buổi hẹn</p>
            <div className="space-y-3.5">
              <PlaydateSummaryRow icon={Baby} label="Bé tham gia" value={selectedChild?.displayName} />
              <PlaydateSummaryRow icon={Sparkles} label="Hoạt động" value={activity} />
              <PlaydateSummaryRow
                icon={CalendarIcon}
                label="Thời gian"
                value={[formatDate(scheduledDate), time].filter(Boolean).join(' · ')}
              />
              <PlaydateSummaryRow icon={MapPin} label="Địa điểm" value={locationName} />
              <PlaydateSummaryRow
                icon={Users}
                label="Bạn bè được mời"
                value={selectedFriends.length > 0 ? `${selectedFriends.length} bé` : ''}
              />
            </div>
            <div className="pt-5 border-t border-hairline space-y-3">
              {submitButton}
              <p className="text-xs text-text-muted flex items-start gap-2">
                <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Nhóm chat sẽ được tạo tự động cho tất cả phụ huynh được mời.
              </p>
            </div>
          </div>
          <div
            className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
              isPremium ? 'bg-primary/10 text-primary-dark' : 'bg-surface-container-low text-text-muted'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isPremium ? 'text-primary' : 'text-secondary'}`} />
            <span>{quotaText}</span>
          </div>
        </aside>

        {/* Action bar (mobile & tablet) */}
        <div className="lg:hidden sticky bottom-0 z-10 -mx-6 sm:mx-0 px-6 py-3 bg-surface/95 backdrop-blur border-t border-hairline sm:border sm:rounded-2xl space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
            <span>{quotaText}</span>
            {selectedFriends.length > 0 && (
              <span className="font-semibold text-primary-dark shrink-0">Đã mời {selectedFriends.length} bé</span>
            )}
          </div>
          {submitButton}
        </div>
      </form>

      {/* Place search modal */}
      <PlaceSearchModal
        isOpen={showNearbyModal}
        onClose={() => setShowNearbyModal(false)}
        onSelectPlace={handleSelectPlace}
      />
    </div>
  );
};

export default CreatePlaydatePage;
