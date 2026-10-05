import { useEffect, useRef, useCallback } from 'react';
import socketService from '../../../services/socket.js';
import { SOCKET_EVENTS, SOCKET_ACK_TIMEOUT_MS } from '../constants/chatConstants.js';

// Transport failures (as opposed to business errors returned by the server in the ack)
export const SOCKET_ERROR_CODES = Object.freeze({
  DISCONNECTED: 'SOCKET_DISCONNECTED',
  TIMEOUT: 'SOCKET_TIMEOUT',
});

export const useChatSocket = ({
  conversationId,
  onMessageReceived,
  onUserTyping,
  onMessageRead,
  onConversationUpdated,
}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = socketService.getSocket();
    socketRef.current = socket;

    if (!socket) return;

    // Join current conversation room
    if (conversationId) {
      socket.emit(SOCKET_EVENTS.JOIN_CHAT, { conversationId });
    }

    // Listeners
    const handleReceiveMessage = (message) => {
      if (onMessageReceived) {
        onMessageReceived(message);
      }
    };

    const handleUserTyping = (data) => {
      if (onUserTyping && data.conversationId === conversationId) {
        onUserTyping(data);
      }
    };

    const handleMessageRead = (data) => {
      if (onMessageRead && data.conversationId === conversationId) {
        onMessageRead(data);
      }
    };

    const handleConversationUpdated = (data) => {
      if (onConversationUpdated) {
        onConversationUpdated(data);
      }
    };

    // Re-join active conversation room on socket reconnect
    const handleConnect = () => {
      if (conversationId) {
        socket.emit(SOCKET_EVENTS.JOIN_CHAT, { conversationId });
      }
    };

    socket.on('connect', handleConnect);
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);

    return () => {
      if (conversationId && socket) {
        socket.emit(SOCKET_EVENTS.LEAVE_CHAT, { conversationId });
      }
      socket.off('connect', handleConnect);
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
    };
  }, [conversationId, onMessageReceived, onUserTyping, onMessageRead, onConversationUpdated]);

  const isConnected = useCallback(() => Boolean(socketRef.current?.connected), []);

  const emitSendMessage = useCallback((payload, callback) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      if (typeof callback === 'function') {
        callback({ success: false, code: SOCKET_ERROR_CODES.DISCONNECTED });
      }
      return;
    }

    let hasTimedOut = false;
    const timeoutTimer = setTimeout(() => {
      hasTimedOut = true;
      if (typeof callback === 'function') {
        callback({ success: false, code: SOCKET_ERROR_CODES.TIMEOUT });
      }
    }, SOCKET_ACK_TIMEOUT_MS);

    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, payload, (response) => {
      if (hasTimedOut) return;
      clearTimeout(timeoutTimer);
      if (typeof callback === 'function') {
        callback(response);
      }
    });
  }, []);

  const emitTyping = useCallback((payload) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(SOCKET_EVENTS.TYPING, payload);
    }
  }, []);

  const emitReadStatus = useCallback((activeConvId) => {
    if (socketRef.current && socketRef.current.connected && activeConvId) {
      socketRef.current.emit(SOCKET_EVENTS.READ_STATUS, { conversationId: activeConvId });
    }
  }, []);

  return {
    isConnected,
    emitSendMessage,
    emitTyping,
    emitReadStatus,
  };
};

export default useChatSocket;
