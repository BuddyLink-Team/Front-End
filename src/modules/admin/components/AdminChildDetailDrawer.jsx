import React, { useEffect, useState } from 'react';
import {
  Baby,
  Calendar,
  Sparkles,
  Heart,
  Smile,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { adminApi } from '../api/adminApi';
import { formatDateTime, formatDate } from '../../../utils/formatters';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

/**
 * AdminChildDetailDrawer - View-only side drawer showing full child profile
 * and summary of the parent account with a link to manage/lock the parent.
 */
export const AdminChildDetailDrawer = ({
  childId,
  isOpen,
  onClose,
  onViewParent,
}) => {
  const [childDetail, setChildDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !childId) {
      setChildDetail(null);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);

    adminApi
      .getChildDetail(childId)
      .then((res) => {
        if (!isCurrent) return;
        const data = res?.data ?? res;
        setChildDetail(data);
      })
      .catch(() => {
        if (isCurrent) setChildDetail(null);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, childId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết hồ sơ trẻ"
      placement="right"
      maxWidth="max-w-xl"
      footer={
        childDetail?.parent && (
          <div className="flex items-center justify-between w-full">
            <span className="text-body-sm text-text-muted">
              Mã bé: <span className="font-mono text-text-primary">{childDetail.id}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="border border-hairline">
                Đóng
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onViewParent?.(childDetail.parent)}
                rightIcon={<ExternalLink size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />}
              >
                Quản lý phụ huynh
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
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      ) : childDetail ? (
        <div className="space-y-6 py-2">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-hairline">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center text-primary-dark font-bold text-headline-sm border border-primary/20">
                <Baby size={ICON_SIZE.LG} />
              </div>
              <div>
                <h4 className="text-title-md font-bold text-text-primary">
                  {childDetail.displayName}
                </h4>
                <p className="text-body-sm text-text-muted mt-0.5">
                  {childDetail.age ? `${childDetail.age} tuổi` : 'Chưa rõ tuổi'} •{' '}
                  {childDetail.gender === 'boy' ? 'Bé trai' : childDetail.gender === 'girl' ? 'Bé gái' : 'Khác'}
                </p>
                <p className="text-label-sm text-text-muted">
                  Ngày sinh: {formatDate(childDetail.dateOfBirth)}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              {childDetail.isArchived ? (
                <StatusChip status="archived" label="Đã xóa bởi phụ huynh" />
              ) : (
                <StatusChip status="active" label="Đang hiển thị" />
              )}
            </div>
          </div>

          {/* Interests & Activities */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
                <Sparkles size={ICON_SIZE.SM} className="text-tertiary" /> Sở thích
              </h5>
              {childDetail.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {childDetail.interests.map((interest, idx) => (
                    <InterestTag key={idx} label={interest} />
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-text-muted italic">Chưa có sở thích nào được chọn.</p>
              )}
            </div>

            <div className="space-y-2">
              <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
                <Heart size={ICON_SIZE.SM} className="text-error" /> Hoạt động yêu thích
              </h5>
              {childDetail.favoriteActivities?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {childDetail.favoriteActivities.map((act, idx) => (
                    <InterestTag key={idx} label={act} className="bg-tertiary-soft text-tertiary-dark border-tertiary/20" />
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-text-muted italic">Chưa cập nhật hoạt động yêu thích.</p>
              )}
            </div>

            <div className="space-y-2">
              <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
                <Smile size={ICON_SIZE.SM} className="text-secondary" /> Tính cách
              </h5>
              {childDetail.personality?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {childDetail.personality.map((trait, idx) => (
                    <InterestTag key={idx} label={trait} className="bg-secondary-soft text-secondary-dark border-secondary/20" />
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-text-muted italic">Chưa cập nhật tính cách.</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-2xl border border-hairline p-4 bg-white space-y-2 text-body-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar size={ICON_SIZE.SM} className="opacity-70" /> Ngày tạo hồ sơ
              </span>
              <span className="font-medium text-text-primary">
                {formatDateTime(childDetail.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar size={ICON_SIZE.SM} className="opacity-70" /> Cập nhật lần cuối
              </span>
              <span className="font-medium text-text-primary">
                {formatDateTime(childDetail.updatedAt)}
              </span>
            </div>
          </div>

          {/* Parent Summary Card */}
          <div className="space-y-2">
            <h5 className="text-label-lg font-semibold text-text-primary">
              Thông tin Phụ huynh quản lý
            </h5>
            {childDetail.parent ? (
              <div className="p-4 rounded-2xl border border-hairline bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={childDetail.parent.avatar}
                      name={childDetail.parent.fullName}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-text-primary text-body-md">
                          {childDetail.parent.fullName}
                        </p>
                        {childDetail.parent.verification?.isVerifiedParent && (
                          <VerifiedBadge size="sm" iconOnly text="Phụ huynh đã xác thực" />
                        )}
                      </div>
                      <p className="text-body-sm text-text-muted flex items-center gap-1 mt-0.5">
                        <Mail size={ICON_SIZE.XS} className="opacity-70" /> {childDetail.parent.email}
                      </p>
                      {childDetail.parent.phone && (
                        <p className="text-body-sm text-text-muted flex items-center gap-1">
                          <Phone size={ICON_SIZE.XS} className="opacity-70" /> {childDetail.parent.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusChip
                    status={childDetail.parent.isActive ? 'active' : 'locked'}
                    label={childDetail.parent.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                  />
                </div>

                {childDetail.parent.city && (
                  <div className="flex items-center gap-1.5 text-body-sm text-text-muted pt-2 border-t border-hairline">
                    <MapPin size={ICON_SIZE.SM} className="opacity-70" />
                    <span>Khu vực: {childDetail.parent.city}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => onViewParent?.(childDetail.parent)}
                    rightIcon={<ExternalLink size={ICON_SIZE.XS} />}
                  >
                    Xem tài khoản phụ huynh & Xử lý kỷ luật
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-text-muted italic p-3 bg-surface-muted/50 rounded-xl">
                Không có thông tin phụ huynh.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-text-muted">
          Không tìm thấy hồ sơ trẻ em.
        </div>
      )}
    </Modal>
  );
};

export default AdminChildDetailDrawer;
