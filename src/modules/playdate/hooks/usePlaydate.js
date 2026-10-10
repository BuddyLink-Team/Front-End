import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { useDebounce } from '../../../hooks/useDebounce';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import {
  fetchPlaydates as fetchPlaydatesThunk,
  completePlaydate,
  cancelPlaydate,
  setActiveTab,
  setViewMode,
  setSearchQuery,
  setPage,
} from '../redux/playdateSlice';
import {
  PLAYDATE_ERROR_MAP,
  PLAYDATE_VIEW_MODES,
  PLAYDATE_PAGE_SIZE,
  PLAYDATE_CALENDAR_LIMIT,
} from '../constants/playdateConstants';

const SEARCH_DEBOUNCE_MS = 350;
// The calendar grid also shows the end of the previous month and the start of the next one
const CALENDAR_PADDING_DAYS = 7;

/** Date range loaded for the calendar month (with the padding days shown around it) */
const getCalendarRange = (month) => {
  const from = new Date(month.getFullYear(), month.getMonth(), 1 - CALENDAR_PADDING_DAYS);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, CALENDAR_PADDING_DAYS, 23, 59, 59);
  return { fromDate: from.toISOString(), toDate: to.toISOString() };
};

/**
 * Playdate list page: tabs, search, view mode, complete / cancel / reschedule entry points.
 * API calls live in the playdate slice thunks.
 */
export const usePlaydate = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, counts, selectedPlaydate, activeTab, viewMode, searchQuery, page, pagination, isLoading, error } =
    useSelector((state) => state.playdate);
  // First day of the month shown by the calendar view
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [completingId, setCompletingId] = useState(null);
  const [confirmCompleteId, setConfirmCompleteId] = useState(null);
  const [reschedulingPlaydate, setReschedulingPlaydate] = useState(null);
  const [cancellingPlaydate, setCancellingPlaydate] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Debounce search query to prevent excessive API requests while typing
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const fetchPlaydates = useCallback(async () => {
    const params = {};
    if (activeTab && activeTab !== 'all') params.status = activeTab;
    if (debouncedSearch?.trim()) params.search = debouncedSearch.trim();
    // List: one page at a time. Calendar: every playdate of the displayed month.
    if (viewMode === PLAYDATE_VIEW_MODES.CALENDAR) {
      Object.assign(params, getCalendarRange(calendarMonth), { limit: PLAYDATE_CALENDAR_LIMIT });
    } else {
      Object.assign(params, { page, limit: PLAYDATE_PAGE_SIZE });
    }

    try {
      await dispatch(fetchPlaydatesThunk(params)).unwrap();
    } catch (err) {
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể tải danh sách cuộc hẹn.'));
    }
  }, [activeTab, debouncedSearch, viewMode, calendarMonth, page, dispatch, toast]);

  useEffect(() => {
    fetchPlaydates();
  }, [fetchPlaydates]);

  const handleTabChange = useCallback((tabId) => dispatch(setActiveTab(tabId)), [dispatch]);
  const handleViewModeChange = useCallback((mode) => dispatch(setViewMode(mode)), [dispatch]);
  const handleSearchChange = useCallback((query) => dispatch(setSearchQuery(query)), [dispatch]);
  const handlePageChange = useCallback((nextPage) => dispatch(setPage(nextPage)), [dispatch]);
  const handleCalendarMonthChange = useCallback(
    (month) => setCalendarMonth(new Date(month.getFullYear(), month.getMonth(), 1)),
    [],
  );

  const promptCompletePlaydate = useCallback((id) => setConfirmCompleteId(id), []);
  const closeConfirmModal = useCallback(() => setConfirmCompleteId(null), []);

  const handleCompletePlaydate = useCallback(
    async (id) => {
      setCompletingId(id);
      try {
        await dispatch(completePlaydate(id)).unwrap();
        toast.success('Đã hoàn thành buổi hẹn chơi! Bé đã tích lũy thêm chuỗi ngày vui vẻ.');
        setConfirmCompleteId(null);
      } catch (err) {
        toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể hoàn thành buổi hẹn.'));
      } finally {
        setCompletingId(null);
      }
    },
    [dispatch, toast],
  );

  // Header shortcut: reschedule the next upcoming playdate the parent hosts (only hosts may reschedule)
  const handleTopRescheduleClick = useCallback(() => {
    const nextHosted = items.find((p) => p.status === 'upcoming' && p.isHost);
    if (nextHosted) {
      setReschedulingPlaydate(nextHosted);
    } else {
      toast.toast('Bạn chưa tổ chức cuộc hẹn sắp tới nào để dời lịch.');
    }
  }, [items, toast]);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancellingPlaydate) return;
    setIsCancelling(true);
    try {
      await dispatch(cancelPlaydate({ id: cancellingPlaydate.id, reason: 'Hủy bởi phụ huynh tổ chức' })).unwrap();
      toast.success('Đã hủy cuộc hẹn chơi thành công.');
      setCancellingPlaydate(null);
      fetchPlaydates();
    } catch (err) {
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể hủy cuộc hẹn. Vui lòng thử lại sau.'));
    } finally {
      setIsCancelling(false);
    }
  }, [cancellingPlaydate, dispatch, fetchPlaydates, toast]);

  const handleRescheduleSuccess = useCallback(() => {
    setReschedulingPlaydate(null);
    fetchPlaydates();
  }, [fetchPlaydates]);

  return {
    playdates: items,
    counts,
    selectedPlaydate,
    activeTab,
    viewMode,
    searchQuery,
    page,
    totalPages: pagination?.totalPages || 1,
    calendarMonth,
    isLoading,
    error,
    completingId,
    confirmCompleteId,
    reschedulingPlaydate,
    cancellingPlaydate,
    isCancelling,
    fetchPlaydates,
    handleTabChange,
    handleViewModeChange,
    handleSearchChange,
    handlePageChange,
    handleCalendarMonthChange,
    promptCompletePlaydate,
    closeConfirmModal,
    handleCompletePlaydate,
    handleTopRescheduleClick,
    setReschedulingPlaydate,
    setCancellingPlaydate,
    handleConfirmCancel,
    handleRescheduleSuccess,
  };
};

export default usePlaydate;
