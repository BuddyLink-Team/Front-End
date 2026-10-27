import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setActiveAISession } from '../redux/aiAssistantSlice';
import { AI_SESSION_PARAM } from '../constants/aiAssistantConstants';

/**
 * Full-screen page: the open conversation follows ?session=<id>, so a refresh or a shared link
 * reopens it, and a conversation picked (or created) in the page updates the URL.
 */
export const useAISessionUrlSync = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSessionId = useSelector((state) => state.aiAssistant.activeSessionId);
  const urlSessionId = searchParams.get(AI_SESSION_PARAM);
  const hasReadUrl = useRef(false);

  useEffect(() => {
    // URL -> store once, when the page opens with ?session=
    if (!hasReadUrl.current) {
      hasReadUrl.current = true;
      if (urlSessionId && urlSessionId !== activeSessionId) {
        dispatch(setActiveAISession(urlSessionId));
        return;
      }
    }

    // Store -> URL afterwards
    if ((activeSessionId || null) === (urlSessionId || null)) return;
    const next = new URLSearchParams(searchParams);
    if (activeSessionId) next.set(AI_SESSION_PARAM, activeSessionId);
    else next.delete(AI_SESSION_PARAM);
    setSearchParams(next, { replace: true });
  }, [dispatch, activeSessionId, urlSessionId, searchParams, setSearchParams]);
};

export default useAISessionUrlSync;
