import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, Calendar, ArrowLeft } from 'lucide-react';
import useChat from '../hooks/useChat.js';
import ConversationList from '../components/ConversationList.jsx';
import DirectChatView from '../components/DirectChatView.jsx';
import PlaydateChatView from '../components/PlaydateChatView.jsx';
import EmptyChatState from '../components/EmptyChatState.jsx';
import { CONVERSATION_TYPES } from '../constants/chatConstants.js';
import { Button } from '../../../components/ui/Button';

export const ChatPage = () => {
  const { conversationId, playdateId } = useParams();
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
    selectedImageFile,
    imagePreviewUrl,
    playdateError,
    handleSelectImage,
    handleClearImage,
    handleSendMessage,
    handleSendTyping,
  } = useChat({
    initialConversationId: conversationId,
    initialPlaydateId: playdateId,
  });

  // Sync route param with active conversation
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, activeConversationId, setActiveConversationId]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    const target = conversations.find((c) => c.id === id);
    if (target?.type === CONVERSATION_TYPES.PLAYDATE && target.playdate?.id) {
      navigate(`/chat/playdate/${target.playdate.id}`, { replace: true });
    } else {
      navigate(`/chat/${id}`, { replace: true });
    }
  };

  const handleBackToConversations = () => {
    setActiveConversationId(null);
    navigate('/chat', { replace: true });
  };

  const isPlaydateChat =
    Boolean(playdateId) ||
    activeConversation?.type === CONVERSATION_TYPES.PLAYDATE ||
    Boolean(activeConversation?.playdate);

  return (
    <div className="chat-layout-height max-w-[1240px] mx-auto px-3 sm:px-6 py-3 flex gap-4 overflow-hidden">
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
        className={activeConversationId || playdateError ? 'hidden lg:flex' : 'flex'}
      />

      {/* Cột phải: Playdate Group Chat / Direct Chat / Error State / Empty State */}
      {playdateError ? (
        <div className="flex-1 bg-surface-container-lowest rounded-2xl p-8 border border-hairline flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-error-container/40 flex items-center justify-center text-error mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">
            Không có quyền truy cập nhóm chat
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            {playdateError}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleBackToConversations}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Về danh sách chat
            </Button>
            {playdateId && (
              <Button
                variant="primary"
                onClick={() => navigate(`/playdates/${playdateId}`)}
                icon={<Calendar className="w-4 h-4" />}
              >
                Xem chi tiết cuộc hẹn
              </Button>
            )}
          </div>
        </div>
      ) : activeConversation ? (
        isPlaydateChat ? (
          <PlaydateChatView
            conversation={activeConversation}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            isPartnerTyping={isPartnerTyping}
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
          <DirectChatView
            conversation={activeConversation}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            isPartnerTyping={isPartnerTyping}
            selectedImageFile={selectedImageFile}
            imagePreviewUrl={imagePreviewUrl}
            onSelectImage={handleSelectImage}
            onClearImage={handleClearImage}
            onSendMessage={handleSendMessage}
            onSendTyping={handleSendTyping}
            onBack={handleBackToConversations}
            className={!activeConversationId ? 'hidden lg:flex' : 'flex'}
          />
        )
      ) : (
        <div className="hidden lg:flex flex-1 h-full">
          <EmptyChatState />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
