import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { StatusChip } from '../../../components/badges/StatusChip';
import { cn } from '../../../utils/cn';
import { BADGE_COLOR_THEMES } from '../constants/gamification.constants';
import { BadgeIcon } from './BadgeIcon';

export function BadgeCard({ badge }) {
  const theme = BADGE_COLOR_THEMES[badge.code] || BADGE_COLOR_THEMES.default;
  const { unlocked } = badge;

  return (
    <Card
      padding="sm"
      className={cn(
        'flex flex-col justify-between',
        unlocked ? cn('bg-gradient-to-br to-white shadow-elevated', theme.surface, theme.border) : 'bg-canvas',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'shrink-0 rounded-2xl p-1.5',
            unlocked ? cn('ring-2 shadow-soft', theme.halo) : 'bg-surface-muted',
          )}
        >
          <BadgeIcon badge={badge} locked={!unlocked} className="w-14 h-14" />
        </div>
        <div className="space-y-1 min-w-0">
          <StatusChip
            status={unlocked ? 'confirmed' : 'cancelled'}
            label={unlocked ? 'Đã mở khóa' : 'Chưa mở'}
            icon={unlocked ? CheckCircle2 : Lock}
          />
          <h3 className={cn('text-title-md', unlocked ? 'text-on-surface' : 'text-on-surface-variant')}>{badge.title}</h3>
          <p className="text-body-md text-on-surface-variant">{badge.description}</p>
        </div>
      </div>

      {unlocked ? (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-label-md text-on-surface-variant">
          <span>{badge.unlockedDateLabel ? `Đạt ngày ${badge.unlockedDateLabel}` : 'Đã hoàn thành'}</span>
          <span className="text-primary-dark">Hoàn thành</span>
        </div>
      ) : (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-label-md text-on-surface-variant">
            <span>Tiến độ</span>
            <span>
              {badge.progress} / {badge.requirementCount}
            </span>
          </div>
          <div
            className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={badge.requirementCount}
            aria-valuenow={badge.progress}
            aria-label={`Tiến độ huy hiệu ${badge.title}`}
          >
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${badge.progressPercent}%` }} />
          </div>
        </div>
      )}
    </Card>
  );
}

export default BadgeCard;
