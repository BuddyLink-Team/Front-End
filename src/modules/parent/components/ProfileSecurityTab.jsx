import React from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  Save,
} from 'lucide-react';
import { Card, Button, Switch } from '../../../components';
import { CONNECTION_PRIVACY_OPTIONS } from '../constants/parentConstants';
import ChangePasswordModal from './ChangePasswordModal';
import { useProfileSecurity } from '../hooks/useParentTabHooks';

export const ProfileSecurityTab = ({
  profile,
  onUpdate,
  isUpdating,
  onChangePassword,
}) => {
  const {
    isProfileHidden,
    setIsProfileHidden,
    connectionPrivacy,
    setConnectionPrivacy,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    isChangingPassword,
    handleSavePrivacy,
    handleChangePasswordSubmit,
  } = useProfileSecurity({ profile, onUpdate, onChangePassword });

  return (
    <>
      <Card className="p-6 sm:p-8 rounded-3xl border border-hairline bg-white shadow-sm space-y-8">
        <div className="pb-5 border-b border-hairline/80">
          <h2 className="text-lg font-bold text-on-surface">
            Bảo mật & Quyền riêng tư
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Quản lý quyền hiển thị tài khoản, phạm vi kết nối cộng đồng và mật
            khẩu đăng nhập
          </p>
        </div>

        {/* 1. Account Password Management */}
        <div className="p-6 rounded-2xl border border-hairline bg-white shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <Lock className="w-4 h-4 text-primary" />
                <span>Mật khẩu tài khoản</span>
              </div>
              <p className="text-xs text-text-muted max-w-md">
                Đổi mật khẩu định kỳ giúp bảo vệ tài khoản phụ huynh và dữ liệu
                cá nhân của các bé
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="rounded-xl px-4 py-2 text-xs font-semibold shrink-0"
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* 2. Privacy Settings */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <Shield className="w-4 h-4 text-primary" />
            <span>Quyền riêng tư hồ sơ</span>
          </div>

          {/* Hide Profile Switch */}
          <div className="p-6 rounded-2xl bg-white border border-hairline shadow-2xs flex items-center justify-between gap-4">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs sm:text-sm font-semibold text-on-surface block">
                Ẩn hồ sơ khỏi mục Khám phá (Discovery)
              </span>
              <span className="text-[11px] sm:text-xs text-text-muted block leading-relaxed">
                Khi bật, các phụ huynh khác sẽ không thể tìm thấy hồ sơ của bạn
                trên danh sách đề xuất. Bạn vẫn có thể trò chuyện với bạn bè đã
                kết nối trước đó.
              </span>
            </div>
            <Switch
              checked={isProfileHidden}
              onChange={(checked) => setIsProfileHidden(checked)}
              aria-label="Ẩn hồ sơ phụ huynh"
            />
          </div>

          {/* Connection Privacy Radios */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-semibold text-on-surface block">
              Phạm vi nhận lời mời kết nối
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONNECTION_PRIVACY_OPTIONS.map((opt) => {
                const isSelected = connectionPrivacy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConnectionPrivacy(opt.value)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                        : 'border-hairline bg-white hover:border-outline-variant/70'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}
                      >
                        {opt.label}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-hairline bg-surface-container-low'
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Privacy Settings Action */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSavePrivacy}
            className="px-6 py-3 rounded-xl shadow-md font-semibold text-sm"
            isLoading={isUpdating}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu cài đặt riêng tư
          </Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePasswordSubmit}
        isSubmitting={isChangingPassword}
      />
    </>
  );
};

export default ProfileSecurityTab;
