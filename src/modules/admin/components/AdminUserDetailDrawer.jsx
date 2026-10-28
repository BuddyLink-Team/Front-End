import React from 'react';
import {
  MapPin,
  Calendar,
  Baby,
  CreditCard,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  KeyRound,
  UserPlus,
  Flame,
  Link2,
  PartyPopper,
  Flag,
  Activity,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import {
  SUBSCRIPTION_PLAN_NAMES,
  PAYMENT_STATUS_CHIPS,
  GENDER_LABELS,
  LOGIN_METHOD_LABELS,
  CONNECTION_PRIVACY_LABELS,
  CHILD_PROFILE_CHIPS,
  PROFILE_HIDDEN_CHIP,
} from '../constants/admin.constants';
import { formatAgeYears, formatCurrency, formatDateTime, formatDate } from '../../../utils/formatters';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

const SECTION_TITLE_CLASS = 'text-label-lg font-semibold text-text-primary flex items-center gap-2';
const PANEL_CLASS = 'rounded-2xl border border-hairline p-4 bg-surface-container-lowest space-y-3 text-body-md';

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-text-muted flex items-center gap-2 shrink-0">
      {Icon && <Icon size={ICON_SIZE.SM} className="opacity-70" />} {label}
    </span>
    <span className="font-medium text-text-primary text-right">{children}</span>
  </div>
);

const ActivityTile = ({ icon: Icon, label, value, hint }) => (
  <div className="p-3 rounded-xl border border-hairline bg-surface-container-lowest">
    <p className="text-label-md text-text-muted flex items-center gap-1.5">
      <Icon size={ICON_SIZE.XS} /> {label}
    </p>
    <p className="text-title-md text-text-primary mt-1">{value}</p>
    {hint && <p className="text-label-sm text-text-muted mt-0.5">{hint}</p>}
  </div>
);

const getChildChip = (child) => {
  if (child.isArchived) return CHILD_PROFILE_CHIPS.archived;
  if (child.isPlanLocked) return CHILD_PROFILE_CHIPS.planLocked;
  return CHILD_PROFILE_CHIPS.active;
};

/**
 * AdminUserDetailDrawer - Side drawer displaying full profile, verification status, activity summary,
 * children list, current subscription, and payment history of a parent.
 * `reloadKey` reloads the open account in place (bumped by the page after a lock / unlock).
 */
export const AdminUserDetailDrawer = ({
  userId,
  isOpen,
  reloadKey = 0,
  onClose,
  onLockToggle,
  onSelectChild,
}) => {
  const { userDetail, errorMessage, isLoading, payments, paymentsTotal, isLoadingPayments } =
    useAdminUserDetail({ userId, isOpen, reloadKey });

  const isLocked = userDetail && !userDetail.isActive;
  const area = [userDetail?.location?.area, userDetail?.location?.city].filter(Boolean).join(', ');
  const plan = userDetail?.subscription;
  const activity = userDetail?.activity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết tài khoản phụ huynh"
      placement="right"
      maxWidth="max-w-xl"
      footer={
        userDetail && (
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="border border-hairline">
                Đóng
              </Button>
              <Button
                type="button"
                variant={isLocked ? 'primary' : 'danger'}
                onClick={() => onLockToggle?.(userDetail)}
                leftIcon={
                  isLocked ? (
                    <Unlock size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
                  ) : (
                    <Lock size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
                  )
                }
              >
                {isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
              </Button>
            </div>
          </div>
        )
      }
    >
      {isLoading ? (
        <div className="space-y-6 py-2">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : userDetail ? (
        <div className="space-y-6 py-2">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-hairline">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <Avatar src={userDetail.avatar} alt={userDetail.fullName} size="2xl" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h4 className="text-title-md font-semibold text-text-primary break-words">{userDetail.fullName}</h4>
                  {userDetail.verification?.isVerifiedParent && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-body-md text-text-muted mt-0.5">{userDetail.email}</p>
                {userDetail.phone && <p className="text-body-md text-text-muted">{userDetail.phone}</p>}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
              <StatusChip
                status={userDetail.isActive ? 'active' : 'locked'}
                label={userDetail.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              />
              {userDetail.isProfileHidden && <StatusChip {...PROFILE_HIDDEN_CHIP} />}
            </div>
          </div>

          {/* Verification details */}
          <div className="space-y-2">
            <h5 className={SECTION_TITLE_CLASS}>Trạng thái xác thực</h5>
            <div className="grid grid-cols-2 gap-3 text-body-md">
              {[
                ['Email', userDetail.verification?.isEmailVerified],
                ['SĐT', userDetail.verification?.isPhoneVerified],
              ].map(([label, isVerified]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-3 rounded-xl border border-hairline bg-surface-container-lowest"
                >
                  {isVerified ? (
                    <CheckCircle2 size={ICON_SIZE.SM} className="text-primary shrink-0" />
                  ) : (
                    <XCircle size={ICON_SIZE.SM} className="text-text-muted shrink-0" />
                  )}
                  <span className="text-text-primary">
                    {label}: {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity summary (PROJECT_OVERVIEW 15.1: connections, playdates, reports) */}
          {activity && (
            <div className="space-y-2">
              <h5 className={SECTION_TITLE_CLASS}>
                <Activity size={ICON_SIZE.SM} className="text-primary" /> Hoạt động
              </h5>
              <div className="grid grid-cols-3 gap-3">
                <ActivityTile icon={Link2} label="Kết nối" value={activity.connections} hint="Đã kết nối" />
                <ActivityTile
                  icon={PartyPopper}
                  label="Playdate"
                  value={activity.playdates.all}
                  hint={`${activity.playdates.upcoming} sắp tới · ${activity.playdates.completed} đã chơi · ${activity.playdates.cancelled} đã hủy`}
                />
                <ActivityTile
                  icon={Flag}
                  label="Bị báo cáo"
                  value={activity.reports.total}
                  hint={activity.reports.open > 0 ? `${activity.reports.open} đang chờ xử lý` : 'Không có báo cáo mở'}
                />
              </div>
            </div>
          )}

          {/* General Info */}
          <div className="space-y-2">
            <h5 className={SECTION_TITLE_CLASS}>Thông tin chung</h5>
            <div className={PANEL_CLASS}>
              <InfoRow icon={MapPin} label="Phường / Thành phố">
                {area || 'Chưa cập nhật'}
              </InfoRow>
              <InfoRow icon={KeyRound} label="Đăng nhập bằng">
                {userDetail.loginMethods?.length
                  ? userDetail.loginMethods.map((method) => LOGIN_METHOD_LABELS[method] || method).join(', ')
                  : '—'}
              </InfoRow>
              <InfoRow icon={UserPlus} label="Nhận lời mời kết nối">
                {CONNECTION_PRIVACY_LABELS[userDetail.connectionPrivacy] || '—'}
              </InfoRow>
              <InfoRow icon={Flame} label="Chuỗi playdate tuần">
                {userDetail.streak?.currentWeeklyStreak || 0} tuần (dài nhất {userDetail.streak?.longestStreak || 0})
              </InfoRow>
              <InfoRow icon={Calendar} label="Ngày đăng ký">
                {formatDateTime(userDetail.createdAt)}
              </InfoRow>
              {userDetail.bio && (
                <div className="pt-2 border-t border-hairline">
                  <p className="text-text-muted text-label-sm uppercase mb-1">Giới thiệu</p>
                  <p className="text-text-primary italic">&ldquo;{userDetail.bio}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          {/* Children List */}
          <div className="space-y-2">
            <h5 className={SECTION_TITLE_CLASS}>
              <Baby size={ICON_SIZE.SM} className="text-primary" /> Hồ sơ các bé ({userDetail.activeChildrenCount})
              {userDetail.archivedChildrenCount > 0 && (
                <span className="text-label-md font-medium text-text-muted">
                  · {userDetail.archivedChildrenCount} đã xóa
                </span>
              )}
            </h5>
            {userDetail.children?.length > 0 ? (
              <div className="space-y-2">
                {userDetail.children.map((child) => (
                  <button
                    type="button"
                    key={child.id}
                    onClick={() => onSelectChild?.(child)}
                    className="w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl border border-hairline bg-surface-container-lowest hover:bg-surface-container-low transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary text-body-md flex items-center gap-1.5">
                        {child.displayName}
                        <ExternalLink size={ICON_SIZE.XS} className="opacity-50" />
                      </p>
                      <p className="text-label-sm text-text-muted mt-0.5">
                        {formatAgeYears(child.age) || 'Chưa rõ tuổi'} •{' '}
                        {GENDER_LABELS[child.gender] || '—'}
                      </p>
                    </div>
                    <StatusChip {...getChildChip(child)} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-text-muted italic p-3 bg-surface-muted/50 rounded-xl">
                Chưa có hồ sơ trẻ em nào được tạo.
              </p>
            )}
          </div>

          {/* Subscription Section */}
          {plan && (
            <div className="space-y-2">
              <h5 className={SECTION_TITLE_CLASS}>
                <CreditCard size={ICON_SIZE.SM} className="text-tertiary" /> Gói cước hiện tại
              </h5>
              <div className={PANEL_CLASS}>
                <InfoRow label="Gói đăng ký">{SUBSCRIPTION_PLAN_NAMES[plan.planCode] || plan.planCode}</InfoRow>
                {plan.isPremium ? (
                  <>
                    <InfoRow label="Trạng thái">
                      <StatusChip status="active" label="Đang hiệu lực" />
                    </InfoRow>
                    {plan.startDate && <InfoRow label="Bắt đầu">{formatDate(plan.startDate)}</InfoRow>}
                    <InfoRow label="Hạn sử dụng">{formatDate(plan.endDate)}</InfoRow>
                    <InfoRow label="Số tháng đã mua liên tục">{plan.purchasedMonths} tháng</InfoRow>
                  </>
                ) : (
                  plan.startDate && <InfoRow label="Dùng gói Free từ">{formatDate(plan.startDate)}</InfoRow>
                )}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="space-y-2">
            <h5 className={SECTION_TITLE_CLASS}>Lịch sử giao dịch ({paymentsTotal})</h5>
            {paymentsTotal > payments.length && (
              <p className="text-label-md text-text-muted">{payments.length} giao dịch gần nhất</p>
            )}
            {isLoadingPayments ? (
              <Skeleton className="h-24 w-full rounded-2xl" />
            ) : payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.orderCode}
                    className="p-3 rounded-xl border border-hairline bg-surface-container-lowest flex items-center justify-between gap-3 text-body-md"
                  >
                    <div>
                      <p className="font-medium text-text-primary">Mã đơn #{payment.orderCode}</p>
                      <p className="text-label-sm text-text-muted">
                        {payment.planName} •{' '}
                        {payment.paidAt
                          ? `Thanh toán ${formatDateTime(payment.paidAt)}`
                          : `Tạo ${formatDateTime(payment.createdAt)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{formatCurrency(payment.amount)}</p>
                      <StatusChip
                        status={PAYMENT_STATUS_CHIPS[payment.status]?.status || payment.status}
                        label={PAYMENT_STATUS_CHIPS[payment.status]?.label}
                        className="mt-0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-text-muted italic p-3 bg-surface-muted/50 rounded-xl">
                Chưa phát sinh giao dịch nạp gói Premium nào.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-text-muted">
          {errorMessage || 'Không tìm thấy thông tin tài khoản phụ huynh.'}
        </div>
      )}
    </Modal>
  );
};

export default AdminUserDetailDrawer;
