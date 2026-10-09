import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDiscovery } from '../hooks/useDiscovery';
import { useSwipe } from '../hooks/useSwipe';
import { DiscoveryFilterBar } from '../components/DiscoveryFilterBar';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { EmptyDiscovery } from '../components/EmptyDiscovery';
import DiscoveryFilterModal from '../components/DiscoveryFilterModal';
import ChildProfileDetailModal from '../components/ChildProfileDetailModal';
import { Loader2 } from 'lucide-react';

export const DiscoveryPage = () => {
  const reduxFilters = useSelector((s) => s.discovery?.filters);

  // URL params sync: ?filter=true, ?childId=:id
  const [searchParams, setSearchParams] = useSearchParams();
  // Single source of truth = URL; childId takes priority so the two modals never overlap
  const selectedChildId = searchParams.get('childId') || null;
  const isFilterOpen = !selectedChildId && searchParams.get('filter') === 'true';

  const { profiles, meta, isLoading, error, removeTopProfile } = useDiscovery(reduxFilters);
  const { handleSwipe } = useSwipe();

  // Sync URL when modal states change
  const openFilter = useCallback(() => {
    setSearchParams({ filter: 'true' });
  }, [setSearchParams]);

  const closeFilter = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const openChildDetail = useCallback(
    (childId) => {
      setSearchParams({ childId });
    },
    [setSearchParams]
  );

  const closeChildDetail = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleCardSwipe = useCallback(
    (direction, profile) => {
      if (!profile) return;
      const isLike = direction === 'LIKE';
      handleSwipe(profile.childId, isLike, removeTopProfile);
    },
    [handleSwipe, removeTopProfile]
  );

  // Keyboard shortcuts: ← Pass, → Like, Enter = view detail
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFilterOpen || selectedChildId) return;
      if (profiles.length === 0) return;
      const topProfile = profiles[0];

      if (e.key === 'ArrowLeft') handleCardSwipe('PASS', topProfile);
      else if (e.key === 'ArrowRight') handleCardSwipe('LIKE', topProfile);
      else if (e.key === 'Enter') openChildDetail(topProfile.childId);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profiles, handleCardSwipe, openChildDetail, isFilterOpen, selectedChildId]);

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 sm:px-6 max-w-2xl mx-auto select-none">
      {/* Filter bar with modal trigger */}
      <DiscoveryFilterBar meta={meta} onOpenFilter={openFilter} />

      {/* Card stack area */}
      <div className="relative w-full mt-4 pb-6" style={{ minHeight: '680px' }}>
        {isLoading && profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <Loader2 size={40} strokeWidth={1.5} className="animate-spin mb-4 text-primary" />
            <p>Đang tìm kiếm bạn bè quanh đây...</p>
          </div>
        ) : error ? (
          // Hiển thị giao diện báo lỗi kèm hướng dẫn thay vì màn hình trống
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-error font-medium mb-4">{error}</p>
            <p className="text-on-surface-variant text-sm">
              Vui lòng cập nhật vị trí của bạn trong phần <b>Hồ sơ</b> để hệ thống có thể gợi ý bạn bè xung quanh nhé!
            </p>
          </div>
        ) : profiles.length > 0 ? (
          [...profiles].reverse().map((profile, i) => {
            const actualIndex = profiles.length - 1 - i;
            const isTop = actualIndex === 0;
            if (actualIndex > 1) return null;
            return (
              <DiscoveryCard
                key={profile.childId}
                profile={profile}
                index={actualIndex}
                isTop={isTop}
                onSwipe={(dir) => handleCardSwipe(dir, profile)}
                onViewDetail={() => openChildDetail(profile.childId)}
              />
            );
          })
        ) : (
          <EmptyDiscovery />
        )}
      </div>

      {/* Filter modal */}
      <DiscoveryFilterModal isOpen={isFilterOpen} onClose={closeFilter} />

      {/* Child profile detail modal */}
      <ChildProfileDetailModal
        childId={selectedChildId}
        onClose={closeChildDetail}
        onSwipeDone={removeTopProfile}
      />
    </div>
  );
};

export default DiscoveryPage;
