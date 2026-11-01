import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../../../services/socket';
import { endSession } from '../../../services/apiClient';
import { useToast } from '../../../hooks/useToast';
import { SOCKET_EVENTS } from '../../chat/constants/chat.constants';

// Long enough to read why before going to the login page
const SIGN_OUT_DELAY_MS = 3000;

/**
 * An admin locked this account: tell the parent why and end the session.
 * Listeners attach once the user is signed in, as in useNotificationSocket.
 */
export const useAccountLockSocket = () => {
  const { error: toastError } = useToast();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = socketService.getSocket();
    if (!socket) return undefined;

    let signOutTimer = null;
    const handleAccountLocked = ({ reason } = {}) => {
      toastError(reason || 'Tài khoản của bạn đã bị khóa.');
      signOutTimer = setTimeout(endSession, SIGN_OUT_DELAY_MS);
    };

    socket.on(SOCKET_EVENTS.ACCOUNT_LOCKED, handleAccountLocked);
    return () => {
      socket.off(SOCKET_EVENTS.ACCOUNT_LOCKED, handleAccountLocked);
      clearTimeout(signOutTimer);
    };
  }, [isAuthenticated, toastError]);
};

export default useAccountLockSocket;
