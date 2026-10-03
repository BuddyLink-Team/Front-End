import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import playdateApi from '../api/playdateApi';
import {
  setPlaydates,
  setCounts,
  setActiveTab,
  setViewMode,
  setSearchQuery,
  setLoading,
  setError,
  markPlaydateCompleted,
} from '../redux/playdateSlice';
import { getApiErrorMsg } from '../../../utils/errorUtils';

const PLAYDATE_ERROR_MAP = {
  PARENT_NOT_FOUND: 'Không tìm thấy thông tin phụ huynh.',
  PLAYDATE_NOT_FOUND: 'Không tìm thấy thông tin buổi hẹn chơi.',
  FORBIDDEN: 'Chỉ người tổ chức mới có quyền hoàn thành buổi hẹn này.',
  INVALID_PLAYDATE_STATUS: 'Trạng thái buổi hẹn không hợp lệ để thao tác.',
};

export const usePlaydate = () => {
  const dispatch = useDispatch();
  const {
    items,
    counts,
    selectedPlaydate,
    activeTab,
    viewMode,
    searchQuery,
    isLoading,
    error,
  } = useSelector((state) => state.playdate);

  const [completingId, setCompletingId] = useState(null);
  const [confirmCompleteId, setConfirmCompleteId] = useState(null);

  /**
   * Fetch playdates from API
   */
  const fetchPlaydates = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const params = {};
      if (activeTab && activeTab !== 'all') {
        params.status = activeTab;
      }
      if (searchQuery?.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await playdateApi.getPlaydates(params);
      const data = response?.data || response;

      if (data?.playdates) {
        dispatch(setPlaydates(data.playdates));
      } else if (Array.isArray(data)) {
        dispatch(setPlaydates(data));
      }

      if (data?.counts) {
        dispatch(setCounts(data.counts));
      }
    } catch (err) {
      const msg = getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể tải danh sách cuộc hẹn.');
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  }, [activeTab, searchQuery, dispatch]);

  useEffect(() => {
    fetchPlaydates();
  }, [fetchPlaydates]);

  /**
   * Tab switch handler
   */
  const handleTabChange = useCallback(
    (tabId) => {
      dispatch(setActiveTab(tabId));
    },
    [dispatch]
  );

  /**
   * View mode toggle handler ('list' | 'calendar')
   */
  const handleViewModeChange = useCallback(
    (mode) => {
      dispatch(setViewMode(mode));
    },
    [dispatch]
  );

  /**
   * Search input handler
   */
  const handleSearchChange = useCallback(
    (query) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  /**
   * Prompt confirmation for completing playdate
   */
  const promptCompletePlaydate = useCallback((id) => {
    setConfirmCompleteId(id);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmCompleteId(null);
  }, []);

  /**
   * Execute playdate completion
   */
  const handleCompletePlaydate = useCallback(
    async (id) => {
      setCompletingId(id);
      try {
        const response = await playdateApi.completePlaydate(id);
        const updated = response?.data || response;
        dispatch(markPlaydateCompleted(updated));
        toast.success('Đã hoàn thành buổi hẹn chơi! Bé đã tích lũy thêm chuỗi ngày vui vẻ.');
        setConfirmCompleteId(null);
      } catch (err) {
        const msg = getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể hoàn thành buổi hẹn.');
        toast.error(msg);
      } finally {
        setCompletingId(null);
      }
    },
    [dispatch]
  );

  return {
    playdates: items,
    counts,
    selectedPlaydate,
    activeTab,
    viewMode,
    searchQuery,
    isLoading,
    error,
    completingId,
    confirmCompleteId,
    fetchPlaydates,
    handleTabChange,
    handleViewModeChange,
    handleSearchChange,
    promptCompletePlaydate,
    closeConfirmModal,
    handleCompletePlaydate,
  };
};

export default usePlaydate;
