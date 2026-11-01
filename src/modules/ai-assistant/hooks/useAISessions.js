import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAISessions, deleteAISession, setActiveAISession } from '../redux/aiAssistantSlice';
import { groupSessionsByDate } from '../utils/aiAssistantUtils';
import { AI_ERROR_MESSAGES, AI_LIMITS } from '../constants/ai-assistant.constants';

/**
 * Conversation history: grouped list, paging, selection, new conversation and delete.
 * A new conversation is only created on the server when its first message is sent.
 */
export const useAISessions = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { sessions, pagination, isSessionsLoading, hasLoadedSessions, activeSessionId } = useSelector(
    (state) => state.aiAssistant,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!hasLoadedSessions) dispatch(fetchAISessions({ page: 1, limit: AI_LIMITS.SESSIONS_PAGE_SIZE }));
  }, [dispatch, hasLoadedSessions]);

  const groups = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const hasMore = pagination.page < pagination.totalPages;

  const loadMore = useCallback(() => {
    if (isSessionsLoading || !hasMore) return;
    dispatch(fetchAISessions({ page: pagination.page + 1, limit: pagination.limit }));
  }, [dispatch, isSessionsLoading, hasMore, pagination.page, pagination.limit]);

  const selectSession = useCallback((id) => dispatch(setActiveAISession(id)), [dispatch]);
  const startNewSession = useCallback(() => dispatch(setActiveAISession(null)), [dispatch]);

  const requestDelete = useCallback((id) => setPendingDeleteId(id), []);
  const cancelDelete = useCallback(() => setPendingDeleteId(null), []);
  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAISession(pendingDeleteId)).unwrap();
      toast.success('Đã xóa cuộc trò chuyện.');
      setPendingDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMsg(AI_ERROR_MESSAGES, err, 'Không thể xóa cuộc trò chuyện. Vui lòng thử lại.'));
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, pendingDeleteId, toast]);

  return {
    sessions,
    groups,
    activeSessionId,
    isLoading: isSessionsLoading && !hasLoadedSessions,
    isLoadingMore: isSessionsLoading && hasLoadedSessions,
    hasMore,
    loadMore,
    selectSession,
    startNewSession,
    pendingDeleteId,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};

export default useAISessions;
