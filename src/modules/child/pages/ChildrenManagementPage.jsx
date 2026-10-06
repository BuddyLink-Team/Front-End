import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Plus, RefreshCw, Crown } from 'lucide-react';
import { Button, UpgradeButton, Spinner, EmptyState, ConfirmDialog } from '../../../components';
import { ChildCard } from '../components';
import { useChildrenList } from '../hooks/useChildrenList';
import { useSubscriptionQuota } from '../../subscription/hooks/useSubscriptionQuota';

export const ChildrenManagementPage = () => {
  const navigate = useNavigate();
  const {
    children,
    isLoading: isChildrenLoading,
    isDeleting,
    errorMessage,
    fetchChildren,
    handleDeleteChild,
  } = useChildrenList();

  const {
    childLimit,
    isChildUnlimited,
    isChildLimitReached,
    isLoading: isQuotaLoading,
  } = useSubscriptionQuota();

  const [childToDelete, setChildToDelete] = useState(null);

  const isLoading = isChildrenLoading || isQuotaLoading;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-text-muted">
          Đang tải danh sách hồ sơ các bé...
        </p>
      </div>
    );
  }

  if (errorMessage && children.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-error/10 text-error max-w-md">
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
        <Button
          type="button"
          onClick={fetchChildren}
          className="rounded-xl px-5 py-2.5 text-xs font-semibold"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Thử tải lại trang
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full py-4 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-hairline bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
                  Hồ sơ các bé ({children.length})
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isChildUnlimited
                      ? 'bg-tertiary/15 text-tertiary-dark border border-tertiary/40'
                      : isChildLimitReached
                        ? 'bg-error/10 text-error border border-error/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                  }`}
                >
                  {isChildUnlimited ? (
                    <>
                      <Crown className="w-3 h-3 text-tertiary-container" />
                      <span>Không giới hạn (Premium)</span>
                    </>
                  ) : (
                    <span>
                      Hạn mức: {children.length}/{childLimit} bé
                    </span>
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Quản lý thông tin, độ tuổi, tính cách và sở thích để tìm bạn
                chơi phù hợp nhất cho con
              </p>
            </div>
          </div>
        </div>

        {isChildLimitReached ? (
          <UpgradeButton
            onClick={() => navigate('/subscription')}
            className="self-start sm:self-auto shrink-0"
          >
            Nâng cấp để thêm bé
          </UpgradeButton>
        ) : (
          <Button
            type="button"
            onClick={() => navigate('/children/create')}
            className="px-5 py-3 rounded-xl shadow-md font-semibold text-sm self-start sm:self-auto shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm hồ sơ bé
          </Button>
        )}
      </div>

      {/* Children List Grid / Empty State */}
      {children.length === 0 ? (
        <EmptyState
          icon={<Baby className="w-8 h-8 text-primary" />}
          title="Chưa có hồ sơ bé nào được tạo"
          description="Hãy tạo hồ sơ cho bé với thông tin ngày sinh, sở thích và tính cách để thuật toán BuddyLink đề xuất các bạn chơi cùng lứa tuổi phù hợp nhất!"
          actionLabel="Tạo hồ sơ bé đầu tiên"
          onAction={() => navigate('/children/create')}
          className="bg-white rounded-3xl p-8 sm:p-12"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <ChildCard
              key={child.id || child._id}
              child={child}
              onEdit={(childId) => navigate(`/children/${childId}/edit`)}
              onDelete={(childData) => setChildToDelete(childData)}
            />
          ))}
        </div>
      )}

      {/* Confirm Delete Child Dialog */}
      <ConfirmDialog
        open={Boolean(childToDelete)}
        title="Xóa hồ sơ bé"
        description={
          childToDelete
            ? `Bạn có chắc chắn muốn xóa hồ sơ của bé "${childToDelete.displayName}" không? Hành động này sẽ gỡ bỏ thông tin của bé khỏi danh sách kết nối bạn bè.`
            : ''
        }
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!childToDelete) return;
          const childId = childToDelete.id || childToDelete._id;
          const res = await handleDeleteChild(childId);
          if (res?.success) {
            setChildToDelete(null);
          }
        }}
        onCancel={() => {
          if (!isDeleting) {
            setChildToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default ChildrenManagementPage;
