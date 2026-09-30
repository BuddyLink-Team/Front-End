import { useEffect, useRef, useCallback } from 'react';
import socketService from '../../../services/socket.js';
import { SOCKET_EVENTS } from '../constants/chatConstants.js';

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

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);

    return () => {
      if (conversationId && socket) {
        socket.emit(SOCKET_EVENTS.LEAVE_CHAT, { conversationId });
      }
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
    };
  }, [conversationId, onMessageReceived, onUserTyping, onMessageRead, onConversationUpdated]);

  const emitSendMessage = useCallback((payload, callback) => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, payload, callback);
    }
  }, []);

  const emitTyping = useCallback((payload) => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.TYPING, payload);
    }
  }, []);

  const emitReadStatus = useCallback((activeConvId) => {
    if (socketRef.current && activeConvId) {
      socketRef.current.emit(SOCKET_EVENTS.READ_STATUS, { conversationId: activeConvId });
    }
  }, []);

  return {
    emitSendMessage,
    emitTyping,
    emitReadStatus,
  };
};

export default useChatSocket;
