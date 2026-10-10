import React from 'react';
import { Flame, Trophy, Check, CalendarClock } from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { StatusChip } from '../../../components/badges/StatusChip';
import { cn } from '../../../utils/cn';

export function StreakBanner({ streak, unlockedCount, totalBadgesCount }) {
  const { currentWeeklyStreak, longestStreak, isCurrentWeekCompleted, goalWeeks, goalNodes } = streak;

  return (
    <Card padding="lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Streak Status & Description */}
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary-dark text-label-md">
            <Flame className="w-4 h-4 stroke-[1.75]" />
            <span>Chuỗi {currentWeeklyStreak} tuần liên tiếp</span>
          </div>
          <h2 className="text-headline-md text-on-surface tracking-tight">
            Mỗi buổi hẹn chơi là một hạt mầm tình bạn nở hoa
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Hoàn thành ít nhất 1 Playdate mỗi tuần (thứ Hai – Chủ nhật, giờ Việt Nam) để giữ chuỗi
            và mở khóa các huy hiệu quý giá.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-on-surface-variant text-label-md">
            <span className="flex items-center gap-1.5 bg-surface-muted px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 stroke-[1.75] text-tertiary-dark" />
              Kỷ lục chuỗi: <strong className="text-on-surface font-semibold">{longestStreak} tuần</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-surface-muted px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4 stroke-[1.75] text-primary-dark" />
              Huy hiệu đã đạt:{' '}
              <strong className="text-on-surface font-semibold">
                {unlockedCount} / {totalBadgesCount}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: progress toward the weekly streak goal */}
        <div className="w-full lg:w-80 bg-surface-muted rounded-2xl p-5 border border-hairline">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-label-lg text-on-surface">Mục tiêu {goalWeeks} tuần</span>
            <StatusChip
              status={isCurrentWeekCompleted ? 'confirmed' : 'pending'}
              label={isCurrentWeekCompleted ? 'Tuần này đã xong' : 'Tuần này chưa có'}
              icon={isCurrentWeekCompleted ? Check : CalendarClock}
              className="shrink-0 text-[11px] px-2 py-0.5"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {goalNodes.map((isDone, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    isDone ? 'bg-primary text-white' : 'bg-white text-outline border border-hairline-strong',
                  )}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[1.75]" /> : <Flame className="w-4 h-4 stroke-[1.5]" />}
                </div>
                <span className="text-label-sm text-on-surface-variant">Tuần {idx + 1}</span>
              </div>
            ))}
          </div>

          {!isCurrentWeekCompleted && (
            <p className="mt-4 text-label-md text-on-surface-variant">
              Hoàn thành 1 Playdate trước Chủ nhật để {currentWeeklyStreak > 0 ? 'giữ chuỗi' : 'bắt đầu chuỗi'}.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default StreakBanner;
