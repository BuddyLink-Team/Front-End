import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { openAIDrawer, closeAIDrawer } from '../redux/aiAssistantSlice';
import { AI_ROUTE, AI_SESSION_PARAM } from '../constants/aiAssistantConstants';
import { USER_ROLES } from '../../../constants/role.constants';

// The floating button would cover these pages' own composer / the assistant itself
const HIDDEN_FAB_PREFIXES = [AI_ROUTE, '/chat'];

/**
 * Slide-out assistant on the parent pages (floating button + right drawer)
 */
export const useAIAssistantDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOpen = useSelector((state) => state.aiAssistant.isDrawerOpen);
  const activeSessionId = useSelector((state) => state.aiAssistant.activeSessionId);
  // MainLayout also wraps the public pages (landing, login): the assistant is for signed-in parents only
  const isParent = useSelector((state) => state.auth.isAuthenticated && state.auth.user?.role === USER_ROLES.PARENT);

  const isFullScreenPage = pathname.startsWith(AI_ROUTE);
  const isFabVisible = isParent && !HIDDEN_FAB_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Never keep the drawer above the full-screen assistant
  useEffect(() => {
    if (isFullScreenPage && isOpen) dispatch(closeAIDrawer());
  }, [dispatch, isFullScreenPage, isOpen]);

  const open = useCallback(() => dispatch(openAIDrawer()), [dispatch]);
  const close = useCallback(() => dispatch(closeAIDrawer()), [dispatch]);
  const openFullScreen = useCallback(() => {
    dispatch(closeAIDrawer());
    navigate(activeSessionId ? `${AI_ROUTE}?${AI_SESSION_PARAM}=${activeSessionId}` : AI_ROUTE);
  }, [dispatch, navigate, activeSessionId]);

  return { isOpen: isOpen && isParent, isFabVisible, open, close, openFullScreen };
};

export default useAIAssistantDrawer;
