import React from 'react';
import { Flame, Trophy, Check, Sparkles, Clock } from 'lucide-react';
import { WEEK_DAYS } from '../constants/gamification.constants';

export function StreakBanner({ streak, unlockedCount, totalBadgesCount }) {
  const currentStreak = streak?.currentWeeklyStreak || 0;
  const longestStreak = streak?.longestStreak || currentStreak;
  const isStreakActive = currentStreak > 0;

  return (
    <div className="relative w-full rounded-2xl bg-surface-container-lowest p-6 sm:p-8 shadow-sm overflow-hidden border border-outline-variant/20">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Streak Status & Description */}
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-md font-semibold">
            <span>🌱</span>
            <span>Chuỗi {currentStreak} tuần kết nối liên tục!</span>
          </div>
          <h2 className="text-headline-md font-semibold text-on-surface tracking-tight">
            Mỗi buổi hẹn chơi là một hạt mầm tình bạn nở hoa
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Hoàn thành ít nhất 1 Playdate mỗi tuần (thứ Hai – Chủ nhật, giờ Việt Nam) để tích lũy
            chuỗi và mở khóa các huy hiệu quý giá.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-on-surface-variant text-label-sm">
            <span className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-tertiary-dark" />
              Kỷ lục chuỗi:{' '}
              <strong className="text-on-surface font-semibold">{longestStreak} tuần</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-primary-dark" />
              Huy hiệu đã đạt:{' '}
              <strong className="text-on-surface font-semibold">
                {unlockedCount} / {totalBadgesCount}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Weekly Track Visual Progress */}
        <div className="w-full lg:w-auto min-w-[320px] bg-surface-container-low rounded-xl p-4 sm:p-5 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-label-md text-on-surface font-semibold">Tiến độ tuần này</span>
            <span className="text-label-sm text-primary-dark font-medium">
              {isStreakActive ? 'Đang có chuỗi' : 'Bắt đầu tuần mới'}
            </span>
          </div>

          {/* Weekly Nodes */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {WEEK_DAYS.map((day, idx) => {
              const isPassedDay = isStreakActive && idx < 5;
              const isCurrentDay = isStreakActive && idx === 5;

              return (
                <div key={day.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-label-sm text-on-surface-variant">{day.label}</span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm text-xs font-semibold ${
                      isPassedDay
                        ? 'bg-primary-container text-on-primary-container'
                        : isCurrentDay
                        ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                        : 'bg-surface-container-lowest text-outline border border-outline-variant/30'
                    }`}
                  >
                    {isPassedDay ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : isCurrentDay ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-outline/60" />
                    )}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {idx === 6 ? 'Nghỉ' : `Ngày ${idx + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Ribbon */}
          <div className="mt-4 pt-3 bg-surface-container-lowest/80 rounded-lg p-2.5 flex items-center justify-between border border-outline-variant/20">
            <span className="text-label-sm text-on-surface-variant">Mục tiêu chuỗi tuần</span>
            <div className="w-28 sm:w-36 bg-surface-container-highest rounded-full h-2 overflow-hidden mx-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, currentStreak * 25))}%`,
                }}
              />
            </div>
            <span className="text-label-sm text-primary-dark font-bold">{currentStreak}w</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakBanner;
