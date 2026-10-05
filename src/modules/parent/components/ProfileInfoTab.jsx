import React from 'react';
import { User, MapPin, Save, Sparkles } from 'lucide-react';
import { Input, Textarea, Button, Card } from '../../../components';
import { useProfileInfo } from '../hooks/useParentTabHooks';

export const ProfileInfoTab = ({ profile, onUpdate, isUpdating }) => {
  const { register, handleSubmit, errors } = useProfileInfo({
    profile,
    onUpdate,
  });

  return (
    <Card className="p-6 sm:p-8 rounded-3xl border border-hairline bg-white shadow-sm">
      <div className="pb-5 mb-6 border-b border-hairline/80 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-on-surface">
            Thông tin tài khoản
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Quản lý tên hiển thị, giới thiệu và địa chỉ khu vực của gia đình
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Full Name Field */}
        <Input
          id="profile-fullName"
          label="Họ và tên phụ huynh"
          placeholder="VD: Nguyễn Thu Hà"
          leftIcon={<User className="w-4 h-4 text-text-muted" />}
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        {/* Bio Field */}
        <Textarea
          id="profile-bio"
          label="Giới thiệu bản thân & gia đình"
          placeholder="Chia sẻ đôi nét về quan điểm nuôi dạy con, tính cách gia đình hoặc sở thích chung của ba mẹ và bé..."
          rows={3}
          error={errors.bio?.message}
          {...register('bio')}
        />

        {/* Location Section */}
        <div className="p-6 rounded-2xl bg-white border border-hairline shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Khu vực sinh sống</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="profile-city"
              label="Tỉnh / Thành phố"
              placeholder="VD: TP. Hồ Chí Minh"
              error={errors.city?.message}
              required
              {...register('city')}
            />

            <Input
              id="profile-area"
              label="Phường / Xã"
              placeholder="VD: Phường Bến Nghé"
              error={errors.area?.message}
              required
              {...register('area')}
            />
          </div>

          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-primary-fixed/20 border border-primary/20 text-xs text-on-surface-variant">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span className="leading-relaxed">
              Hệ thống tự động đồng bộ địa chỉ đầy đủ (Phường/Xã, Tỉnh/Thành
              phố) để tính toán bán kính ghép bạn chính xác nhất.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="px-6 py-3 rounded-xl shadow-md font-semibold text-sm"
            isLoading={isUpdating}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileInfoTab;
