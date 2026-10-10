import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession, SESSION_STATUS } from '../redux/authSlice';

/**
 * Verify the session once when the app starts (stored tokens -> /auth/me).
 * @returns {{ isCheckingSession: boolean }}
 */
export const useSessionBootstrap = () => {
  const dispatch = useDispatch();
  const sessionStatus = useSelector((state) => state.auth.sessionStatus);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (sessionStatus === SESSION_STATUS.CHECKING && !hasStarted.current) {
      hasStarted.current = true;
      dispatch(restoreSession());
    }
  }, [dispatch, sessionStatus]);

  return { isCheckingSession: sessionStatus === SESSION_STATUS.CHECKING };
};

export default useSessionBootstrap;
