import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Check,
  Plus,
  MessageCircle,
  PencilLine,
  Timer,
  Navigation,
  Ticket,
  RefreshCw,
  Trash2,
  Shapes,
  StickyNote,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Combobox } from '../../../components/ui/Combobox';
import { Textarea } from '../../../components/ui/Textarea';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/badges/StatusChip';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { FilterChips } from '../../../components/search/FilterChips';
import { SearchBar } from '../../../components/search/SearchBar';
import { FormPageHeader } from '../../../components/form/FormPageHeader';
import { cn } from '../../../utils/cn';
import { ACTIVITIES, ACTIVITY_GROUPS } from '../../../constants/activity.constants';
import { ICON_STROKE } from '../../../constants/icon.constants';
import { PlaceSearchModal } from '../components/PlaceSearchModal';
import { RescheduleModal } from '../components/RescheduleModal';
import { PlaymateSelector } from '../components/PlaymateSelector';
import { ScheduleAvailability } from '../components/ScheduleAvailability';
import { PlaydateFormLayout, ReadOnlyField } from '../components/PlaydateFormLayout';
import { ParticipantCard, PlaydateBanners } from '../components/PlaydateDetailParts';
import { TimeSlotSuggestions, PlaceSuggestionList, ActivitySuggestionChips } from '../components/PlanningSuggestions';
import { PlaydateRatingsSection } from '../../rating-feedback/components/PlaydateRatingsSection';
import { useCreatePlaydate } from '../hooks/useCreatePlaydate';
import { usePlaydateDetail } from '../hooks/usePlaydateDetail';
import { getDurationOptions, formatDurationLabel, DEFAULT_PLAYDATE_DURATION } from '../constants/playdateConstants';
import { addMinutesToTime, formatPlaydateTimeRange } from '../utils/playdateTime';
import { googleMapsDirectionsUrl, toLngLat } from '../utils/placeLinks';
import { formatDate } from '../../../utils/formatters';

const toActivityOption = (group) => (activity) => ({
  value: activity.playdateTitle,
  label: activity.playdateTitle,
  description: activity.value,
  icon: activity.icon,
  group,
});

// Quick start time presets
const TIME_PRESETS = ['08:00', '09:00', '15:00', '16:30'].map((preset) => ({ id: preset, label: preset }));

const MAPS_LINK_CLASS = 'inline-flex items-center gap-1 text-label-sm font-semibold text-primary-dark hover:underline';

// Title of a part inside a step (e.g. "Mời bạn chơi" in "Bé & bạn chơi")
const PartHeading = ({ icon: Icon, children, aside }) => (
  <div className="flex items-center justify-between gap-3 pt-2">
    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
      <Icon className="w-4 h-4 text-primary" strokeWidth={ICON_STROKE.DEFAULT} />
      {children}
    </h3>
    {aside && <span className="text-xs shrink-0">{aside}</span>}
  </div>
);

PartHeading.propTypes = {
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
  aside: PropTypes.node,
};

// ---------------------------------------------------------------------------
// Create: child first, then playmates, then time / place / activity with suggestions
// ---------------------------------------------------------------------------

const CreatePlaydateForm = () => {
  const navigate = useNavigate();
  const {
    isPremium,
    playdateLimit,
    todayStr,
    myChildren,
    playmates,
    friendSearch,
    setFriendSearch,
    isLoadingPlaymates,
    hasLoadedPlaymates,
    selectedFriends,
    selectedChildIds,
    selectedChildId,
    activity,
    scheduledDate,
    time,
    durationMinutes,
    suggestedDuration,
    locationName,
    locationAddress,
    locationCoordinates,
    errors,
    isLoadingInitialData,
    isSubmitting,
    showNearbyModal,
    placeToView,
    suggestions,
    scheduleCheck,
    register,
    handleSubmit,
    setShowNearbyModal,
    closePlaceModal,
    handleSelectChild,
    handleTogglePlaymate,
    handleChangeActivity,
    handleSelectSuggestedActivity,
    handleChangeDuration,
    handleSelectTime,
    handleSelectTimeSlot,
    handleSelectPlace,
    handleSelectSuggestedPlace,
    handleViewSuggestedPlace,
  } = useCreatePlaydate();

  const [showManualLocation, setShowManualLocation] = useState(false);

  const selectedChild = myChildren.find((c) => (c._id || c.id)?.toString() === selectedChildId);
  const hasPlaymates = playmates.matched.length > 0 || playmates.others.length > 0;
  const { timeSlots, places, activities } = suggestions;

  // Every activity of the catalog, the host child's favorites first, then by category
  const favoriteActivities = selectedChild?.favoriteActivities;
  const activityOptions = useMemo(() => {
    const favorites = favoriteActivities || [];
    return [
      ...ACTIVITIES.filter((a) => favorites.includes(a.value)).map(toActivityOption('Bé yêu thích')),
      ...ACTIVITY_GROUPS.flatMap((group) =>
        group.activities.filter((a) => !favorites.includes(a.value)).map(toActivityOption(group.label))
      ),
    ];
  }, [favoriteActivities]);
  // Manual inputs open by themselves when a location error can only be fixed there
  const isManualLocationOpen = showManualLocation || (Boolean(errors.location) && !locationName);
  const endTime = addMinutesToTime(time, durationMinutes);
  const selectedPlaceMapsUrl = googleMapsDirectionsUrl(toLngLat(locationCoordinates));

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

  const childPicker = isLoadingInitialData ? (
    <div className="h-11 w-2/3 bg-surface-container-low rounded-full animate-pulse" />
  ) : myChildren.length === 0 ? (
    <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-text-muted">Bạn chưa có hồ sơ bé nào.</p>
      <Button type="button" variant="outline" size="sm" onClick={() => navigate('/children/create')}>
        Tạo hồ sơ cho bé ngay
      </Button>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Bé tham gia">
      {myChildren.map((child) => {
        const childId = (child._id || child.id)?.toString();
        const isSelected = selectedChildId === childId;
        return (
          <button
            type="button"
            key={childId}
            aria-pressed={isSelected}
            onClick={() => handleSelectChild(childId)}
            className={cn(
              'pl-1.5 pr-3 py-1.5 rounded-full border transition-colors flex items-center gap-2',
              isSelected
                ? 'border-primary bg-primary-soft shadow-2xs'
                : 'border-hairline hover:border-hairline-strong hover:bg-surface-container-low'
            )}
          >
            <Avatar src={child.avatarUrl} alt={child.displayName} size="sm" className="text-primary-dark font-semibold" />
            <span className="text-sm font-semibold text-text-primary">{child.displayName}</span>
            {isSelected && <Check className="w-4 h-4 text-primary" strokeWidth={ICON_STROKE.BOLD} />}
          </button>
        );
      })}
    </div>
  );

  const renderPlaymates = () => {
    if (!hasLoadedPlaymates) return <div className="h-24 bg-surface-container-low rounded-2xl animate-pulse" />;
    if (!friendSearch && !isLoadingPlaymates && !hasPlaymates) {
      return (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-muted">Bạn chưa có phụ huynh kết nối nào có hồ sơ bé phù hợp để mời.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/discovery')}>
            Khám phá thêm bạn bè
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <SearchBar
          value={friendSearch}
          onChange={setFriendSearch}
          onClear={() => setFriendSearch('')}
          placeholder="Tìm phụ huynh theo tên..."
        />
        {hasPlaymates ? (
          <PlaymateSelector
            matched={playmates.matched}
            others={playmates.others}
            selectedChildIds={selectedChildIds}
            onToggle={handleTogglePlaymate}
            isRefreshing={isLoadingPlaymates}
          />
        ) : (
          <p className="text-sm text-text-muted text-center py-4">
            {isLoadingPlaymates ? 'Đang tìm…' : <>Không tìm thấy phụ huynh nào khớp với &quot;{friendSearch}&quot;.</>}
          </p>
        )}
      </div>
    );
  };

  const renderPlace = () => {
    if (isManualLocationOpen) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Tên địa điểm" placeholder="Ví dụ: Công viên Biển Đông" {...register('locationName')} />
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
      );
    }
    if (locationName) {
      return (
        <div className="p-3.5 rounded-2xl border border-primary bg-primary-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary-dark flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary break-words">{locationName}</p>
            <p className="text-xs text-text-muted break-words">{locationAddress || 'Chưa có địa chỉ'}</p>
            {selectedPlaceMapsUrl && (
              <a href={selectedPlaceMapsUrl} target="_blank" rel="noopener noreferrer" className={cn(MAPS_LINK_CLASS, 'mt-0.5')}>
                <Navigation className="w-3 h-3" /> Chỉ đường trên Google Maps
              </a>
            )}
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
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Search className="w-4 h-4" />}
          onClick={() => setShowNearbyModal(true)}
        >
          Tìm địa điểm khác cho bé
        </Button>
        <button
          type="button"
          onClick={() => setShowManualLocation(true)}
          className="text-xs font-medium text-text-muted hover:text-text-primary hover:underline"
        >
          Hoặc nhập địa chỉ thủ công
        </button>
      </div>
    );
  };

  const steps = {
    family: (
      <>
        {childPicker}
        {errors.hostChildId && <p className="text-xs text-error">{errors.hostChildId.message}</p>}
        {selectedChildId && (
          <>
            <PartHeading
              icon={Users}
              aside={
                selectedFriends.length > 0 ? (
                  <span className="font-semibold text-primary-dark">Đã mời {selectedFriends.length} bé</span>
                ) : (
                  <span className="text-text-muted">Tùy chọn</span>
                )
              }
            >
              Mời bạn chơi
            </PartHeading>
            {renderPlaymates()}
          </>
        )}
      </>
    ),
    schedule: (
      <>
        {selectedChildId && (
          <TimeSlotSuggestions
            slots={timeSlots.items}
            isLoading={timeSlots.isLoading}
            isRefreshing={timeSlots.isRefreshing}
            selectedDate={scheduledDate}
            selectedTime={time}
            onSelect={handleSelectTimeSlot}
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              label="Giờ bắt đầu"
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
          <div className="space-y-2">
            <Select
              label="Thời lượng"
              id="durationMinutes"
              options={getDurationOptions(durationMinutes)}
              placeholder=""
              value={String(durationMinutes)}
              onChange={(e) => handleChangeDuration(e.target.value)}
              error={errors.durationMinutes?.message}
            />
            {endTime && (
              <p className="flex items-center gap-1.5 text-xs text-text-muted">
                <Timer className="w-3.5 h-3.5" strokeWidth={ICON_STROKE.THIN} />
                Kết thúc lúc {endTime}
              </p>
            )}
            {suggestedDuration && suggestedDuration !== durationMinutes && (
              <button
                type="button"
                onClick={() => handleChangeDuration(String(suggestedDuration))}
                className="text-xs font-medium text-primary-dark hover:underline text-left"
              >
                Dùng thời lượng gợi ý cho hoạt động: {formatDurationLabel(suggestedDuration)}
              </button>
            )}
          </div>
        </div>
        {selectedChildId && scheduledDate && <ScheduleAvailability {...scheduleCheck} onPickFreeTime={handleSelectTime} />}
        <div className="border-t border-hairline pt-4 space-y-3">
          {selectedChildId && (
            <PlaceSuggestionList
              places={places.items}
              isLoading={places.isLoading}
              isRefreshing={places.isRefreshing}
              selectedName={locationName}
              onSelect={handleSelectSuggestedPlace}
              onViewDetail={handleViewSuggestedPlace}
            />
          )}
          {renderPlace()}
          {errors.location && <p className="text-xs text-error">{errors.location.message}</p>}
        </div>
      </>
    ),
    activity: (
      <>
        <Combobox
          id="activity"
          name="activity"
          value={activity}
          onChange={handleChangeActivity}
          options={activityOptions}
          placeholder="Chọn hoặc nhập, ví dụ: Buổi chơi lego cuối tuần"
          error={errors.activity?.message}
        />
        {selectedChildId && (activities.isLoading || activities.items.length > 0) && (
          <ActivitySuggestionChips
            activities={activities.items}
            isLoading={activities.isLoading}
            isRefreshing={activities.isRefreshing}
            selected={activity}
            onSelect={handleSelectSuggestedActivity}
          />
        )}
        <Textarea
          label="Ghi chú (tùy chọn)"
          rows={3}
          placeholder="Nhắc nhở mang đồ dùng, trang phục, hoặc ghi chú sức khỏe cho các bé..."
          {...register('note')}
          error={errors.note?.message}
        />
      </>
    ),
  };

  return (
    <PlaydateFormLayout
      header={
        <FormPageHeader
          title="Tạo cuộc hẹn chơi mới"
          description="Chọn bé, mời bạn chơi của bé rồi để BuddyLink gợi ý thời gian, địa điểm và hoạt động"
          onBack={() => navigate('/playdates')}
        />
      }
      as="form"
      containerProps={{ onSubmit: handleSubmit }}
      steps={steps}
      stepProps={{
        family: {
          required: true,
          description: selectedChild
            ? `Bạn chơi đã ghép đôi với ${selectedChild.displayName} được xếp lên đầu.`
            : 'Chọn bé của bạn, rồi mời bạn chơi của bé.',
        },
        schedule: {
          required: true,
          description: 'Gợi ý dựa trên lịch ưu tiên và vị trí của các gia đình, bỏ qua giờ các bé đã có hẹn.',
        },
        activity: {
          required: true,
          description: 'Chọn trong danh sách, tự nhập tên buổi hẹn, hoặc dùng gợi ý theo sở thích chung của các bé.',
        },
      }}
      summary={{
        childName: selectedChild?.displayName,
        playmates: selectedFriends.map((f) => f.childName).join(', '),
        scheduledDate,
        timeRange: time && endTime ? `${time} - ${endTime}` : time,
        placeName: locationName,
        activity,
      }}
      actions={
        <>
          {submitButton}
          <p className="text-xs text-text-muted flex items-start gap-2">
            <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Nhóm chat sẽ được tạo tự động cho tất cả phụ huynh được mời.
          </p>
        </>
      }
      asideNote={
        <div
          className={cn(
            'mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs',
            isPremium ? 'bg-primary/10 text-primary-dark' : 'bg-surface-container-low text-text-muted'
          )}
        >
          <Ticket className={cn('w-3.5 h-3.5 shrink-0', isPremium ? 'text-primary' : 'text-secondary')} />
          <span>{quotaText}</span>
        </div>
      }
      mobileActions={
        <div className="lg:hidden sticky bottom-0 z-10 -mx-6 sm:mx-0 px-6 py-3 bg-surface/95 backdrop-blur border-t border-hairline sm:border sm:rounded-2xl space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
            <span>{quotaText}</span>
            {selectedFriends.length > 0 && (
              <span className="font-semibold text-primary-dark shrink-0">Đã mời {selectedFriends.length} bé</span>
            )}
          </div>
          {submitButton}
        </div>
      }
    >
      <PlaceSearchModal
        isOpen={showNearbyModal}
        onClose={closePlaceModal}
        onSelectPlace={handleSelectPlace}
        initialPlace={placeToView}
      />
    </PlaydateFormLayout>
  );
};

// ---------------------------------------------------------------------------
// Details: the same three steps, read-only, with the RSVP / reschedule banners and the actions
// ---------------------------------------------------------------------------

const PlaydateDetails = () => {
  const {
    playdate,
    rescheduleReq,
    resolvedReschedule,
    canOpenGroupChat,
    isLoading,
    isActionLoading,
    isHost,
    isUpcoming,
    isCancelled,
    canReschedule,
    canComplete,
    myPendingVote,
    showCancelModal,
    showRescheduleModal,
    setShowCancelModal,
    setShowRescheduleModal,
    handleComplete,
    handleCancel,
    handleRespond,
    handleVoteReschedule,
    handleRescheduleSuccess,
    navigate,
  } = usePlaydateDetail();

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-6 space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container-low rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-surface-container-low rounded-2xl" />
          <div className="lg:col-span-4 h-72 bg-surface-container-low rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!playdate) return null;

  const participants = playdate.participants || [];
  const acceptedCount = participants.filter((p) => p.status === 'accepted').length;
  const canCancel = isHost && isUpcoming;
  // Directions to the saved place, otherwise a search by its name and address
  const placeMapsUrl =
    googleMapsDirectionsUrl(toLngLat(playdate.location?.coordinates)) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${playdate.location?.name || ''} ${playdate.location?.address || ''}`
    )}`;

  const steps = {
    family: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ParticipantCard parent={playdate.hostParent} childName={playdate.hostChild?.displayName} status="host" />
          {participants.map((p) => (
            <ParticipantCard key={p.parentId} parent={p.parent} childName={p.child?.displayName} status={p.status} />
          ))}
        </div>
        {participants.length === 0 && (
          <p className="text-xs text-text-muted">Chưa có bạn bè nào được mời vào buổi hẹn này.</p>
        )}
      </>
    ),
    schedule: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReadOnlyField label="Ngày" icon={CalendarIcon}>
            {formatDate(playdate.scheduledDate)}
          </ReadOnlyField>
          <ReadOnlyField label="Giờ" icon={Clock}>
            {formatPlaydateTimeRange(playdate)}
          </ReadOnlyField>
          <ReadOnlyField label="Thời lượng" icon={Timer}>
            {formatDurationLabel(playdate.durationMinutes ?? DEFAULT_PLAYDATE_DURATION)}
          </ReadOnlyField>
        </div>
        <ReadOnlyField label="Địa điểm" icon={MapPin}>
          <p className="font-semibold">{playdate.location?.name}</p>
          <p className="text-xs text-text-muted">{playdate.location?.address}</p>
          <a href={placeMapsUrl} target="_blank" rel="noopener noreferrer" className={cn(MAPS_LINK_CLASS, 'mt-1')}>
            <Navigation className="w-3 h-3" /> Mở Google Maps
          </a>
        </ReadOnlyField>
      </>
    ),
    activity: (
      <>
        <ReadOnlyField label="Hoạt động" icon={Shapes}>
          {playdate.activity}
        </ReadOnlyField>
        {playdate.note && (
          <ReadOnlyField label="Lời nhắn từ người tổ chức" icon={StickyNote}>
            <span className="leading-relaxed">{playdate.note}</span>
          </ReadOnlyField>
        )}
      </>
    ),
  };

  const hasActions = canOpenGroupChat || canReschedule || canComplete || canCancel;
  const actions = hasActions ? (
    <>
      {canComplete && (
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleComplete}
          isLoading={isActionLoading}
          leftIcon={<Check className="w-4 h-4" />}
          className="w-full rounded-xl shadow-2xs"
        >
          Hoàn thành buổi hẹn
        </Button>
      )}
      {canOpenGroupChat && (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate(`/chat/${playdate.chatConversationId}`)}
          leftIcon={<MessageCircle className="w-4 h-4 text-primary" />}
          className="w-full rounded-xl border-primary/30 text-primary-dark hover:bg-primary/5"
        >
          Nhóm chat Playdate
        </Button>
      )}
      {canReschedule && (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setShowRescheduleModal(true)}
          leftIcon={<RefreshCw className="w-4 h-4 text-tertiary-dark" />}
          className="w-full rounded-xl border-tertiary text-tertiary-dark hover:bg-tertiary-fixed/20"
        >
          Đổi lịch hẹn
        </Button>
      )}
      {canCancel && (
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => setShowCancelModal(true)}
          leftIcon={<Trash2 className="w-4 h-4" />}
          className="w-full rounded-xl text-error hover:bg-error/10"
        >
          Hủy hẹn
        </Button>
      )}
    </>
  ) : (
    <p className="text-xs text-text-muted">Không có thao tác nào cho buổi hẹn này.</p>
  );

  return (
    <PlaydateFormLayout
      header={
        <FormPageHeader
          title={playdate.activity}
          badge={<StatusChip status={playdate.displayStatus || playdate.status} />}
          description={`Tổ chức bởi ${playdate.hostParent?.fullName || 'phụ huynh'} cùng bé ${playdate.hostChild?.displayName || ''}`}
          onBack={() => navigate('/playdates')}
          backLabel="Về danh sách cuộc hẹn"
        />
      }
      banners={
        <PlaydateBanners
          playdate={playdate}
          isInvitationPending={!isHost && isUpcoming && playdate.myParticipantStatus === 'pending'}
          rescheduleReq={rescheduleReq}
          resolvedReschedule={resolvedReschedule}
          myPendingVote={myPendingVote}
          isCancelled={isCancelled}
          isActionLoading={isActionLoading}
          onRespond={handleRespond}
          onVote={handleVoteReschedule}
        />
      }
      steps={steps}
      stepProps={{
        family: {
          aside: <span className="font-semibold text-primary-dark">{acceptedCount + 1} gia đình tham gia</span>,
        },
      }}
      after={playdate.status === 'completed' && <PlaydateRatingsSection playdate={playdate} />}
      summary={{
        childName: playdate.hostChild?.displayName,
        playmates: participants.map((p) => p.child?.displayName).filter(Boolean).join(', '),
        scheduledDate: playdate.scheduledDate,
        timeRange: formatPlaydateTimeRange(playdate),
        placeName: playdate.location?.name,
        activity: playdate.activity,
      }}
      actions={actions}
    >
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        playdate={playdate}
        onSuccess={handleRescheduleSuccess}
      />
      <ConfirmDialog
        open={showCancelModal}
        title="Hủy buổi hẹn chơi này?"
        description="Khi hủy hẹn, toàn bộ phụ huynh tham gia sẽ nhận được thông báo và cuộc hẹn sẽ dừng lại. Thao tác này không thể hoàn tác."
        confirmLabel="Xác nhận hủy hẹn"
        cancelLabel="Giữ lại lịch hẹn"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </PlaydateFormLayout>
  );
};

/**
 * One page for a playdate: /playdates/create is the form, /playdates/:id shows the same form read-only
 */
export const PlaydateFormPage = () => {
  const { id } = useParams();
  return id ? <PlaydateDetails /> : <CreatePlaydateForm />;
};

export default PlaydateFormPage;
