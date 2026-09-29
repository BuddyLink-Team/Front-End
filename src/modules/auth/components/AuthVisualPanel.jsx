import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import authHeroImg from '../../../assets/images/auth-hero.png';

export const AuthVisualPanel = () => {
  return (
    <div className="relative w-full lg:w-1/2 min-h-[520px] lg:h-[1000px] flex flex-col justify-between p-8 lg:p-12 overflow-hidden bg-surface-container-low select-none">
      {/* Background Image Layer - using object-cover to prevent stretching/zooming */}
      <img
        src={authHeroImg}
        alt="Gia đình và con trẻ vui vẻ ngoài trời"
        className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
        aria-hidden="true"
      />

      {/* Serene Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent" />

      {/* Top Tag: Verified Community Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-white/40">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-sans text-xs uppercase tracking-wider text-on-surface font-semibold">
            Cộng đồng xác thực
          </span>
        </div>
      </div>

      {/* Bottom Narrative & Metric Cards */}
      <div className="relative z-10 space-y-4">
        <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md shadow-elevated border border-white/60 space-y-3">
          <div className="flex items-center gap-2 text-primary font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Không gian an lành &amp; an toàn cho trẻ</span>
          </div>

          <p className="font-sans text-base lg:text-lg font-semibold text-on-surface leading-snug">
            “Nơi cha mẹ kết nối bạn chơi tử tế, văn minh và xác thực 100% danh
            tính phụ huynh.”
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-hairline/60">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-semibold text-on-secondary-container border-2 border-white">
                  H
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-semibold text-on-primary-fixed border-2 border-white">
                  M
                </div>
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-xs font-semibold text-on-tertiary-fixed border-2 border-white">
                  L
                </div>
              </div>
              <span className="text-xs text-text-muted font-medium">
                12,000+ phụ huynh tin dùng
              </span>
            </div>

            <span className="text-xs text-primary font-semibold flex items-center gap-1">
              Khám phá <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthVisualPanel;
