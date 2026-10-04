import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import StreakBanner from '../components/StreakBanner';
import BadgeGrid from '../components/BadgeGrid';

export default function GamificationPage() {
  const {
    data,
    loading,
    error,
    filter,
    setFilter,
    badges,
    filteredBadges,
    unlockedCount,
    lockedCount,
    reload,
  } = useGamification();

  return (
    <div className="w-full max-w-[1160px] mx-auto space-y-8 pb-12">
      {/* Header Context & Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-dark" />
            <span>Không gian gắn kết của bé & gia đình</span>
          </div>
          <h1 className="text-headline-lg font-semibold text-on-surface tracking-tight">
            Hành trình Trưởng thành & Thành tích
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Cùng bé lưu giữ từng bước chân kết nối đầu đời bằng những kỷ niệm an lành.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm text-label-md text-secondary-dark font-medium border border-outline-variant/30">
            Hạng Mầm Xanh
          </span>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-label-md font-semibold hover:opacity-95 transition-all shadow-sm"
          >
            Làm mới
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="py-20 text-center text-on-surface-variant">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3"></div>
          <p className="text-body-md font-medium">Đang tải dữ liệu thành tích...</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl bg-error-container p-5 text-on-error-container">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-2 text-label-md underline font-semibold hover:opacity-80"
          >
            Thử lại
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Featured Streak Card */}
          <StreakBanner
            streak={data.streak}
            unlockedCount={unlockedCount}
            totalBadgesCount={badges.length}
          />

          {/* Badges Section Header & Grid */}
          <BadgeGrid
            badges={badges}
            filteredBadges={filteredBadges}
            filter={filter}
            setFilter={setFilter}
            unlockedCount={unlockedCount}
            lockedCount={lockedCount}
          />

          {/* Community Playdate Memories Snapshot */}
          <div className="mt-8 rounded-2xl bg-surface-container-low p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 border border-outline-variant/20">
            <div className="w-full lg:w-1/3 space-y-2">
              <span className="text-label-sm text-primary-dark font-semibold uppercase tracking-wider">
                Khoảnh khắc đáng nhớ
              </span>
              <h3 className="text-headline-md font-semibold text-on-surface">
                Bộ sưu tập nụ cười của bé
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Những khoảnh khắc tự nhiên, chân thật được các phụ huynh lưu lại trong các buổi gặp gỡ
                gắn kết cùng BuddyLink.
              </p>
            </div>
            <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative h-40 rounded-xl overflow-hidden shadow-sm bg-surface-container-high flex flex-col justify-end p-3 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-primary/10 group-hover:scale-105 transition-transform duration-300" />
                <span className="relative z-20 text-white font-medium text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-fixed" /> Công viên Thống Nhất
                </span>
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow-sm bg-surface-container-high flex flex-col justify-end p-3 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-secondary/10 group-hover:scale-105 transition-transform duration-300" />
                <span className="relative z-20 text-white font-medium text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-secondary-fixed" /> Cà phê Sách Thiếu Nhi
                </span>
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow-sm bg-surface-container-high flex flex-col justify-end p-3 group hidden sm:flex">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-tertiary/10 group-hover:scale-105 transition-transform duration-300" />
                <span className="relative z-20 text-white font-medium text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-tertiary-fixed" /> Sân chơi KĐT Sala
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
