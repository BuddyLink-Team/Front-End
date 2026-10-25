import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { adminApi } from '../api/adminApi';
import { SUBSCRIPTION_PLAN_NAMES } from '../constants/admin.constants';
import { formatCurrency, formatDateTime, formatDate } from '../../../utils/formatters';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

/**
 * AdminUserDetailDrawer - Side drawer displaying full profile, verification status,
 * children list, current subscription, and payment history of a parent.
 */
export const AdminUserDetailDrawer = ({
  userId,
  isOpen,
  onClose,
  onLockToggle,
  onSelectChild,
}) => {
  const [userDetail, setUserDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) {
      setUserDetail(null);
      setPayments([]);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);

    adminApi
      .getUserDetail(userId)
      .then((res) => {
        if (!isCurrent) return;
        const data = res?.data ?? res;
        setUserDetail(data);
        setIsLoading(false);

        if (data?.parentId) {
          setIsLoadingPayments(true);
          adminApi
            .getPayments({ parentId: data.parentId, page: 1, limit: 5 })
            .then((payRes) => {
              if (!isCurrent) return;
              const payData = payRes?.data ?? payRes;
              setPayments(payData?.items || []);
            })
            .catch(() => {
              if (isCurrent) setPayments([]);
            })
            .finally(() => {
              if (isCurrent) setIsLoadingPayments(false);
            });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setUserDetail(null);
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, userId]);

  const isLocked = userDetail && !userDetail.isActive;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết tài khoản phụ huynh"
      placement="right"
      maxWidth="max-w-xl"
      footer={
        userDetail && (
          <div className="flex items-center justify-between w-full">
            <span className="text-body-sm text-text-muted">
              Mã người dùng: <span className="font-mono text-text-primary">{userDetail.id}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="border border-hairline">
                Đóng
              </Button>
              <Button
                type="button"
                variant={isLocked ? 'primary' : 'danger'}
                onClick={() => onLockToggle?.(userDetail)}
                leftIcon={isLocked ? <Unlock size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} /> : <Lock size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />}
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
            <div className="flex items-center gap-3.5">
              <Avatar
                src={userDetail.avatar}
                name={userDetail.fullName}
                size="2xl"
                className="border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-title-md font-bold text-text-primary">
                    {userDetail.fullName}
                  </h4>
                  {userDetail.verification?.isVerifiedParent && (
                    <VerifiedBadge size="sm" />
                  )}
                </div>
                <p className="text-body-sm text-text-muted mt-0.5">{userDetail.email}</p>
                {userDetail.phone && (
                  <p className="text-body-sm text-text-muted">{userDetail.phone}</p>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <StatusChip
                status={userDetail.isActive ? 'active' : 'locked'}
                label={userDetail.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              />
            </div>
          </div>

          {/* Verification details */}
          <div className="space-y-2">
            <h5 className="text-label-lg font-semibold text-text-primary">Trạng thái xác thực</h5>
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="flex items-center gap-2 p-3 rounded-xl border border-hairline bg-white">
                {userDetail.verification?.isEmailVerified ? (
                  <CheckCircle2 size={ICON_SIZE.SM} className="text-primary shrink-0" />
                ) : (
                  <XCircle size={ICON_SIZE.SM} className="text-text-muted shrink-0" />
                )}
                <span className="text-text-primary">
                  Email: {userDetail.verification?.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-hairline bg-white">
                {userDetail.verification?.isPhoneVerified ? (
                  <CheckCircle2 size={ICON_SIZE.SM} className="text-primary shrink-0" />
                ) : (
                  <XCircle size={ICON_SIZE.SM} className="text-text-muted shrink-0" />
                )}
                <span className="text-text-primary">
                  SĐT: {userDetail.verification?.isPhoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
            </div>
          </div>

          {/* General Info */}
          <div className="space-y-2">
            <h5 className="text-label-lg font-semibold text-text-primary">Thông tin chung</h5>
            <div className="rounded-2xl border border-hairline p-4 space-y-3 bg-white text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-2">
                  <MapPin size={ICON_SIZE.SM} className="opacity-70" /> Khu vực / Thành phố
                </span>
                <span className="font-medium text-text-primary">
                  {userDetail.location?.city || userDetail.location?.area || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-2">
                  <Calendar size={ICON_SIZE.SM} className="opacity-70" /> Ngày đăng ký
                </span>
                <span className="font-medium text-text-primary">
                  {formatDateTime(userDetail.createdAt)}
                </span>
              </div>
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
            <div className="flex items-center justify-between">
              <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
                <Baby size={ICON_SIZE.SM} className="text-primary" /> Hồ sơ các bé ({userDetail.children?.length || 0})
              </h5>
            </div>
            {userDetail.children?.length > 0 ? (
              <div className="space-y-2">
                {userDetail.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectChild?.(child)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-hairline bg-white hover:bg-surface-low transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-text-primary text-body-md flex items-center gap-1.5">
                        {child.displayName}
                        <ExternalLink size={ICON_SIZE.XS} className="opacity-50" />
                      </p>
                      <p className="text-label-sm text-text-muted mt-0.5">
                        {child.age ? `${child.age} tuổi` : 'Chưa rõ tuổi'} •{' '}
                        {child.gender === 'boy' ? 'Bé trai' : child.gender === 'girl' ? 'Bé gái' : 'Khác'}
                      </p>
                    </div>
                    <div>
                      {child.isArchived ? (
                        <StatusChip status="archived" label="Đã xóa" />
                      ) : (
                        <StatusChip status="active" label="Đang hoạt động" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-text-muted italic p-3 bg-surface-muted/50 rounded-xl">
                Chưa có hồ sơ trẻ em nào được tạo.
              </p>
            )}
          </div>

          {/* Subscription Section */}
          <div className="space-y-2">
            <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
              <CreditCard size={ICON_SIZE.SM} className="text-tertiary" /> Gói cước hiện tại
            </h5>
            <div className="rounded-2xl border border-hairline p-4 bg-white space-y-3 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Gói đăng ký:</span>
                <span className="font-semibold text-text-primary">
                  {SUBSCRIPTION_PLAN_NAMES[userDetail.subscription?.planCode] || userDetail.subscription?.planCode || 'Gói Miễn phí'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Trạng thái:</span>
                <StatusChip
                  status={userDetail.subscription?.status === 'active' ? 'active' : 'expired'}
                  label={userDetail.subscription?.status === 'active' ? 'Đang hiệu lực' : 'Đã hết hạn'}
                />
              </div>
              {userDetail.subscription?.endDate && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Hạn sử dụng:</span>
                  <span className="font-medium text-text-primary">
                    {formatDate(userDetail.subscription.endDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-2">
            <h5 className="text-label-lg font-semibold text-text-primary">
              Lịch sử giao dịch ({payments.length})
            </h5>
            {isLoadingPayments ? (
              <Skeleton className="h-24 w-full rounded-2xl" />
            ) : payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.orderCode}
                    className="p-3 rounded-xl border border-hairline bg-white flex items-center justify-between text-body-sm"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        Mã đơn #{payment.orderCode}
                      </p>
                      <p className="text-label-sm text-text-muted">
                        {payment.planName} • {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">
                        {formatCurrency(payment.amount)}
                      </p>
                      <StatusChip status={payment.status} className="mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-text-muted italic p-3 bg-surface-muted/50 rounded-xl">
                Chưa phát sinh giao dịch nạp gói Premium nào.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-text-muted">
          Không tìm thấy thông tin tài khoản phụ huynh.
        </div>
      )}
    </Modal>
  );
};

export default AdminUserDetailDrawer;
