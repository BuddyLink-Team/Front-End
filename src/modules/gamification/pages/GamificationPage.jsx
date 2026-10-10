import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/feedback/Spinner';
import { useGamification } from '../hooks/useGamification';
import StreakBanner from '../components/StreakBanner';
import BadgeGrid from '../components/BadgeGrid';

export default function GamificationPage() {
  const {
    isLoaded,
    loading,
    error,
    streak,
    filter,
    filterOptions,
    setFilter,
    badges,
    filteredBadges,
    unlockedCount,
    reload,
  } = useGamification();

  return (
    <div className="w-full max-w-[1160px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">Hành trình Trưởng thành & Thành tích</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Chuỗi hẹn chơi hằng tuần và các huy hiệu gia đình bạn đã đạt được.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={reload}
          isLoading={loading && isLoaded}
          leftIcon={<RefreshCw className="w-4 h-4 stroke-[1.75]" />}
        >
          Làm mới
        </Button>
      </div>

      {loading && !isLoaded && (
        <div className="py-20 flex flex-col items-center gap-3 text-on-surface-variant">
          <Spinner size="lg" />
          <p className="text-body-md">Đang tải dữ liệu thành tích...</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl bg-error-container border border-error/20 p-5 text-error-on-container">
          <p className="text-label-lg">{error}</p>
          <Button variant="ghost" size="sm" onClick={reload} className="mt-2 -ml-3">
            Thử lại
          </Button>
        </div>
      )}

      {isLoaded && (
        <>
          <StreakBanner streak={streak} unlockedCount={unlockedCount} totalBadgesCount={badges.length} />
          <BadgeGrid
            filteredBadges={filteredBadges}
            filter={filter}
            filterOptions={filterOptions}
            setFilter={setFilter}
          />
        </>
      )}
    </div>
  );
}
