import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useServerTable } from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';
import { useAdminStats } from './useAdminStats';

/**
 * Shared logic of the oversight screens (playdates, connections): server-side list kept in the URL,
 * detail modal, and one admin action (cancel / remove) confirmed with a reason.
 *
 * @param {Object} config
 * @param {Function} config.fetchList - List thunk (params)
 * @param {Function} config.fetchStats - Platform-wide counts thunk, shown above the list
 * @param {Function} config.fetchDetail - Detail thunk (id)
 * @param {Function} config.clearDetail - Action creator that empties the detail slot
 * @param {'playdateDetail'|'connectionDetail'} config.detailKey - Detail slot in the admin slice
 * @param {Function} config.runAction - Action thunk ({ id, reason })
 * @param {{ listError: string, detailError: string, actionSuccess: string, actionError: string }} config.messages
 * @param {string} [config.openStateKey] - Router state that opens a detail, e.g. navigate(route, { state: { openPlaydateId } })
 */
export const useAdminOversight = ({
  fetchList,
  fetchStats,
  fetchDetail,
  clearDetail,
  detailKey,
  runAction,
  messages,
  openStateKey,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const detail = useSelector((state) => state.admin[detailKey]);
  const isActionLoading = useSelector((state) => state.admin.isOversightActionLoading);

  const fetcher = useCallback((params) => dispatch(fetchList(params)).unwrap(), [dispatch, fetchList]);
  const table = useServerTable({ fetcher, defaultParams: { limit: 10 } });
  const { refetch } = table;
  const stats = useAdminStats(fetchStats);
  const reloadStats = stats.reload;

  const [selectedId, setSelectedId] = useState(() => location.state?.[openStateKey] || null);
  const [actionTarget, setActionTarget] = useState(null);

  const loadDetail = useCallback(
    (id) =>
      dispatch(fetchDetail(id))
        .unwrap()
        .catch((err) => {
          toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, messages.detailError));
          setSelectedId(null);
        }),
    [dispatch, fetchDetail, toastError, messages.detailError]
  );

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      dispatch(clearDetail());
    }
  }, [dispatch, clearDetail, loadDetail, selectedId]);

  const openDetail = useCallback((item) => {
    if (item?.id) setSelectedId(item.id);
  }, []);

  const closeDetail = useCallback(() => setSelectedId(null), []);

  const openAction = useCallback((item) => setActionTarget(item), []);

  const closeAction = useCallback(() => setActionTarget(null), []);

  const confirmAction = useCallback(
    async (reason) => {
      if (!actionTarget?.id) return;
      try {
        await dispatch(runAction({ id: actionTarget.id, reason })).unwrap();
        success(messages.actionSuccess);
        setActionTarget(null);
        // An open modal on the same item shows its new status
        if (selectedId === actionTarget.id) loadDetail(actionTarget.id);
        refetch();
        // Counts follow the status change
        reloadStats();
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, messages.actionError));
      }
    },
    [actionTarget, dispatch, runAction, success, toastError, messages, selectedId, loadDetail, refetch, reloadStats]
  );

  return {
    ...table,
    stats,
    listErrorMessage: table.error ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, table.error, messages.listError) : null,
    detailData: detail.data,
    // Overlay only on the first load of an item, not on an in-place reload
    isDetailLoading: detail.isLoading && !detail.data,
    isDetailModalOpen: Boolean(selectedId),
    openDetail,
    closeDetail,
    actionTarget,
    openAction,
    closeAction,
    confirmAction,
    isActionLoading,
  };
};

export default useAdminOversight;
