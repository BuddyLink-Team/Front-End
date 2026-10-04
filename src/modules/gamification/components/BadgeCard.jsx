import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { BADGE_ICONS, BADGE_COLOR_THEMES } from '../constants/gamification.constants';

export function BadgeCard({ badge }) {
  const Icon = BADGE_ICONS[badge.code] || BADGE_ICONS.default;
  const theme = BADGE_COLOR_THEMES[badge.code] || {
    bg: 'bg-primary-fixed',
    text: 'text-on-primary-fixed',
    ring: 'ring-primary-fixed/40',
    border: 'border-primary/30',
    glow: 'shadow-[0_0_15px_rgba(123,174,127,0.35)]',
    accentText: 'text-primary-dark',
  };

  if (badge.unlocked) {
    return (
      <article
        className={`relative rounded-2xl bg-surface-container-lowest p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border-2 ${theme.border} ${theme.glow}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-16 h-16 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 shadow-sm ring-4 ${theme.ring}`}
          >
            <Icon className="w-8 h-8 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${theme.bg} ${theme.text} text-label-sm font-semibold`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã mở khóa</span>
            </div>
            <h3 className="text-title-md font-semibold text-on-surface">{badge.title}</h3>
            <p className="text-body-md text-on-surface-variant line-clamp-2">{badge.description}</p>
          </div>
        </div>
        <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant text-label-sm bg-surface-container-low/60 rounded-xl px-3 py-2 border border-outline-variant/10">
          <span>
            {badge.unlockedAt
              ? `Đạt: ${new Date(badge.unlockedAt).toLocaleDateString('vi-VN')}`
              : 'Đã hoàn thành'}
          </span>
          <span className={`font-semibold ${theme.accentText}`}>Hoàn thành 100%</span>
        </div>
      </article>
    );
  }

  // Locked badge: grayscale styling with accessible tooltip
  return (
    <article
      tabIndex={0}
      aria-describedby={`tooltip-${badge.code}`}
      className="group relative rounded-2xl bg-surface-container-lowest/80 p-5 shadow-sm flex flex-col justify-between opacity-85 border border-outline-variant/30 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-dim text-on-surface-variant/60 flex items-center justify-center shrink-0 grayscale">
          <Icon className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Chưa mở</span>
          </div>
          <h3 className="text-title-md font-semibold text-on-surface/80">{badge.title}</h3>
          <p className="text-body-md text-on-surface-variant line-clamp-2">{badge.description}</p>
        </div>
      </div>

      {/* Tooltip on Hover / Focus */}
      <div
        id={`tooltip-${badge.code}`}
        role="tooltip"
        className="absolute z-20 left-3 right-3 bottom-full mb-2 rounded-xl bg-inverse-surface text-inverse-on-surface p-3 text-body-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 pointer-events-none"
      >
        <p className="font-semibold text-xs text-primary-fixed mb-1">Điều kiện mở khóa:</p>
        <p className="text-xs text-inverse-on-surface leading-relaxed">{badge.description}</p>
      </div>

      <div className="mt-4 pt-3 space-y-1.5">
        <div className="flex items-center justify-between text-on-surface-variant text-label-sm">
          <span>Tiến độ</span>
          <span className="font-medium text-on-surface-variant">0%</span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
          <div className="bg-outline-variant h-1.5 rounded-full" style={{ width: '0%' }} />
        </div>
      </div>
    </article>
  );
}

export default BadgeCard;
