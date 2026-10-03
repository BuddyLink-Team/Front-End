import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast.js';
import { useMediaQuery } from '../../../hooks/useMediaQuery.js';
import chatApi from '../api/chatApi.js';
import useChatSocket from './useChatSocket.js';
import {
  CONVERSATION_TYPES,
  MESSAGE_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '../constants/chatConstants.js';

export const useChat = (initialConversationId = null) => {
  const toast = useToast();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const currentParent = useSelector((state) => state.auth?.parent);
  const currentParentId = currentParent?._id || currentParent?.id;

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Tab & Search Filtering
  const [selectedTab, setSelectedTab] = useState(CONVERSATION_TYPES.ALL);
  const [searchQuery, setSearchQuery] = useState('');

  // Messages State
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  // Realtime Typing Indicator
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const emitReadStatusRef = useRef(null);

  // Attachment State
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Sync activeConversationId if initial prop changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId((prev) => (prev !== initialConversationId ? initialConversationId : prev));
    }
  }, [initialConversationId]);

  // 1. Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const res = await chatApi.getConversations();
      const list = res?.data || res || [];
      setConversations(list);

      // Auto-select first conversation on desktop if none selected
      if (isDesktop && list.length > 0) {
        setActiveConversationId((curr) => curr || list[0].id);
      }
    } catch {
      // Silently handle conversation fetch failure
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Update active conversation details from list or fetch if not present
  useEffect(() => {
    if (!activeConversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    const found = conversations.find((c) => c.id === activeConversationId);
    if (found) {
      setActiveConversation(found);
    } else {
      chatApi.getConversation(activeConversationId)
        .then((res) => {
          const conv = res?.data || res;
          setActiveConversation(conv);
        })
        .catch(() => {});
    }
  }, [activeConversationId, conversations]);

  // 2. Fetch Messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    setIsLoadingMessages(true);
    setHasMoreMessages(false);

    chatApi.getMessages(activeConversationId, { limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        const msgList = res?.data || res || [];
        setMessages(msgList);
        setHasMoreMessages(msgList.length >= 50);

        // Mark as read on backend & emit socket read status
        chatApi.markAsRead(activeConversationId).catch(() => {});
        emitReadStatusRef.current?.(activeConversationId);

        // Decrement local conversation unread count
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // Load older messages (pagination with before & limit)
  const loadOlderMessages = useCallback(async () => {
    if (!activeConversationId || isLoadingOlder || !hasMoreMessages || messages.length === 0) {
      return;
    }

    try {
      setIsLoadingOlder(true);
      const oldestMessage = messages[0];
      const before = oldestMessage?.createdAt;

      const res = await chatApi.getMessages(activeConversationId, { limit: 50, before });
      const olderList = res?.data || res || [];

      if (olderList.length < 50) {
        setHasMoreMessages(false);
      }

      if (olderList.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newUnique = olderList.filter((m) => !existingIds.has(m.id));
          return [...newUnique, ...prev];
        });
      }
    } catch {
      toast.error('Không thể tải thêm tin nhắn cũ');
    } finally {
      setIsLoadingOlder(false);
    }
  }, [activeConversationId, isLoadingOlder, hasMoreMessages, messages, toast]);


  // 3. Socket Event Handlers
  const handleMessageReceived = useCallback((newMessage) => {
    if (!newMessage) return;

    // If belongs to currently opened conversation, add to stream
    if (newMessage.conversationId === activeConversationId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // Mark as read immediately on backend and via socket
      chatApi.markAsRead(activeConversationId).catch(() => {});
      emitReadStatusRef.current?.(activeConversationId);
    }

    // Update conversation in list (last message & unread badge)
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === newMessage.conversationId);
      if (idx === -1) {
        // Conversation not in list yet, refresh list
        fetchConversations();
        return prev;
      }

      const updated = [...prev];
      const isCurrent = newMessage.conversationId === activeConversationId;
      const unreadCount = isCurrent ? 0 : (updated[idx].unreadCount || 0) + 1;

      const item = {
        ...updated[idx],
        lastMessage: {
          messageId: newMessage.id,
          senderId: newMessage.senderId,
          senderName: newMessage.sender?.fullName || '',
          content: newMessage.content,
          type: newMessage.type,
          sentAt: newMessage.createdAt,
        },
        unreadCount,
        updatedAt: newMessage.createdAt,
      };

      // Move updated conversation to top
      updated.splice(idx, 1);
      return [item, ...updated];
    });
  }, [activeConversationId, fetchConversations]);

  const handleUserTyping = useCallback((data) => {
    if (data.parentId !== currentParentId) {
      setIsPartnerTyping(Boolean(data.isTyping));

      // Auto clear typing state after 3 seconds of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (data.isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 3000);
      }
    }
  }, [currentParentId]);

  const handleMessageRead = useCallback((data) => {
    if (data.conversationId === activeConversationId) {
      setMessages((prev) =>
        prev.map((m) => {
          const senderId =
            m.senderId?._id ||
            m.senderId?.id ||
            m.senderId ||
            m.sender?.id ||
            m.sender?.parent ||
            m.sender?._id;

          // Only my outgoing messages turn into "Đã xem" when the other participant reads
          const isMyMessage = currentParentId
            ? String(senderId) === String(currentParentId)
            : Boolean(m.isMine);

          if (isMyMessage && String(data.parentId) !== String(currentParentId)) {
            return {
              ...m,
              isRead: true,
            };
          }
          return m;
        })
      );
    }
  }, [activeConversationId, currentParentId]);

  const handleConversationUpdated = useCallback((updatedConv) => {
    if (!updatedConv) return;
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === updatedConv.id);
      if (!exists) {
        return [updatedConv, ...prev];
      }
      return prev.map((c) => (c.id === updatedConv.id ? { ...c, ...updatedConv } : c));
    });
  }, []);

  const { emitSendMessage, emitTyping, emitReadStatus } = useChatSocket({
    conversationId: activeConversationId,
    onMessageReceived: handleMessageReceived,
    onUserTyping: handleUserTyping,
    onMessageRead: handleMessageRead,
    onConversationUpdated: handleConversationUpdated,
  });

  useEffect(() => {
    emitReadStatusRef.current = emitReadStatus;
  }, [emitReadStatus]);

  // 4. Send Message Handler (with image upload if attached)
  const handleSendMessage = async (text) => {
    if (!activeConversationId) return;
    const trimmed = (text || '').trim();
    if (!trimmed && !selectedImageFile) return;

    setIsSending(true);
    emitTyping({ conversationId: activeConversationId, isTyping: false });

    try {
      let mediaUrl = null;

      // Upload image attachment first if selected
      if (selectedImageFile) {
        const uploadRes = await chatApi.uploadImage(selectedImageFile);
        mediaUrl = uploadRes?.data?.mediaUrl || uploadRes?.mediaUrl;
      }

      const payload = {
        conversationId: activeConversationId,
        content: trimmed || (mediaUrl ? '[Hình ảnh]' : ''),
        type: mediaUrl ? MESSAGE_TYPES.IMAGE : MESSAGE_TYPES.TEXT,
        mediaUrl,
      };

      // Send via socket with REST fallback
      emitSendMessage(payload, async (ack) => {
        if (!ack || !ack.success) {
          // If blocked or business rejection, display error directly
          if (ack?.code === 'USER_BLOCKED' || ack?.error?.includes('chặn') || ack?.error?.includes('blocked')) {
            toast.error(ack.error || 'Không thể gửi tin nhắn vì một trong hai người đã chặn nhau.');
            return;
          }

          // Fallback to REST API
          try {
            const restRes = await chatApi.sendMessage(activeConversationId, payload);
            const msg = restRes?.data || restRes;
            handleMessageReceived(msg);
          } catch (err) {
            const errorMsg =
              err?.response?.data?.message ||
              err?.message ||
              'Không thể gửi tin nhắn. Vui lòng thử lại.';
            toast.error(errorMsg);
          }
        }
      });

      // Clear image attachment preview
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    } catch (error) {
      toast.error(error?.message || 'Gửi tin nhắn thất bại.');
    } finally {

      setIsSending(false);
    }
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

      // Filter by Search Query (Partner name, Child name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const partnerName = conv.partner?.fullName?.toLowerCase() || '';
        const lastMsg = conv.lastMessage?.content?.toLowerCase() || '';
        return partnerName.includes(query) || lastMsg.includes(query);
      }

      return true;
    });
  }, [conversations, selectedTab, searchQuery]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

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
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    isPartnerTyping,
    hasMoreMessages,
    isLoadingOlder,
    loadOlderMessages,
    selectedImageFile,
    imagePreviewUrl,
    handleSelectImage,
    handleClearImage,
    handleSendMessage,
    handleSendTyping,
    refreshConversations: fetchConversations,
  };
};

export default useChat;
