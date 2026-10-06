import React from 'react';
import { Button } from '../../../components/ui/Button';
import { useDiscovery } from '../hooks/useDiscovery';
import { DiscoveryFilterBar } from '../components/DiscoveryFilterBar';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { EmptyDiscovery } from '../components/EmptyDiscovery';
import { VISIBLE_CARD_COUNT } from '../constants/discoveryConstants';

export const DiscoveryPage = () => {
  const { profiles, meta, isLoading, errorMessage, remainingViewsLabel, refetch, handleSwipe, goToUpgrade } =
    useDiscovery();

  // Render the top cards only, bottom-most first so the top card sits above the others
  const visibleProfiles = profiles.slice(0, VISIBLE_CARD_COUNT).reverse();

  const renderContent = () => {
    if (isLoading && profiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
          <p>Đang tìm kiếm bạn bè quanh đây...</p>
        </div>
      );
    }

    if (errorMessage && profiles.length === 0) {
      return (
        <EmptyDiscovery
          icon="⚠️"
          title="Không tải được danh sách khám phá"
          description={errorMessage}
          action={<Button onClick={refetch}>Thử lại</Button>}
        />
      );
    }

    if (profiles.length === 0) {
      return <EmptyDiscovery />;
    }

    return visibleProfiles.map((profile) => {
      const index = profiles.indexOf(profile);
      return (
        <DiscoveryCard
          key={profile.childId}
          profile={profile}
          index={index}
          isTop={index === 0}
          onSwipe={(direction) => handleSwipe(profile, direction)}
        />
      );
    });
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 sm:px-6 max-w-2xl mx-auto select-none">
      <DiscoveryFilterBar meta={meta} remainingViewsLabel={remainingViewsLabel} onUpgrade={goToUpgrade} />
      <div className="relative w-full mt-4 pb-6" style={{ minHeight: '680px' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default DiscoveryPage;
