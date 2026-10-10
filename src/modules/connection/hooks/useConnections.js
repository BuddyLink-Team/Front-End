import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { useSafetyActions } from '../../safety/hooks/useSafetyActions';
import { openDirectConversation } from '../../chat/redux/chatSlice';
import {
  TIME_SLOT_OPTIONS,
  LOCATION_PREFERENCE_OPTIONS,
  PLAYDATE_DAY_OPTIONS,
} from '../../child/constants/childConstants';
import {
  fetchConnectionLists,
  fetchConnectionList,
  acceptConnection,
  declineConnection,
  removeConnection,
} from '../redux/connectionSlice';
import { CONNECTION_ACTIONS, CONNECTION_ERROR_MAP, CONNECTION_LISTS } from '../constants/connection.constants';

const labelsOf = (values = [], options) =>
  values.map((value) => options.find((option) => option.value === value)?.label || value);

/**
 * ConnectionDTO -> card view model (partner = the other parent, with their first child)
 */
const toViewModel = (connection) => {
  const partner = connection.partner || {};
  const child = partner.child || null;
  return {
    id: connection.id,
    status: connection.status,
    direction: connection.direction,
    partnerId: partner.id,
    parentName: partner.fullName || 'Phụ huynh',
    avatarUrl: partner.avatarUrl || null,
    isVerified: Boolean(partner.isVerifiedParent),
    childName: child?.displayName || null,
    childAge: child?.age ?? null,
    childGender: child?.gender || null,
    interests: [...(child?.interests || []), ...(child?.favoriteActivities || [])],
    area: [partner.location?.area, partner.location?.city].filter(Boolean).join(', '),
    preferredDays: labelsOf(partner.preferences?.preferredPlaydateDays, PLAYDATE_DAY_OPTIONS),
    preferredTimeSlots: labelsOf(partner.preferences?.preferredTimeSlots, TIME_SLOT_OPTIONS),
    preferredLocations: labelsOf(partner.preferences?.preferredLocations, LOCATION_PREFERENCE_OPTIONS),
  };
};

const SUCCESS_MESSAGES = {
  [CONNECTION_ACTIONS.ACCEPT]: 'Đã chấp nhận lời mời kết nối!',
  [CONNECTION_ACTIONS.DECLINE]: 'Đã từ chối lời mời kết nối.',
  [CONNECTION_ACTIONS.REMOVE]: 'Đã hủy kết nối.',
  [CONNECTION_ACTIONS.CANCEL]: 'Đã thu hồi lời mời kết nối.',
};

const ACTION_THUNKS = {
  [CONNECTION_ACTIONS.ACCEPT]: acceptConnection,
  [CONNECTION_ACTIONS.DECLINE]: declineConnection,
  [CONNECTION_ACTIONS.REMOVE]: removeConnection,
  [CONNECTION_ACTIONS.CANCEL]: removeConnection,
};

const SEARCH_DEBOUNCE_MS = 300;
const FIRST_PAGES = Object.fromEntries(Object.values(CONNECTION_LISTS).map((list) => [list, 1]));

/**
 * Connections page: accepted connections, incoming / outgoing requests and their actions.
 * Lists are paginated and searched by the backend (name of the parent or of their child).
 * Every action is confirmed first (requestAction -> confirmAction).
 */
const useConnections = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { blockUser } = useSafetyActions();

  const { accepted, incoming, outgoing, isLoading, pendingActionId, error } = useSelector(
    (state) => state.connection
  );

  const [activeList, setActiveList] = useState(CONNECTION_LISTS.ACCEPTED);
  const [searchQuery, setSearchQuery] = useState('');
  const search = useDebounce(searchQuery.trim(), SEARCH_DEBOUNCE_MS);
  // Current page of each list (a ref: reloading after an action keeps the pages without re-rendering)
  const pagesRef = useRef(FIRST_PAGES);

  // { action, connection } waiting for confirmation
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Every list (tab counts), each on its current page
  const refresh = useCallback(
    () => dispatch(fetchConnectionLists({ search, pages: pagesRef.current })),
    [dispatch, search]
  );

  // New search: back to the first page of every list
  useEffect(() => {
    pagesRef.current = FIRST_PAGES;
    dispatch(fetchConnectionLists({ search }));
  }, [dispatch, search]);

  const changePage = useCallback(
    (page) => {
      pagesRef.current = { ...pagesRef.current, [activeList]: page };
      dispatch(fetchConnectionList({ list: activeList, page, search }));
    },
    [activeList, dispatch, search]
  );

  const lists = useMemo(
    () => ({
      [CONNECTION_LISTS.ACCEPTED]: accepted.items.map(toViewModel),
      [CONNECTION_LISTS.INCOMING]: incoming.items.map(toViewModel),
      [CONNECTION_LISTS.OUTGOING]: outgoing.items.map(toViewModel),
    }),
    [accepted, incoming, outgoing]
  );

  const totals = {
    [CONNECTION_LISTS.ACCEPTED]: accepted.pagination.total,
    [CONNECTION_LISTS.INCOMING]: incoming.pagination.total,
    [CONNECTION_LISTS.OUTGOING]: outgoing.pagination.total,
  };
  const activePagination = { accepted, incoming, outgoing }[activeList].pagination;

  const requestAction = useCallback((action, connection) => setPendingConfirm({ action, connection }), []);
  const cancelAction = useCallback(() => setPendingConfirm(null), []);

  const confirmAction = useCallback(async () => {
    if (!pendingConfirm) return;
    const { action, connection } = pendingConfirm;
    setIsConfirming(true);
    try {
      if (action === CONNECTION_ACTIONS.BLOCK) {
        // useSafetyActions shows its own success / error toast
        const result = await blockUser(connection.partnerId, connection.parentName, 'Blocked from connections');
        if (result.success) refresh();
      } else {
        await dispatch(ACTION_THUNKS[action](connection.id)).unwrap();
        toast.success(SUCCESS_MESSAGES[action]);
        // Reload: the connection moved between lists and the totals changed
        refresh();
      }
    } catch (err) {
      toast.error(getApiErrorMsg(CONNECTION_ERROR_MAP, err, 'Thao tác không thành công. Vui lòng thử lại.'));
    } finally {
      setIsConfirming(false);
      setPendingConfirm(null);
    }
  }, [pendingConfirm, blockUser, dispatch, refresh, toast]);

  // Open (or create) the direct chat with the other parent
  const openChat = useCallback(
    async (connection) => {
      try {
        const conversation = await dispatch(openDirectConversation(connection.partnerId)).unwrap();
        navigate(`/chat/${conversation.id}`);
      } catch (err) {
        toast.error(getApiErrorMsg(CONNECTION_ERROR_MAP, err, 'Không thể mở cuộc trò chuyện.'));
      }
    },
    [dispatch, navigate, toast]
  );

  // Create playdate form with this friend already invited
  const invitePlaydate = useCallback(
    (connection) => navigate(`/playdates/create?invite=${connection.partnerId}`),
    [navigate]
  );

  return {
    lists,
    totals,
    activeList,
    setActiveList,
    searchQuery,
    setSearchQuery,
    isSearching: Boolean(search),
    page: activePagination.page,
    totalPages: activePagination.totalPages,
    changePage,
    isLoading,
    pendingActionId,
    fetchError: error ? getApiErrorMsg(CONNECTION_ERROR_MAP, error, 'Không thể tải danh sách kết nối.') : null,
    pendingConfirm,
    isConfirming,
    requestAction,
    cancelAction,
    confirmAction,
    openChat,
    invitePlaydate,
    refresh,
  };
};

export default useConnections;
