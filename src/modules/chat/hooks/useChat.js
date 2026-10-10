import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast.js';
import { useMediaQuery } from '../../../hooks/useMediaQuery.js';
import { getApiErrorMsg } from '../../../utils/errorUtils.js';
import useChatSocket, { SOCKET_ERROR_CODES } from './useChatSocket.js';
import { useSafetyActions } from '../../safety/hooks/useSafetyActions.js';
import { REPORT_TARGET_TYPES } from '../../safety/constants/safetyConstants.js';
import {
  CONVERSATION_TYPES,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  CHAT_ERROR_MESSAGES,
  PLAYDATE_REPORT,
} from '../constants/chatConstants.js';
import {
  createTempId,
  buildOptimisticMessage,
  getOldestPersistedMessageId,
} from '../utils/chatMessageUtils.js';
import {
  fetchConversations,
  fetchConversationById,
  fetchPlaydateConversation,
  fetchMessages,
  fetchOlderMessages,
  sendMessageRest,
  markConversationReadRest,
  uploadChatImage,
  conversationUpdated,
  messageReceived,
  optimisticMessageAdded,
  messageStatusChanged,
  messagesReadByPartner,
  activeConversationClosed,
  CHAT_LIST_STATUS,
} from '../redux/chatSlice.js';

const getSenderId = (message) =>
  message?.senderId?._id || message?.senderId?.id || message?.senderId || message?.sender?.id;

/**
 * Chat screen logic. Conversations, messages and REST calls live in the chat slice;
 * this hook keeps UI-only state (tab, search, typing, image picker) and wires the socket.
 * @param {Object} [options]
 * @param {string} [options.initialConversationId] - Opened by /chat/:conversationId
 * @param {string} [options.initialPlaydateId] - Opened by /chat/playdate/:playdateId
 */
export const useChat = ({ initialConversationId = null, initialPlaydateId = null } = {}) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { reportUser } = useSafetyActions();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const currentParent = useSelector((state) => state.auth?.parent);
  const currentParentId = currentParent?._id || currentParent?.id;

  const {
    conversations,
    conversationsStatus,
    activeConversationDetail,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    isLoadingOlder,
  } = useSelector((state) => state.chat);

  // UI state
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [selectedTab, setSelectedTab] = useState(
    initialPlaydateId ? CONVERSATION_TYPES.PLAYDATE : CONVERSATION_TYPES.ALL,
  );
  const [playdateError, setPlaydateError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const typingTimeoutRef = useRef(null);
  // Socket actions are created after the handlers below, so handlers reach them through a ref
  const socketActionsRef = useRef(null);

  const toErrorMessage = useCallback(
    (error, fallback) => getApiErrorMsg(CHAT_ERROR_MESSAGES, error, fallback),
    [],
  );

  // Sync activeConversationId if initial prop changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId((prev) => (prev !== initialConversationId ? initialConversationId : prev));
    }
  }, [initialConversationId]);

  // Read through a ref so that switching playdate does not re-fetch the whole list
  const initialPlaydateIdRef = useRef(initialPlaydateId);
  useEffect(() => {
    initialPlaydateIdRef.current = initialPlaydateId;
  }, [initialPlaydateId]);

  // 1. Conversations list
  const refreshConversations = useCallback(async () => {
    try {
      const list = await dispatch(fetchConversations()).unwrap();
      // Auto-select first conversation on desktop if none selected (not while a playdate chat opens)
      if (isDesktop && !initialPlaydateIdRef.current && list?.length > 0) {
        setActiveConversationId((current) => current || list[0].id);
      }
    } catch {
      // The list shows its empty state; nothing else to do
    }
  }, [dispatch, isDesktop]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Playdate group chat opened by URL: resolve (and create on first access) its conversation.
  // Only the host and accepted participants are allowed; others get an explanatory error state.
  useEffect(() => {
    setPlaydateError(null);
    if (!initialPlaydateId) return undefined;

    let isCurrent = true;
    dispatch(fetchPlaydateConversation(initialPlaydateId))
      .unwrap()
      .then((conversation) => {
        if (!isCurrent || !conversation?.id) return;
        setActiveConversationId(conversation.id);
        // Keep "All" when the group was picked from it; only leave a tab that would hide the group
        setSelectedTab((current) =>
          current === CONVERSATION_TYPES.ALL ? current : CONVERSATION_TYPES.PLAYDATE,
        );
      })
      .catch((error) => {
        if (!isCurrent) return;
        setActiveConversationId(null);
        setPlaydateError(toErrorMessage(error, 'Không thể tham gia nhóm chat của cuộc hẹn này.'));
      });

    return () => {
      isCurrent = false;
    };
  }, [initialPlaydateId, dispatch, toErrorMessage]);

  // Mark a conversation as read once: via socket when connected (server also broadcasts the
  // read receipt), otherwise via REST
  const markConversationRead = useCallback(
    (conversationId) => {
      if (!conversationId) return;
      const socketActions = socketActionsRef.current;
      if (socketActions?.isConnected()) {
        socketActions.emitReadStatus(conversationId);
      } else {
        dispatch(markConversationReadRest(conversationId));
      }
    },
    [dispatch],
  );

  const isOwnMessage = useCallback(
    (message) => Boolean(currentParentId) && String(getSenderId(message)) === String(currentParentId),
    [currentParentId],
  );

  // Active conversation: from the list (kept fresh by socket updates), or fetched when opened by URL.
  // List/socket payloads only carry a playdate summary, so the detailed playdate (host, participants)
  // of the fetched conversation is kept for the event panel.
  const conversationFromList = conversations.find((c) => c.id === activeConversationId);
  const detailOfActive = activeConversationDetail?.id === activeConversationId ? activeConversationDetail : null;
  const activeConversation = useMemo(() => {
    if (!conversationFromList) return detailOfActive;
    if (!detailOfActive?.playdate) return conversationFromList;
    return { ...conversationFromList, playdate: detailOfActive.playdate };
  }, [conversationFromList, detailOfActive]);

  const needsDetail =
    !conversationFromList || conversationFromList.type === CONVERSATION_TYPES.PLAYDATE;
  const hasDetail = Boolean(detailOfActive);

  useEffect(() => {
    // The playdate route fetches its own detail; avoid a duplicate request while it loads
    if (initialPlaydateId) return;
    if (activeConversationId && needsDetail && !hasDetail && conversationsStatus === CHAT_LIST_STATUS.SUCCEEDED) {
      dispatch(fetchConversationById(activeConversationId));
    }
  }, [activeConversationId, needsDetail, hasDetail, conversationsStatus, initialPlaydateId, dispatch]);

  // 2. Messages of the active conversation
  useEffect(() => {
    if (!activeConversationId) {
      dispatch(activeConversationClosed());
      return;
    }

    dispatch(fetchMessages(activeConversationId))
      .unwrap()
      .then(() => markConversationRead(activeConversationId))
      .catch(() => {});
  }, [activeConversationId, dispatch, markConversationRead]);

  // Load older messages (cursor pagination: before = oldest persisted message id)
  const loadOlderMessages = useCallback(async () => {
    const before = getOldestPersistedMessageId(messages);
    if (!activeConversationId || isLoadingOlder || !hasMoreMessages || !before) {
      return;
    }

    try {
      await dispatch(fetchOlderMessages({ conversationId: activeConversationId, before })).unwrap();
    } catch {
      toast.error('Không thể tải thêm tin nhắn cũ');
    }
  }, [activeConversationId, isLoadingOlder, hasMoreMessages, messages, dispatch, toast]);

  // 3. Socket Event Handlers
  const handleMessageReceived = useCallback(
    (newMessage) => {
      if (!newMessage) return;

      const isMine = isOwnMessage(newMessage);
      const isKnownConversation = conversations.some((c) => c.id === newMessage.conversationId);

      dispatch(messageReceived({ message: newMessage, isMine }));

      // Only incoming messages of the open conversation need a read receipt
      if (newMessage.conversationId === activeConversationId && !isMine) {
        markConversationRead(activeConversationId);
      }

      // A conversation we do not have yet (e.g. started by the partner): reload the list
      if (!isKnownConversation) {
        refreshConversations();
      }
    },
    [activeConversationId, conversations, dispatch, isOwnMessage, markConversationRead, refreshConversations],
  );

  // Socket acks resolve after the user may have switched conversation, so they must call
  // the latest handler rather than the one captured when the message was sent
  const handleMessageReceivedRef = useRef(handleMessageReceived);
  useEffect(() => {
    handleMessageReceivedRef.current = handleMessageReceived;
  }, [handleMessageReceived]);

  const handleUserTyping = useCallback(
    (data) => {
      if (data.parentId === currentParentId) return;

      setIsPartnerTyping(Boolean(data.isTyping));

      // Auto clear typing state after 3 seconds of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (data.isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 3000);
      }
    },
    [currentParentId],
  );

  const handleMessageRead = useCallback(
    (data) => {
      dispatch(
        messagesReadByPartner({
          conversationId: data.conversationId,
          readerId: data.parentId,
          currentParentId,
        }),
      );
    },
    [dispatch, currentParentId],
  );

  const handleConversationUpdated = useCallback(
    (updatedConversation) => {
      dispatch(conversationUpdated(updatedConversation));
    },
    [dispatch],
  );

  const { isConnected, emitSendMessage, emitTyping, emitReadStatus } = useChatSocket({
    conversationId: activeConversationId,
    onMessageReceived: handleMessageReceived,
    onUserTyping: handleUserTyping,
    onMessageRead: handleMessageRead,
    onConversationUpdated: handleConversationUpdated,
  });

  useEffect(() => {
    socketActionsRef.current = { isConnected, emitReadStatus };
  }, [isConnected, emitReadStatus]);

  // 4. Deliver a message whose optimistic copy is already in the stream, then reconcile by tempId.
  // - Socket disconnected: nothing was sent yet, so REST is used.
  // - Inline (data URL) images from the dev storage fallback are too large for a socket frame: REST.
  // - Socket timeout: the server may still have saved it, so it is only marked as failed and never
  //   re-sent automatically; a late echo with the same tempId replaces it.
  // - Business error from the server (blocked, too long...): marked as failed with its message.
  const deliverMessage = useCallback(
    (payload) => {
      const { tempId, conversationId } = payload;

      const markFailed = (error) => {
        dispatch(messageStatusChanged({ tempId, status: MESSAGE_STATUS.FAILED }));
        if (error) {
          toast.error(toErrorMessage(error, 'Không thể gửi tin nhắn. Vui lòng thử lại.'));
        }
      };

      const sendViaRest = async () => {
        try {
          const savedMessage = await dispatch(sendMessageRest({ conversationId, payload })).unwrap();
          handleMessageReceivedRef.current({ ...savedMessage, tempId });
        } catch (error) {
          markFailed(error);
        }
      };

      if (payload.mediaUrl?.startsWith('data:')) {
        sendViaRest();
        return;
      }

      emitSendMessage(payload, (ack) => {
        if (ack?.success) {
          handleMessageReceivedRef.current(ack.data);
          return;
        }
        if (ack?.code === SOCKET_ERROR_CODES.DISCONNECTED) {
          sendViaRest();
          return;
        }
        if (ack?.code === SOCKET_ERROR_CODES.TIMEOUT) {
          markFailed();
          return;
        }
        markFailed(ack || {});
      });
    },
    [dispatch, emitSendMessage, toast, toErrorMessage],
  );

  // Send Message Handler (with image upload if attached)
  const handleSendMessage = async (text) => {
    if (!activeConversationId) return;
    const trimmed = (text || '').trim();
    if (!trimmed && !selectedImageFile) return;

    const conversationId = activeConversationId;
    emitTyping({ conversationId, isTyping: false });

    let mediaUrl = null;

    // Upload image attachment first if selected (kept in the composer if the upload fails)
    if (selectedImageFile) {
      setIsSending(true);
      try {
        const uploadResult = await dispatch(uploadChatImage(selectedImageFile)).unwrap();
        mediaUrl = uploadResult?.mediaUrl;
      } catch (error) {
        toast.error(toErrorMessage(error, 'Tải ảnh lên thất bại. Vui lòng thử lại.'));
        return;
      } finally {
        setIsSending(false);
      }
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }

    const payload = {
      tempId: createTempId(),
      conversationId,
      content: trimmed || (mediaUrl ? '[Hình ảnh]' : ''),
      type: mediaUrl ? MESSAGE_TYPES.IMAGE : MESSAGE_TYPES.TEXT,
      mediaUrl,
    };

    dispatch(optimisticMessageAdded(buildOptimisticMessage({ ...payload, senderId: currentParentId })));
    deliverMessage(payload);
  };

  // Manually re-send a failed optimistic message with the same tempId
  const handleRetryMessage = (tempId) => {
    const failedMessage = messages.find(
      (m) => m.tempId === tempId && m.status === MESSAGE_STATUS.FAILED,
    );
    if (!failedMessage) return;

    dispatch(messageStatusChanged({ tempId, status: MESSAGE_STATUS.SENDING }));
    deliverMessage({
      tempId,
      conversationId: failedMessage.conversationId,
      content: failedMessage.content,
      type: failedMessage.type,
      mediaUrl: failedMessage.mediaUrl,
    });
  };

  // Image Selection & Preview
  const handleSelectImage = (file) => {
    if (!file) return;
    const isValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);
    const hasValidExt = /\.(jpe?g|png|webp|gif)$/i.test(file.name || '');

    if (!isValidMime || !hasValidExt) {
      toast.error('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
  };

  // Handle local typing notification
  const handleSendTyping = (isTyping) => {
    if (activeConversationId) {
      emitTyping({ conversationId: activeConversationId, isTyping });
    }
  };

  // 5. Memoized Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Filter by Tab
      if (selectedTab !== CONVERSATION_TYPES.ALL && conv.type !== selectedTab) {
        return false;
      }

      // Filter by Search Query (partner name or playdate title, last message)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title =
          conv.type === CONVERSATION_TYPES.PLAYDATE ? conv.playdate?.title : conv.partner?.fullName;
        const lastMsg = conv.lastMessage?.content?.toLowerCase() || '';
        return (title || '').toLowerCase().includes(query) || lastMsg.includes(query);
      }

      return true;
    });
  }, [conversations, selectedTab, searchQuery]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  // A report needs a reported parent: a playdate group chat is reported against its host,
  // so the host has nobody to report it to
  const playdateHostId = activeConversation?.playdate?.host?.id;
  const canReportPlaydateChat =
    Boolean(playdateHostId) && String(playdateHostId) !== String(currentParentId);

  const reportPlaydateChat = useCallback(() => {
    const playdate = activeConversation?.playdate;
    return reportUser({
      reportedUserId: playdate?.host?.id,
      targetType: REPORT_TARGET_TYPES.PLAYDATE,
      targetPlaydateId: playdate?.id,
      reason: PLAYDATE_REPORT.REASON,
      description: PLAYDATE_REPORT.DESCRIPTION,
    });
  }, [activeConversation, reportUser]);

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    totalUnreadCount,
    activeConversationId,
    activeConversation,
    setActiveConversationId,
    selectedTab,
    setSelectedTab,
    searchQuery,
    setSearchQuery,
    messages,
    isLoadingConversations:
      conversationsStatus === CHAT_LIST_STATUS.IDLE || conversationsStatus === CHAT_LIST_STATUS.LOADING,
    isLoadingMessages,
    isSending,
    isPartnerTyping,
    hasMoreMessages,
    isLoadingOlder,
    loadOlderMessages,
    selectedImageFile,
    imagePreviewUrl,
    playdateError,
    currentParentId,
    canReportPlaydateChat,
    reportPlaydateChat,
    handleSelectImage,
    handleClearImage,
    handleSendMessage,
    handleRetryMessage,
    handleSendTyping,
    refreshConversations,
  };
};

export default useChat;
