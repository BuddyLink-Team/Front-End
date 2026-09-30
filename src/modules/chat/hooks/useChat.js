import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import chatApi from '../api/chatApi.js';
import useChatSocket from './useChatSocket.js';
import { CONVERSATION_TYPES, MESSAGE_TYPES } from '../constants/chatConstants.js';

export const useChat = (arg1 = null, arg2 = null) => {
  const options = typeof arg1 === 'object' && arg1 !== null
    ? arg1
    : { initialConversationId: arg1, initialPlaydateId: arg2 };
  const { initialConversationId = null, initialPlaydateId = null } = options;

  const currentParent = useSelector((state) => state.auth?.parent);
  const currentParentId = currentParent?._id || currentParent?.id;

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [playdateError, setPlaydateError] = useState(null);

  // Tab & Search Filtering
  const [selectedTab, setSelectedTab] = useState(
    initialPlaydateId ? CONVERSATION_TYPES.PLAYDATE : CONVERSATION_TYPES.ALL
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Messages State
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Realtime Typing Indicator
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Attachment State
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Sync activeConversationId if initial prop changes
  useEffect(() => {
    if (initialConversationId && initialConversationId !== activeConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  // 1. Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const res = await chatApi.getConversations();
      const list = res?.data || res || [];
      setConversations(list);

      // Auto-select first conversation on desktop if none selected and not viewing playdate
      if (!activeConversationId && !initialConversationId && !initialPlaydateId && list.length > 0 && window.innerWidth >= 1024) {
        setActiveConversationId(list[0].id);
      }
    } catch (error) {
      console.error('[Chat] Failed to fetch conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeConversationId, initialConversationId, initialPlaydateId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle Playdate Conversation initialization (TASK-BE-11 & TASK-FE-11)
  useEffect(() => {
    if (!initialPlaydateId) return;

    let isMounted = true;
    setIsLoadingConversations(true);
    setPlaydateError(null);

    chatApi.getPlaydateConversation(initialPlaydateId)
      .then((res) => {
        if (!isMounted) return;
        const conv = res?.data || res;
        if (conv?.id) {
          setActiveConversation(conv);
          setActiveConversationId(conv.id);
          setSelectedTab(CONVERSATION_TYPES.PLAYDATE);

          // Add to conversations list if not present
          setConversations((prev) => {
            if (prev.some((c) => c.id === conv.id)) {
              return prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c));
            }
            return [conv, ...prev];
          });
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error('[Chat] Failed to get playdate conversation:', error);
        const errMsg = error?.response?.data?.message || 'Không thể tham gia nhóm chat cuộc hẹn này.';
        setPlaydateError(errMsg);
        toast.error(errMsg);
      })
      .finally(() => {
        if (isMounted) setIsLoadingConversations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialPlaydateId]);

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
        .catch((err) => console.error('[Chat] Error fetching conversation:', err));
    }
  }, [activeConversationId, conversations]);

  // 2. Fetch Messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    chatApi.getMessages(activeConversationId)
      .then((res) => {
        if (!isMounted) return;
        const msgList = res?.data || res || [];
        setMessages(msgList);

        // Mark as read on backend
        chatApi.markAsRead(activeConversationId).catch(() => {});

        // Decrement local conversation unread count
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch((error) => {
        console.error('[Chat] Failed to fetch messages:', error);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // 3. Socket Event Handlers
  const handleMessageReceived = useCallback((newMessage) => {
    if (!newMessage) return;

    // If belongs to currently opened conversation, add to stream
    if (newMessage.conversationId === activeConversationId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // Mark as read immediately
      chatApi.markAsRead(activeConversationId).catch(() => {});
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
        prev.map((m) => ({
          ...m,
          isRead: true,
        }))
      );
    }
  }, [activeConversationId]);

  const handleConversationUpdated = useCallback((updatedConv) => {
    if (!updatedConv) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? { ...c, ...updatedConv } : c))
    );
  }, []);

  const { emitSendMessage, emitTyping } = useChatSocket({
    conversationId: activeConversationId,
    onMessageReceived: handleMessageReceived,
    onUserTyping: handleUserTyping,
    onMessageRead: handleMessageRead,
    onConversationUpdated: handleConversationUpdated,
  });

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
          // Fallback to REST API
          try {
            const restRes = await chatApi.sendMessage(activeConversationId, payload);
            const msg = restRes?.data || restRes;
            handleMessageReceived(msg);
          } catch (err) {
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
          }
        }
      });

      // Clear image attachment preview
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    } catch (error) {
      console.error('[Chat] Send message failed:', error);
      toast.error('Gửi tin nhắn thất bại.');
    } finally {
      setIsSending(false);
    }
  };

  // Image Selection & Preview
  const handleSelectImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
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
    selectedImageFile,
    imagePreviewUrl,
    playdateError,
    setActiveConversation,
    handleSelectImage,
    handleClearImage,
    handleSendMessage,
    handleSendTyping,
    refreshConversations: fetchConversations,
  };
};

export default useChat;
