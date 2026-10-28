import React from 'react';
import { Baby, Calendar, Sparkles, Heart, Smile, ExternalLink, MapPin, Mail, Phone } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { useAdminChildDetail } from '../hooks/useAdminChildDetail';
import { GENDER_LABELS, CHILD_VISIBILITY_CHIPS, PROFILE_HIDDEN_CHIP } from '../constants/admin.constants';
import { formatChildAge, formatDateTime, formatDate } from '../../../utils/formatters';
import { ICON_SIZE } from '../../../constants/icon.constants';

const TagSection = ({ icon: Icon, iconClassName, title, items, emptyText, tagClassName }) => (
  <div className="space-y-2">
    <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
      <Icon size={ICON_SIZE.SM} className={iconClassName} /> {title}
    </h5>
    {items?.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <InterestTag key={item} label={item} className={tagClassName} />
        ))}
      </div>
    ) : (
      <p className="text-body-md text-text-muted italic">{emptyText}</p>
    )}
  </div>
);

/**
 * AdminChildDetailDrawer - View-only side drawer showing the full child profile, whether it can be seen
 * in Discovery, and a summary of the parent account with a link to that account.
 */
export const AdminChildDetailDrawer = ({ childId, isOpen, onClose, onViewParent }) => {
  const { childDetail, errorMessage, isLoading } = useAdminChildDetail({ childId, isOpen });
  const parent = childDetail?.parent;
  const parentArea = [parent?.area, parent?.city].filter(Boolean).join(', ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết hồ sơ trẻ"
      placement="right"
      maxWidth="max-w-xl"
      footer={
        childDetail && (
          <div className="flex items-center justify-end w-full">
            <Button type="button" variant="ghost" onClick={onClose} className="border border-hairline">
              Đóng
            </Button>
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
              <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center text-primary-dark border border-primary/20">
                <Baby size={ICON_SIZE.LG} />
              </div>
              <div>
                <h4 className="text-title-md font-semibold text-text-primary">{childDetail.displayName}</h4>
                <p className="text-body-md text-text-muted mt-0.5">
                  {formatChildAge(childDetail.dateOfBirth) || 'Chưa rõ tuổi'} •{' '}
                  {GENDER_LABELS[childDetail.gender] || GENDER_LABELS.other}
                </p>
                <p className="text-label-sm text-text-muted">Ngày sinh: {formatDate(childDetail.dateOfBirth)}</p>
              </div>
            </div>
            <div className="shrink-0">
              <StatusChip {...(CHILD_VISIBILITY_CHIPS[childDetail.visibility] || CHILD_VISIBILITY_CHIPS.visible)} />
            </div>
          </div>

          {/* Interests & Activities */}
          <div className="space-y-4">
            <TagSection
              icon={Sparkles}
              iconClassName="text-tertiary"
              title="Sở thích"
              items={childDetail.interests}
              emptyText="Chưa có sở thích nào được chọn."
            />
            <TagSection
              icon={Heart}
              iconClassName="text-error"
              title="Hoạt động yêu thích"
              items={childDetail.favoriteActivities}
              emptyText="Chưa cập nhật hoạt động yêu thích."
              tagClassName="bg-tertiary-soft text-tertiary-dark border-tertiary/20"
            />
            <TagSection
              icon={Smile}
              iconClassName="text-secondary"
              title="Tính cách"
              items={childDetail.personality}
              emptyText="Chưa cập nhật tính cách."
              tagClassName="bg-secondary-soft text-secondary-dark border-secondary/20"
            />
          </div>

          {/* Timestamps */}
          <div className="rounded-2xl border border-hairline p-4 bg-surface-container-lowest space-y-2 text-body-md">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar size={ICON_SIZE.SM} className="opacity-70" /> Ngày tạo hồ sơ
              </span>
              <span className="font-medium text-text-primary">{formatDateTime(childDetail.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar size={ICON_SIZE.SM} className="opacity-70" /> Cập nhật lần cuối
              </span>
              <span className="font-medium text-text-primary">{formatDateTime(childDetail.updatedAt)}</span>
            </div>
          </div>

          {/* Parent Summary Card */}
          <div className="space-y-2">
            <h5 className="text-label-lg font-semibold text-text-primary">Thông tin phụ huynh quản lý</h5>
            {parent ? (
              <div className="p-4 rounded-2xl border border-hairline bg-surface-container-lowest space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={parent.avatar} alt={parent.fullName} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-text-primary text-body-md truncate">{parent.fullName}</p>
                        {parent.isVerifiedParent && (
                          <VerifiedBadge size="sm" iconOnly text="Phụ huynh đã xác thực" />
                        )}
                      </div>
                      <p className="text-body-md text-text-muted flex items-center gap-1 mt-0.5">
                        <Mail size={ICON_SIZE.XS} className="opacity-70" /> {parent.email}
                      </p>
                      {parent.phone && (
                        <p className="text-body-md text-text-muted flex items-center gap-1">
                          <Phone size={ICON_SIZE.XS} className="opacity-70" /> {parent.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusChip
                      status={parent.isActive ? 'active' : 'locked'}
                      label={parent.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    />
                    {parent.isProfileHidden && <StatusChip {...PROFILE_HIDDEN_CHIP} />}
                  </div>
                </div>

                {parentArea && (
                  <div className="flex items-center gap-1.5 text-body-md text-text-muted pt-2 border-t border-hairline">
                    <MapPin size={ICON_SIZE.SM} className="opacity-70" />
                    <span>{parentArea}</span>
                  </div>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => onViewParent?.(parent.parentUserId)}
                  rightIcon={<ExternalLink size={ICON_SIZE.XS} />}
                >
                  Xem tài khoản phụ huynh
                </Button>
              </div>
            ) : (
              <p className="text-body-md text-text-muted italic p-3 bg-surface-muted/50 rounded-xl">
                Không có thông tin phụ huynh.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-text-muted">{errorMessage || 'Không tìm thấy hồ sơ trẻ em.'}</div>
      )}
    </Modal>
  );
};

export default AdminChildDetailDrawer;
