import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Discovery modal state synced with the URL (?filter=true, ?childId=:id).
 * The URL is the single source of truth; childId takes priority so the two modals never overlap.
 */
export const useDiscoveryModals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChildId = searchParams.get('childId') || null;
  const isFilterOpen = !selectedChildId && searchParams.get('filter') === 'true';

  const openFilter = useCallback(() => setSearchParams({ filter: 'true' }), [setSearchParams]);
  const openChildDetail = useCallback((childId) => setSearchParams({ childId }), [setSearchParams]);
  const closeModals = useCallback(() => setSearchParams({}), [setSearchParams]);

  return {
    selectedChildId,
    isFilterOpen,
    isAnyModalOpen: isFilterOpen || Boolean(selectedChildId),
    openFilter,
    openChildDetail,
    closeFilter: closeModals,
    closeChildDetail: closeModals,
  };
};

export default useDiscoveryModals;
