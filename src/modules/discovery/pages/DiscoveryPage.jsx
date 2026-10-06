import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useDiscovery } from '../hooks/useDiscovery';
import { useDiscoveryModals } from '../hooks/useDiscoveryModals';
import { DiscoveryFilterBar } from '../components/DiscoveryFilterBar';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { EmptyDiscovery } from '../components/EmptyDiscovery';
import DiscoveryFilterModal from '../components/DiscoveryFilterModal';
import ChildProfileDetailModal from '../components/ChildProfileDetailModal';
import { VISIBLE_CARD_COUNT } from '../constants/discoveryConstants';

export const DiscoveryPage = () => {
  const {
    selectedChildId,
    isFilterOpen,
    isAnyModalOpen,
    openFilter,
    closeFilter,
    openChildDetail,
    closeChildDetail,
  } = useDiscoveryModals();

  const {
    profiles,
    meta,
    isLoading,
    isSwiping,
    errorMessage,
    remainingViewsLabel,
    filterSummary,
    refetch,
    handleSwipe,
    goToUpgrade,
  } = useDiscovery({ isKeyboardEnabled: !isAnyModalOpen, onViewDetail: openChildDetail });

  // Render the top cards only, bottom-most first so the top card sits above the others
  const visibleProfiles = profiles.slice(0, VISIBLE_CARD_COUNT).reverse();

  const renderContent = () => {
    if (isLoading && profiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
          <Loader2 size={40} strokeWidth={1.5} className="animate-spin mb-4 text-primary" />
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
          onViewDetail={() => openChildDetail(profile.childId)}
        />
      );
    });
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 sm:px-6 max-w-2xl mx-auto select-none">
      {/* Filter bar with modal trigger */}
      <DiscoveryFilterBar
        meta={meta}
        remainingViewsLabel={remainingViewsLabel}
        filterSummary={filterSummary}
        onOpenFilter={openFilter}
        onUpgrade={goToUpgrade}
      />

      {/* Card stack area */}
      <div className="relative w-full mt-4 pb-6" style={{ minHeight: '680px' }}>
        {renderContent()}
      </div>

      {/* Filter modal */}
      <DiscoveryFilterModal isOpen={isFilterOpen} onClose={closeFilter} />

      {/* Child profile detail modal */}
      <ChildProfileDetailModal
        childId={selectedChildId}
        onClose={closeChildDetail}
        onSwipe={(direction) => handleSwipe(selectedChildId, direction)}
        isSwiping={isSwiping}
      />
    </div>
  );
};

export default DiscoveryPage;
