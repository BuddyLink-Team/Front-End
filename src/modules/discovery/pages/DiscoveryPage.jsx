import React, { useEffect, useCallback } from 'react';
import { useDiscovery } from '../hooks/useDiscovery';
import { useSwipe } from '../hooks/useSwipe';
import { DiscoveryFilterBar } from '../components/DiscoveryFilterBar';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { EmptyDiscovery } from '../components/EmptyDiscovery';

export const DiscoveryPage = () => {
  const { profiles, meta, isLoading, removeTopProfile } = useDiscovery();
  const { handleSwipe } = useSwipe();

  const handleCardSwipe = useCallback((direction, profile) => {
    if (!profile) return;
    const isLike = direction === 'LIKE';
    handleSwipe(profile.childId, isLike, removeTopProfile);
  }, [handleSwipe, removeTopProfile]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (profiles.length === 0) return;
      const topProfile = profiles[0];

      if (e.key === 'ArrowLeft') {
        handleCardSwipe('PASS', topProfile);
      } else if (e.key === 'ArrowRight') {
        handleCardSwipe('LIKE', topProfile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profiles, handleCardSwipe]);

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 sm:px-6 max-w-2xl mx-auto select-none">
      <DiscoveryFilterBar meta={meta} />
      <div className="relative w-full mt-4 pb-6" style={{ minHeight: '680px' }}>
        {isLoading && profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
            <p>Đang tìm kiếm bạn bè quanh đây...</p>
          </div>
        ) : profiles.length > 0 ? (
          // Only render top 3 cards in a stack, top card is interactive
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
              />
            );
          })
        ) : (
          <EmptyDiscovery />
        )}
      </div>
    </div>
  );
};

export default DiscoveryPage;
