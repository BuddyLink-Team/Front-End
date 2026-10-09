import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchNearbyPlaces, fetchPlaceDetail } from '../redux/playdateSlice';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PLAYDATE_ERROR_MAP } from '../constants/playdateConstants';

const SEARCH_DEBOUNCE_MS = 350;
// While the Back-End fetches the places of a new area, the list is reloaded on its own
const SYNC_RELOAD_MS = 15000;
const SYNC_MAX_RELOADS = 8;

/**
 * Nearby / Search / Details of kid-friendly places (PROJECT_OVERVIEW 7.2, OpenStreetMap data).
 * The Back-End searches around the parent's saved location.
 */
export const usePlaceSearch = (isOpen) => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isAreaSyncing, setIsAreaSyncing] = useState(false);
  const [syncReloads, setSyncReloads] = useState(0);

  // Each opening starts on the list
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlace(null);
      setSyncReloads(0);
    }
  }, [isOpen]);

  // A new search starts a new round of reloads
  useEffect(() => {
    setSyncReloads(0);
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let isCurrent = true;
    // A reload runs at once, a typed search waits for the debounce
    const timer = setTimeout(async () => {
      const params = {};
      if (activeCategory !== 'all') params.type = activeCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      // A reload keeps the current list on screen instead of a spinner
      if (syncReloads === 0) setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await dispatch(fetchNearbyPlaces(params)).unwrap();
        if (isCurrent) {
          setPlaces(Array.isArray(data) ? data : data?.places || []);
          setIsAreaSyncing(Boolean(data?.areaSyncing));
        }
      } catch (err) {
        if (isCurrent) {
          setPlaces([]);
          setIsAreaSyncing(false);
          setErrorMessage(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể tải danh sách địa điểm.'));
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, syncReloads === 0 ? SEARCH_DEBOUNCE_MS : 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [isOpen, activeCategory, searchTerm, syncReloads, dispatch]);

  // Search again a little later while the area is being synced
  useEffect(() => {
    if (!isOpen || !isAreaSyncing || syncReloads >= SYNC_MAX_RELOADS) return undefined;
    const timer = setTimeout(() => setSyncReloads((count) => count + 1), SYNC_RELOAD_MS);
    return () => clearTimeout(timer);
  }, [isOpen, isAreaSyncing, syncReloads]);

  /**
   * Full details of a place (the API fills a missing address). Falls back to the list data.
   * @returns {Promise<Object>}
   */
  const loadPlaceDetail = useCallback(
    async (place) => {
      setIsDetailLoading(true);
      try {
        const detail = await dispatch(fetchPlaceDetail(place.id)).unwrap();
        return { ...place, ...detail };
      } catch {
        return place;
      } finally {
        setIsDetailLoading(false);
      }
    },
    [dispatch],
  );

  const openPlace = useCallback(
    async (place) => {
      setSelectedPlace(place);
      const detail = await loadPlaceDetail(place);
      setSelectedPlace((current) => (current?.id === place.id ? detail : current));
    },
    [loadPlaceDetail],
  );

  const closePlace = useCallback(() => setSelectedPlace(null), []);

  return {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    places,
    isLoading,
    isAreaSyncing,
    errorMessage,
    selectedPlace,
    isDetailLoading,
    openPlace,
    closePlace,
    loadPlaceDetail,
  };
};

export default usePlaceSearch;
