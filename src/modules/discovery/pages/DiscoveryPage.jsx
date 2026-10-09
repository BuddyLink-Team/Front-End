import React from 'react';
import { AlertTriangle, Compass } from 'lucide-react';
import { Spinner } from '../../../components/feedback/Spinner';
import { EmptyState } from '../../../components/cards/EmptyState';
import { useDiscovery } from '../hooks/useDiscovery';
import { useDiscoveryModals } from '../hooks/useDiscoveryModals';
import { DiscoveryFilterBar } from '../components/DiscoveryFilterBar';
import { DiscoveryCard } from '../components/DiscoveryCard';
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
    searchingForLabel,
    childOptions,
    selectedChildId: matchingChildId,
    selectChild,
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
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
          <Spinner size="lg" className="mb-4" />
          <p>Đang tìm kiếm bạn bè quanh đây...</p>
        </div>
      );
    }

    if (errorMessage && profiles.length === 0) {
      return (
        <EmptyState
          icon={<AlertTriangle size={24} strokeWidth={1.5} />}
          title="Không tải được danh sách khám phá"
          description={errorMessage}
          actionLabel="Thử lại"
          onAction={refetch}
          className="w-full mx-auto mt-10"
        />
      );
    }

    if (profiles.length === 0) {
      return (
        <EmptyState
          icon={<Compass size={24} strokeWidth={1.5} />}
          title="Bạn đã xem hết các hồ sơ quanh đây!"
          description="Hãy thử mở rộng bán kính tìm kiếm hoặc thay đổi bộ lọc để khám phá thêm nhiều người bạn thú vị khác cho bé nhé."
          className="w-full mx-auto mt-10"
        />
      );
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
        searchingForLabel={searchingForLabel}
        childOptions={childOptions}
        selectedChildId={matchingChildId}
        onSelectChild={selectChild}
        filterSummary={filterSummary}
        onOpenFilter={openFilter}
        onUpgrade={goToUpgrade}
      />

      {/* Card stack area: cards share one grid cell, so its height follows the tallest card
          and nothing below (footer) is overlapped */}
      <div className="grid w-full mt-3 pb-6">
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
