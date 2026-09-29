import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components';

export const OnboardingSuccessStep = ({ formData, onComplete }) => {
  return (
    <div className="space-y-6 text-center py-6 animate-fadeIn">
      {/* Celebration Icon with Pulse Rings */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping pointer-events-none" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sẵn sàng kết nối bạn chơi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display">
          Thiết lập hoàn tất! 🎉
        </h2>
        <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          Hồ sơ của bé <strong className="text-on-surface font-semibold">{formData.displayName || 'Bé'}</strong> và tiêu chí ghép bạn của gia đình đã được lưu thành công. Hệ thống BuddyLink đã chuẩn bị các bạn nhỏ phù hợp quanh khu vực của bạn!
        </p>
      </div>

      {/* Summary Profile Preview Card */}
      <div className="bg-surface-container-low/70 border border-hairline rounded-2xl p-5 text-left max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between border-b border-hairline pb-2.5">
          <span className="text-xs text-text-muted">Bé yêu:</span>
          <span className="text-xs font-bold text-on-surface">
            {formData.displayName} ({formData.gender === 'boy' ? 'Bé trai' : formData.gender === 'girl' ? 'Bé gái' : 'Khác'})
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-hairline pb-2.5">
          <span className="text-xs text-text-muted">Khu vực tìm bạn:</span>
          <span className="text-xs font-semibold text-primary">
            {formData.area}, {formData.city} (≤ {formData.maxDistanceKm} km)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Số sở thích đã chọn:</span>
          <span className="text-xs font-semibold text-on-surface">
            {formData.interests.length} sở thích & {formData.favoriteActivities.length} hoạt động
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 flex justify-center">
        <Button
          type="button"
          onClick={onComplete}
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          className="px-8 shadow-lg shadow-primary/20"
        >
          Khám phá bạn chơi ngay
        </Button>
      </div>
    </div>
  );
};

export default OnboardingSuccessStep;
