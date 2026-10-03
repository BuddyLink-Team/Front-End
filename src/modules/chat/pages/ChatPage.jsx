import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useChat from '../hooks/useChat.js';
import ConversationList from '../components/ConversationList.jsx';
import DirectChatView from '../components/DirectChatView.jsx';
import EmptyChatState from '../components/EmptyChatState.jsx';

export const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    conversations,
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
  } = useChat(conversationId);

  // Sync route param with active conversation
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, activeConversationId, setActiveConversationId]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    navigate(`/chat/${id}`, { replace: true });
  };

  const handleBackToConversations = () => {
    setActiveConversationId(null);
    navigate('/chat', { replace: true });
  };

  return (
    <div className="chat-layout-height w-full flex gap-4 overflow-hidden">
      {/* Cột trái (320px-380px): Danh sách hội thoại */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalUnreadCount={totalUnreadCount}
        isLoading={isLoadingConversations}
        className={activeConversationId ? 'hidden lg:flex' : 'flex'}
      />

      {/* Cột phải: Khung chat trực tiếp (hoặc Empty state) */}
      {activeConversation ? (
        <DirectChatView
          conversation={activeConversation}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          isSending={isSending}
          isPartnerTyping={isPartnerTyping}
          hasMoreMessages={hasMoreMessages}
          isLoadingOlder={isLoadingOlder}
          onLoadOlderMessages={loadOlderMessages}
          selectedImageFile={selectedImageFile}
          imagePreviewUrl={imagePreviewUrl}
          onSelectImage={handleSelectImage}
          onClearImage={handleClearImage}
          onSendMessage={handleSendMessage}
          onSendTyping={handleSendTyping}
          onBack={handleBackToConversations}
          className={!activeConversationId ? 'hidden lg:flex' : 'flex'}
        />
      ) : (
        <div className="hidden lg:flex flex-1 h-full">
          <EmptyChatState />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
