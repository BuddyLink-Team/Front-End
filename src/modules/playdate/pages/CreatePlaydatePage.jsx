import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Search,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Plus,
  Baby,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Avatar } from '../../../components/ui/Avatar';
import { playdateApi } from '../api/playdateApi';
import { childApi } from '../../child/api/childApi';

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

// Popular nearby kid-friendly venues for quick selection
const NEARBY_VENUES = [
  {
    name: 'Công viên Gia Định',
    address: 'Đường Hoàng Minh Giám, Phường 3, Quận Gò Vấp, TP.HCM',
    tag: 'Công viên xanh',
  },
  {
    name: 'Công viên Cầu Ánh Sao - Hồ Bán Nguyệt',
    address: 'Khu đô thị Phú Mỹ Hưng, Phường Tân Phú, Quận 7, TP.HCM',
    tag: 'Không gian mở',
  },
  {
    name: 'Khu vui chơi TiNiWorld Crescent Mall',
    address: 'Tầng 5 Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM',
    tag: 'Khu vui chơi trong nhà',
  },
  {
    name: 'Thảo Cầm Viên Sài Gòn',
    address: 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP.HCM',
    tag: 'Sở thú & Dã ngoại',
  },
  {
    name: 'Khu du lịch Văn Thánh',
    address: '48/10 Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    tag: 'Cảnh quan sông nước',
  },
  {
    name: 'Bảo tàng Mỹ thuật TP.HCM',
    address: '97A Phó Đức Chính, Phường Nguyễn Thái Bình, Quận 1, TP.HCM',
    tag: 'Văn hóa & Nghệ thuật',
  },
];

export const CreatePlaydatePage = () => {
  const navigate = useNavigate();

  // Data states
  const [myChildren, setMyChildren] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]); // [{ parentId, parentName, avatarUrl, childId, childName }]
  const [activity, setActivity] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  // Nearby venues drawer/popover
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [venueSearch, setVenueSearch] = useState('');

  // Quota alert modal
  const [quotaExceededModal, setQuotaExceededModal] = useState(false);

  // Min date for picker: today in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoadingInitialData(true);
      try {
        const [childrenRes, friendsRes] = await Promise.allSettled([
          childApi.getMyChildren(),
          playdateApi.getFriends(),
        ]);

        if (isMounted) {
          if (childrenRes.status === 'fulfilled' && childrenRes.value?.data) {
            const list = Array.isArray(childrenRes.value.data)
              ? childrenRes.value.data
              : childrenRes.value.data.children || [];
            setMyChildren(list);
            if (list.length > 0) {
              setSelectedChildId(list[0]._id || list[0].id);
            }
          }

          if (friendsRes.status === 'fulfilled' && friendsRes.value?.data) {
            const friendList = Array.isArray(friendsRes.value.data)
              ? friendsRes.value.data
              : friendsRes.value.data.friends || [];
            setFriends(friendList);
          }
        }
      } catch (err) {
        // Soft fallback
      } finally {
        if (isMounted) setIsLoadingInitialData(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle participant friend toggle
  const handleToggleFriend = (friend, child) => {
    const friendChildId = child?._id || child?.id;
    const exists = selectedFriends.some(
      (item) => item.parentId === friend.id && item.childId === friendChildId
    );

    if (exists) {
      setSelectedFriends((prev) =>
        prev.filter((item) => !(item.parentId === friend.id && item.childId === friendChildId))
      );
    } else {
      setSelectedFriends((prev) => [
        ...prev,
        {
          parentId: friend.id,
          parentName: friend.fullName,
          avatarUrl: friend.avatarUrl,
          childId: friendChildId,
          childName: child?.displayName || 'Bé',
        },
      ]);
    }
  };

  const handleRemoveFriend = (parentId, childId) => {
    setSelectedFriends((prev) =>
      prev.filter((item) => !(item.parentId === parentId && item.childId === childId))
    );
  };

  // Select location from suggestion
  const handleSelectVenue = (venue) => {
    setLocationName(venue.name);
    setLocationAddress(venue.address);
    setShowNearbyModal(false);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: null }));
    }
    toast.success(`Đã chọn địa điểm: ${venue.name}`);
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!selectedChildId) {
      errs.hostChildId = 'Vui lòng chọn bé của bạn tham gia buổi hẹn';
    }
    if (!activity.trim()) {
      errs.activity = 'Vui lòng nhập tên hoạt động hoặc chọn từ gợi ý';
    }
    if (!scheduledDate) {
      errs.scheduledDate = 'Vui lòng chọn ngày diễn ra';
    }
    if (!time.trim()) {
      errs.time = 'Vui lòng chọn hoặc nhập khung giờ';
    }
    if (!locationName.trim() || !locationAddress.trim()) {
      errs.location = 'Vui lòng nhập đầy đủ tên địa điểm và địa chỉ';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng hoàn thành các trường thông tin còn thiếu');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        hostChildId: selectedChildId,
        scheduledDate,
        time,
        activity: activity.trim(),
        location: {
          name: locationName.trim(),
          address: locationAddress.trim(),
        },
        note: note.trim(),
        participants: selectedFriends.map((f) => ({
          parentId: f.parentId,
          childId: f.childId,
        })),
      };

      await playdateApi.createPlaydate(payload);

      toast.success('🎉 Tạo cuộc hẹn chơi thành công! Nhóm chat cho buổi hẹn đã sẵn sàng.');
      navigate('/playdates');
    } catch (error) {
      const errCode = error?.response?.data?.error?.code;
      const errMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo cuộc hẹn';

      if (errCode === 'QUOTA_EXCEEDED') {
        setQuotaExceededModal(true);
      } else if (errCode === 'NOT_CONNECTED_FRIEND') {
        toast.error('Chỉ có thể mời các phụ huynh đã có trong danh sách bạn bè kết nối');
      } else {
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVenues = NEARBY_VENUES.filter(
    (v) =>
      v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
      v.address.toLowerCase().includes(venueSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Navigation & Header */}
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Tạo cuộc hẹn chơi mới
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Lên lịch Playdate, mời bạn bè cùng tham gia và tự động khởi tạo nhóm trò chuyện
            </p>
          </div>
        </div>

        {/* Free Plan Quota Indicator Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-hairline text-xs text-text-muted shrink-0 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>Gói Miễn phí: <strong>Tối đa 3 cuộc hẹn/tháng</strong></span>
        </div>
      </div>

      {/* Main White Card Layout - Stitch UI Spec */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-hairline rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-8">
          {/* SECTION 1: CHỌN BÉ THAM GIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Baby className="w-4 h-4 text-primary" />
                1. Chọn bé tham gia của bạn <span className="text-red-500">*</span>
              </label>
              {myChildren.length > 0 && (
                <span className="text-xs text-text-muted">{myChildren.length} hồ sơ bé</span>
              )}
            </div>

            {isLoadingInitialData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
              </div>
            ) : myChildren.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-3 text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-sm space-y-1">
                  <p className="font-medium">Chưa có hồ sơ bé nào</p>
                  <p className="text-xs text-amber-700">
                    Bạn cần tạo hồ sơ bé trước khi có thể tổ chức buổi hẹn chơi.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/children/create')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark underline hover:no-underline pt-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm hồ sơ bé ngay
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myChildren.map((child) => {
                  const id = child._id || child.id;
                  const isSelected = selectedChildId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => {
                        setSelectedChildId(id);
                        if (errors.hostChildId) {
                          setErrors((prev) => ({ ...prev, hostChildId: null }));
                        }
                      }}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-150 flex items-center gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                          : 'border-hairline bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <Avatar
                        alt={child.displayName}
                        size="md"
                        fallbackText={child.displayName?.slice(0, 2)?.toUpperCase()}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {child.displayName}
                          </p>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted capitalize">
                          {child.gender === 'boy' ? 'Bé trai' : 'Bé gái'}
                          {child.interests?.length > 0 && ` • ${child.interests.slice(0, 2).join(', ')}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.hostChildId && (
              <p className="text-xs text-red-500">{errors.hostChildId}</p>
            )}
          </div>

          <hr className="border-hairline" />

          {/* SECTION 2: CHỌN BẠN BÈ THAM GIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary-dark" />
                  2. Mời gia đình bạn bè tham gia
                </label>
                <p className="text-xs text-text-muted mt-0.5">
                  Chọn các phụ huynh và bé đã kết nối bạn bè với bạn để cùng tham gia
                </p>
              </div>
              <span className="text-xs font-medium text-text-muted bg-surface-subtle px-2.5 py-1 rounded-full border border-hairline">
                Đã chọn: {selectedFriends.length} bé
              </span>
            </div>

            {/* Selected Friend Chips */}
            {selectedFriends.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedFriends.map((f) => (
                  <div
                    key={`${f.parentId}-${f.childId}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-text-primary shadow-2xs"
                  >
                    <Avatar
                      src={f.avatarUrl}
                      alt={f.parentName}
                      size="sm"
                      className="w-5 h-5"
                    />
                    <span>
                      {f.parentName} (<strong>{f.childName}</strong>)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(f.parentId, f.childId)}
                      className="text-text-muted hover:text-red-500 transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Friend List with Avatars */}
            {isLoadingInitialData ? (
              <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
            ) : friends.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline flex items-center justify-between gap-3 text-text-muted text-xs">
                <span>Chưa có bạn bè nào được kết nối. Bạn vẫn có thể tạo buổi hẹn riêng hoặc kết nối thêm phụ huynh tại mục Khám phá.</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/match')}
                  className="shrink-0 text-primary-dark font-medium hover:bg-white"
                >
                  Tìm bạn mới
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 border border-hairline rounded-2xl bg-surface-subtle/40">
                {friends.map((friend) => {
                  return (
                    <div
                      key={friend.id}
                      className="p-3 bg-white rounded-xl border border-hairline shadow-2xs flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={friend.avatarUrl}
                          alt={friend.fullName}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-semibold text-text-primary truncate">
                              {friend.fullName}
                            </p>
                            {friend.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted">
                            {friend.children?.length > 0
                              ? `${friend.children.length} bé`
                              : 'Chưa cập nhật bé'}
                          </p>
                        </div>
                      </div>

                      {/* Children list of this friend */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {friend.children?.map((child) => {
                          const childId = child.id || child._id;
                          const isInvited = selectedFriends.some(
                            (item) => item.parentId === friend.id && item.childId === childId
                          );
                          return (
                            <button
                              key={childId}
                              type="button"
                              onClick={() => handleToggleFriend(friend, child)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                                isInvited
                                  ? 'bg-secondary text-white border-secondary font-medium shadow-2xs'
                                  : 'bg-surface-subtle text-text-primary border-hairline hover:border-gray-300'
                              }`}
                            >
                              <span>{child.displayName}</span>
                              {isInvited ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Plus className="w-3 h-3 text-text-muted" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-hairline" />

          {/* SECTION 3: HOẠT ĐỘNG & GỢI Ý NHANH */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              3. Hoạt động & Gợi ý hoạt động nhanh <span className="text-red-500">*</span>
            </label>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActivity(item.value);
                    if (errors.activity) {
                      setErrors((prev) => ({ ...prev, activity: null }));
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    activity === item.value
                      ? 'bg-primary text-white border-primary font-semibold shadow-2xs'
                      : 'bg-white text-text-muted border-hairline hover:border-primary/40 hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <Input
              id="activity"
              name="activity"
              placeholder="Nhập tên hoạt động hoặc buổi hẹn (Ví dụ: Buổi chơi xếp hình Lego & giao lưu)..."
              value={activity}
              onChange={(e) => {
                setActivity(e.target.value);
                if (errors.activity) setErrors((prev) => ({ ...prev, activity: null }));
              }}
              error={errors.activity}
            />
          </div>

          <hr className="border-hairline" />

          {/* SECTION 4: NGÀY & GIỜ HẸN */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              4. Bộ chọn ngày & giờ thân thiện <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Input */}
              <Input
                label="Ngày diễn ra"
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                min={todayStr}
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value);
                  if (errors.scheduledDate) setErrors((prev) => ({ ...prev, scheduledDate: null }));
                }}
                leftIcon={<CalendarIcon className="w-4 h-4" />}
                error={errors.scheduledDate}
              />

              {/* Time Input with Presets */}
              <div className="space-y-1.5">
                <Input
                  label="Khung giờ hẹn"
                  id="time"
                  name="time"
                  placeholder="Ví dụ: 15:00 - 17:00"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
                  }}
                  leftIcon={<Clock className="w-4 h-4" />}
                  error={errors.time}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setTime(preset);
                        if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
                      }}
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

          <hr className="border-hairline" />

          {/* SECTION 5: ĐỊA ĐIỂM & TÌM KIẾM LÂN CẬN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                5. Địa điểm hẹn chơi <span className="text-red-500">*</span>
              </label>

              {/* Nút Tìm kiếm địa điểm lân cận */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNearbyModal(true)}
                leftIcon={<Compass className="w-4 h-4 text-secondary-dark" />}
                className="text-xs font-semibold rounded-xl border-secondary/30 text-secondary-dark hover:bg-secondary/5"
              >
                Tìm kiếm địa điểm lân cận
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tên địa điểm"
                id="locationName"
                name="locationName"
                placeholder="Ví dụ: Công viên Cầu Ánh Sao"
                value={locationName}
                onChange={(e) => {
                  setLocationName(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
                }}
              />
              <Input
                label="Địa chỉ chi tiết"
                id="locationAddress"
                name="locationAddress"
                placeholder="Ví dụ: Quận 7, TP. Hồ Chí Minh"
                value={locationAddress}
                onChange={(e) => {
                  setLocationAddress(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
                }}
              />
            </div>
            {errors.location && (
              <p className="text-xs text-red-500">{errors.location}</p>
            )}
          </div>

          <hr className="border-hairline" />

          {/* SECTION 6: GHI CHÚ */}
          <div className="space-y-3">
            <Textarea
              label="Ghi chú thêm cho phụ huynh"
              id="note"
              name="note"
              rows={3}
              placeholder="Dặn dò các ba mẹ mang theo nón, bình nước uống, giày thể thao hoặc món đồ chơi bé thích..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-hairline">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/playdates')}
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl"
            >
              Hủy
            </Button>
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

      {/* POPUP / MODAL: Tìm kiếm địa điểm lân cận */}
      {showNearbyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-hairline">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-bold text-text-primary">
                  Địa điểm gợi ý lân cận
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNearbyModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Chọn nhanh các công viên và không gian vui chơi an toàn đã được cộng đồng phụ huynh BuddyLink đánh giá cao
            </p>

            {/* Search filter for venues */}
            <Input
              placeholder="Tìm theo tên công viên hoặc khu vực..."
              value={venueSearch}
              onChange={(e) => setVenueSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            {/* Venue List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.name}
                  onClick={() => handleSelectVenue(venue)}
                  className="p-3.5 rounded-2xl border border-hairline hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary-dark">
                        {venue.name}
                      </p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary-container text-secondary-on-container">
                        {venue.tag}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {venue.address}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs text-primary font-semibold p-1"
                  >
                    Chọn
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNearbyModal(false)}
                className="rounded-xl"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP / MODAL: Quota Exceeded (3 Playdates / Month) */}
      {quotaExceededModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-xl border border-hairline">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-text-primary">
                Đã đạt hạn mức gói Miễn phí
              </h3>
              <p className="text-sm text-text-muted">
                Tài khoản gói Miễn phí được tạo tối đa <strong>3 cuộc hẹn chơi trong mỗi tháng</strong>. Hãy nâng cấp lên gói BuddyLink Premium để tạo không giới hạn cuộc hẹn và nhận các tính năng kết nối thông minh!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setQuotaExceededModal(false)}
                className="w-full sm:w-auto rounded-xl"
              >
                Để sau
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setQuotaExceededModal(false);
                  navigate('/subscription');
                }}
                className="w-full sm:w-auto rounded-xl shadow-xs"
              >
                Xem gói Premium
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePlaydatePage;
